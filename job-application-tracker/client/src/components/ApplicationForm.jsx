import { useEffect, useState } from "react";
import { X } from "lucide-react";

const initialForm = {
  company: "", role: "", status: "Applied", appliedDate: new Date().toISOString().slice(0, 10),
  deadline: "", jobUrl: "", location: "", employmentType: "Full-time", notes: "",
};

export default function ApplicationForm({ editing, onSave, onCancel, busy }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editing) {
      setForm({
        company: editing.company || "",
        role: editing.role || "",
        status: editing.status || "Applied",
        appliedDate: editing.appliedDate ? new Date(editing.appliedDate).toISOString().slice(0, 10) : "",
        deadline: editing.deadline ? new Date(editing.deadline).toISOString().slice(0, 10) : "",
        jobUrl: editing.jobUrl || "",
        location: editing.location || "",
        employmentType: editing.employmentType || "Full-time",
        notes: editing.notes || "",
      });
    } else {
      setForm({ ...initialForm, appliedDate: new Date().toISOString().slice(0, 10) });
    }
    setError("");
  }, [editing]);

  function update(field, value) {
    setForm(current => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (!form.company.trim() || !form.role.trim()) {
      setError("Company and role are required.");
      return;
    }
    if (form.jobUrl && !/^https?:\/\/.+/i.test(form.jobUrl)) {
      setError("Job URL must begin with http:// or https://.");
      return;
    }
    try {
      await onSave({
        ...form,
        appliedDate: form.appliedDate || null,
        deadline: form.deadline || null,
      });
      if (!editing) setForm({ ...initialForm, appliedDate: new Date().toISOString().slice(0, 10) });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="editor-card" onSubmit={submit}>
      <div className="section-heading editor-heading">
        <div><p className="eyebrow">{editing ? "MAKE AN UPDATE" : "KEEP IT ORGANIZED"}</p><h2>{editing ? "Edit application" : "Add an application"}</h2></div>
        {editing && <button type="button" className="icon-button" onClick={onCancel} aria-label="Cancel editing"><X size={19} /></button>}
      </div>
      <div className="form-grid">
        <label>Company <span className="required">*</span><input value={form.company} onChange={e => update("company", e.target.value)} required maxLength={120} placeholder="e.g. Google" /></label>
        <label>Job title <span className="required">*</span><input value={form.role} onChange={e => update("role", e.target.value)} required maxLength={120} placeholder="e.g. Frontend Developer" /></label>
        <label>Status<select value={form.status} onChange={e => update("status", e.target.value)}><option>Applied</option><option>Interview</option><option>Offer</option><option>Rejected</option><option>Wishlist</option></select></label>
        <label>Employment type<select value={form.employmentType} onChange={e => update("employmentType", e.target.value)}><option>Full-time</option><option>Part-time</option><option>Internship</option><option>Contract</option><option>Remote</option></select></label>
        <label>Applied date<input type="date" value={form.appliedDate} onChange={e => update("appliedDate", e.target.value)} /></label>
        <label>Follow-up deadline<input type="date" value={form.deadline} onChange={e => update("deadline", e.target.value)} /></label>
        <label>Location<input value={form.location} onChange={e => update("location", e.target.value)} maxLength={120} placeholder="e.g. Pune / Remote" /></label>
        <label>Job posting URL<input type="url" value={form.jobUrl} onChange={e => update("jobUrl", e.target.value)} maxLength={500} placeholder="https://..." /></label>
        <label className="full-span">Notes<textarea value={form.notes} onChange={e => update("notes", e.target.value)} rows={3} maxLength={3000} placeholder="Recruiter name, interview notes, follow-up details…" /></label>
      </div>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      <div className="form-actions">
        {editing && <button type="button" className="button button-ghost" onClick={onCancel}>Cancel</button>}
        <button className="button button-primary" disabled={busy}>{busy ? "Saving…" : editing ? "Save changes" : "Add application"}</button>
      </div>
    </form>
  );
}
