"use client";

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);

  async function handleSignup() {
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });
    if (!error) setDone(true);
  }

  if (done) return <p>Check your email to confirm your account.</p>;

  return (
    <div>
      <h1>Create account</h1>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        type="password"
      />
      <button onClick={handleSignup}>Sign up</button>
    </div>
  );
}
