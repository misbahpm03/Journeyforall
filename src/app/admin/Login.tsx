"use client";

import { useActionState } from "react";
import { login } from "./actions";

export function Login() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="login">
      <p className="admin-eyebrow">little world</p>
      <h1>Sign in</h1>
      <label htmlFor="pw" className="sr-only">Password</label>
      <input id="pw" name="password" type="password" placeholder="Password" autoFocus autoComplete="current-password" required />
      <button className="btn btn-save" disabled={pending}>{pending ? "…" : "Enter"}</button>
      {error && <p className="err">{error}</p>}
    </form>
  );
}
