import Anthropic from "@anthropic-ai/sdk";
import { type NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// AI nutrition estimator
// ---------------------------------------------------------------------------
// Server-side proxy to Claude. Keeps ANTHROPIC_API_KEY secret (the client
// never sees it) and uses *structured outputs* — the model is constrained to
// the JSON schema below, so we can JSON.parse the response without defensive
// regex/repair logic.
//
// Configure in Vercel → Project → Settings → Environment Variables:
//   ANTHROPIC_API_KEY = sk-ant-...
// Then redeploy. Without the key, the route returns 503 with a clear message
// so the UI can degrade gracefully instead of crashing.
// ---------------------------------------------------------------------------

const FOOD_SCHEMA = {
  type: "object",
  properties: {
    name: {
      type: "string",
      description:
        "Concise label for the meal, max 32 chars, capitalized like a title (e.g. 'Chicken & Rice').",
    },
    calories: {
      type: "integer",
      description: "Total estimated kcal for the described portion.",
    },
    protein: {
      type: "integer",
      description: "Total estimated protein in grams for the described portion.",
    },
    note: {
      type: "string",
      description:
        "Brief assumption about portion size if non-obvious. Optional, ≤60 chars.",
    },
  },
  required: ["name", "calories", "protein"],
  additionalProperties: false,
} as const;

const SYSTEM_PROMPT = `You are a nutrition estimator embedded in a fitness app's food log.

Given a short description of a meal the user ate, estimate the total calories (kcal) and protein (grams) for the described portion.

Rules:
- Return ONE total figure per meal, not per ingredient.
- If a quantity is given ("2 eggs", "300g rice"), use it exactly. Otherwise assume a standard adult serving.
- Be realistic and slightly conservative. Don't pad. Avoid suspiciously round numbers like 500/1000.
- If the input is gibberish or clearly not food, return calories: 0, protein: 0, and note: "couldn't identify food".

Respond only via the structured output schema. No prose, no preamble.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "AI estimation isn't configured on this deployment. Set ANTHROPIC_API_KEY in Vercel.",
      },
      { status: 503 },
    );
  }

  let body: { prompt?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) {
    return NextResponse.json(
      { error: "Tell me what you ate." },
      { status: 400 },
    );
  }
  if (prompt.length > 500) {
    return NextResponse.json(
      { error: "Description too long (500 char max)." },
      { status: 400 },
    );
  }

  const client = new Anthropic({ apiKey });

  try {
    // Use the default model (Opus 4.7). For cheaper/faster runs on this
    // simple extraction task, swap in "claude-haiku-4-5".
    const response = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
      // Structured outputs — the model is constrained to this schema, so the
      // returned text block is always valid JSON matching FOOD_SCHEMA.
      output_config: {
        format: {
          type: "json_schema",
          name: "food_estimate",
          schema: FOOD_SCHEMA,
        },
      },
    } as Anthropic.MessageCreateParamsNonStreaming);

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "AI returned no usable response." },
        { status: 502 },
      );
    }

    // Refusal: the model declined for safety reasons. Surface a generic
    // message — don't echo internal stop reasons back to the user.
    // (Cast: older SDK type literals don't include "refusal" yet.)
    if ((response.stop_reason as string | null) === "refusal") {
      return NextResponse.json(
        { error: "Couldn't estimate that. Try a different description." },
        { status: 422 },
      );
    }

    let parsed: { name?: unknown; calories?: unknown; protein?: unknown; note?: unknown };
    try {
      parsed = JSON.parse(textBlock.text);
    } catch {
      return NextResponse.json(
        { error: "AI returned malformed data." },
        { status: 502 },
      );
    }

    // Defensive normalization — schema guarantees these are present but we
    // still clamp/round to avoid surprising values reaching the UI.
    return NextResponse.json({
      name: String(parsed.name ?? "Food").slice(0, 32),
      calories: Math.max(0, Math.round(Number(parsed.calories) || 0)),
      protein: Math.max(0, Math.round(Number(parsed.protein) || 0)),
      note: parsed.note ? String(parsed.note).slice(0, 100) : undefined,
    });
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "AI auth failed — verify ANTHROPIC_API_KEY is valid." },
        { status: 503 },
      );
    }
    if (e instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Rate limited. Try again in a moment." },
        { status: 429 },
      );
    }
    if (e instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: "AI service error. Try again." },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { error: "Couldn't estimate that meal." },
      { status: 500 },
    );
  }
}
