import { useState } from "react";
import { BriefcaseBusiness, Eye, EyeOff } from "lucide-react";

export default function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await onAuth(mode, { name, email, password });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-intro">
        <div className="brand brand-light"><span className="brand-icon"><BriefcaseBusiness size={21} /></span> JobTrack</div>
        <p className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</p>
        <h1>A calmer way to manage your job search.</h1>
        <p className="intro-copy">Keep every application, interview, and opportunity organized in one place.</p>
        <div className="intro-points">
          <p>✓ See your progress at a glance</p>
          <p>✓ Never lose track of a follow-up</p>
          <p>✓ Keep your job search moving forward</p>
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-card">
          <div className="brand brand-dark"><span className="brand-icon"><BriefcaseBusiness size={20} /></span> JobTrack</div>
          <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
          <p className="muted">{mode === "login" ? "Sign in to continue your job search." : "Start organizing your next opportunity."}</p>
          <form onSubmit={submit} className="stack-form">
            {mode === "register" && <label>Full name<input value={name} onChange={e => setName(e.target.value)} required minLength={2} maxLength={80} placeholder="Your name" autoComplete="name" /></label>}
            <label>Email address<input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" autoComplete="email" /></label>
            <label>Password<span className="password-field"><input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required minLength={mode === "register" ? 8 : 1} placeholder={mode === "register" ? "At least 8 characters" : "Your password"} autoComplete={mode === "login" ? "current-password" : "new-password"} /><button className="icon-button password-toggle" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>
            {error && <div className="alert alert-error" role="alert">{error}</div>}
            <button className="button button-primary button-wide" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button>
          </form>
          <p className="auth-switch">{mode === "login" ? "New to JobTrack?" : "Already have an account?"} <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}> {mode === "login" ? "Create an account" : "Sign in"}</button></p>
        </div>
      </section>
    </main>
  );
}
