import { ArrowUpRight, BriefcaseBusiness, CheckCircle2, MessageCircle, Trophy } from "lucide-react";

const icons = {
  total: BriefcaseBusiness,
  interviews: MessageCircle,
  offers: Trophy,
  rejected: CheckCircle2,
};

export default function StatCard({ label, value, type }) {
  const Icon = icons[type] || ArrowUpRight;
  return <article className={`stat-card stat-${type}`}><div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon size={19} /></span></div><p className="stat-value">{value}</p><span className="stat-caption">{type === "total" ? "Applications tracked" : "Applications"}</span></article>;
}
