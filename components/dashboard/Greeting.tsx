"use client";

import { useEffect, useState } from "react";

// Client-only so the greeting always matches the user's local clock.
// Server pre-renders with an empty subtitle, which avoids a hydration
// mismatch when the server's clock is in a different hour bucket.
export function Greeting() {
  const [greeting, setGreeting] = useState<string>("");
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(
      h < 5
        ? "Late night."
        : h < 12
        ? "Good morning."
        : h < 18
        ? "Good afternoon."
        : "Good evening.",
    );
  }, []);
  return <>{greeting}</>;
}
