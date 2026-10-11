import { CalendarDays, ExternalLink, MapPin, Pencil, Trash2 } from "lucide-react";

const statusClass = {
  Applied: "status-applied",
  Interview: "status-interview",
  Offer: "status-offer",
  Rejected: "status-rejected",
  Wishlist: "status-wishlist",
};

export default function ApplicationCard({ application, onEdit, onDelete }) {
  const deadline = application.deadline ? new Date(application.deadline) : null;
  const overdue = deadline && deadline < new Date(new Date().toDateString()) && !["Offer", "Rejected"].includes(application.status);

  return (
    <article className="application-row">
      <div className="company-mark">{(application.company || "?").trim().slice(0, 1).toUpperCase()}</div>
      <div className="application-main">
        <div className="application-title-line"><h3>{application.role}</h3><span className={`status-badge ${statusClass[application.status] || ""}`}>{application.status}</span></div>
        <p className="company-name">{application.company}</p>
        <div className="application-meta">
          {application.location && <span><MapPin size={14} />{application.location}</span>}
          <span>{application.employmentType || "Full-time"}</span>
          {deadline && <span className={overdue ? "deadline-overdue" : ""}><CalendarDays size={14} />{overdue ? "Overdue · " : "Follow up · "}{deadline.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>}
        </div>
        {application.notes && <p className="application-notes">{application.notes}</p>}
      </div>
      <div className="row-actions">
        {application.jobUrl && <a className="icon-button" href={application.jobUrl} target="_blank" rel="noreferrer" aria-label="Open job posting"><ExternalLink size={17} /></a>}
        <button className="icon-button" onClick={() => onEdit(application)} aria-label={`Edit ${application.company} application`}><Pencil size={17} /></button>
        <button className="icon-button danger-icon" onClick={() => onDelete(application)} aria-label={`Delete ${application.company} application`}><Trash2 size={17} /></button>
      </div>
    </article>
  );
}
