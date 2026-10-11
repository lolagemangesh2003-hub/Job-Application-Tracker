import { useCallback, useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, LogOut, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { apiRequest } from "./api.js";
import AuthScreen from "./components/AuthScreen.jsx";
import ApplicationForm from "./components/ApplicationForm.jsx";
import ApplicationCard from "./components/ApplicationCard.jsx";
import StatCard from "./components/StatCard.jsx";

const emptyStats = { total: 0, Applied: 0, Interview: 0, Offer: 0, Rejected: 0, Wishlist: 0 };

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("jobtrack_token") || "");
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(emptyStats);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [sort, setSort] = useState("updated");
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const logout = useCallback(() => {
    localStorage.removeItem("jobtrack_token");
    setToken("");
    setUser(null);
    setApplications([]);
    setStats(emptyStats);
    setEditing(null);
    setShowForm(false);
    setError("");
  }, []);

  const loadData = useCallback(async (authToken = token) => {
    if (!authToken) return;
    setError("");
    const query = new URLSearchParams();
    if (search.trim()) query.set("search", search.trim());
    if (statusFilter !== "All statuses") query.set("status", statusFilter);
    try {
      const [applicationData, statsData, userData] = await Promise.all([
        apiRequest(`/applications?${query.toString()}`, { token: authToken }),
        apiRequest("/applications/stats", { token: authToken }),
        apiRequest("/auth/me", { token: authToken }),
      ]);
      setApplications(applicationData.applications);
      setStats(statsData.stats);
      setUser(userData.user);
    } catch (err) {
      if (/session|log in|invalid|expired/i.test(err.message)) logout();
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, search, statusFilter, logout]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    const timer = setTimeout(() => { loadData(token); }, search ? 250 : 0);
    return () => clearTimeout(timer);
  }, [token, search, statusFilter, loadData]);

  async function authenticate(mode, payload) {
    const result = await apiRequest(`/auth/${mode === "register" ? "register" : "login"}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    localStorage.setItem("jobtrack_token", result.token);
    setToken(result.token);
    setUser(result.user);
    setLoading(true);
    setError("");
  }

  async function saveApplication(payload) {
    setSaving(true);
    try {
      if (editing) {
        await apiRequest(`/applications/${editing._id}`, { method: "PATCH", token, body: JSON.stringify(payload) });
        setNotice("Application updated successfully.");
      } else {
        await apiRequest("/applications", { method: "POST", token, body: JSON.stringify(payload) });
        setNotice("Application added successfully.");
      }
      setEditing(null);
      setShowForm(false);
      await loadData(token);
    } finally {
      setSaving(false);
    }
  }

  async function deleteApplication(application) {
    const confirmed = window.confirm(`Delete the application for ${application.company} — ${application.role}? This cannot be undone.`);
    if (!confirmed) return;
    setError("");
    try {
      await apiRequest(`/applications/${application._id}`, { method: "DELETE", token });
      setNotice("Application deleted.");
      if (editing?._id === application._id) { setEditing(null); setShowForm(false); }
      await loadData(token);
    } catch (err) {
      setError(err.message);
    }
  }

  const sortedApplications = useMemo(() => {
    const items = [...applications];
    if (sort === "company") items.sort((a, b) => a.company.localeCompare(b.company));
    else if (sort === "deadline") items.sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });
    else items.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    return items;
  }, [applications, sort]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  if (!token) return <AuthScreen onAuth={authenticate} />;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand brand-dark" href="#" onClick={e => e.preventDefault()}><span className="brand-icon"><BriefcaseBusiness size={21} /></span><span>JobTrack</span></a>
        <div className="sidebar-label">WORKSPACE</div>
        <a className="side-link active" href="#dashboard"><span className="side-dot" />Dashboard</a>
        <a className="side-link" href="#applications"><BriefcaseBusiness size={17} />Applications <span className="side-count">{stats.total}</span></a>
        <div className="sidebar-bottom">
          <div className="user-chip"><div className="avatar">{(user?.name || "U").slice(0, 1).toUpperCase()}</div><div className="user-copy"><strong>{user?.name || "Your account"}</strong><span>{user?.email || ""}</span></div></div>
          <button className="logout-button" onClick={logout}><LogOut size={17} /> Sign out</button>
        </div>
      </aside>

      <main className="main-area" id="dashboard">
        <header className="topbar"><div><span className="topbar-date">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</span><h1>Dashboard</h1></div><button className="button button-primary" onClick={() => { setEditing(null); setShowForm(true); }}><Plus size={17} /> Add application</button></header>

        {error && <div className="alert alert-error global-alert" role="alert">{error}<button className="alert-close" onClick={() => setError("")} aria-label="Dismiss error"><X size={16} /></button></div>}
        {notice && <div className="alert alert-success global-alert" role="status">{notice}<button className="alert-close" onClick={() => setNotice("")} aria-label="Dismiss message"><X size={16} /></button></div>}

        <section className="welcome-block"><div><p className="eyebrow">YOUR JOB SEARCH, IN FOCUS</p><h2>Keep moving forward{user?.name ? `, ${user.name.split(" ")[0]}` : ""}.</h2><p>Every application is a step closer to the right opportunity.</p></div><div className="welcome-illustration"><div className="illustration-card"><span className="illustration-check">✓</span><div><strong>Progress, not pressure.</strong><span>One step at a time</span></div></div></div></section>

        <section className="stats-grid" aria-label="Application statistics">
          <StatCard label="Total applications" value={stats.total} type="total" />
          <StatCard label="Interviews" value={stats.Interview} type="interviews" />
          <StatCard label="Offers" value={stats.Offer} type="offers" />
          <StatCard label="Rejected" value={stats.Rejected} type="rejected" />
        </section>

        {showForm && <section className="form-section"><ApplicationForm editing={editing} onSave={saveApplication} onCancel={() => { setEditing(null); setShowForm(false); }} busy={saving} /></section>}

        <section className="applications-section" id="applications">
          <div className="list-heading"><div><p className="eyebrow">YOUR PIPELINE</p><h2>Applications <span className="heading-count">{applications.length}</span></h2><p className="muted">Keep your opportunities and next steps in one place.</p></div><button className="button button-secondary add-mobile" onClick={() => { setEditing(null); setShowForm(true); }}><Plus size={16} /> Add new</button></div>
          <div className="toolbar">
            <label className="search-box"><Search size={18} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search company, role, notes…" aria-label="Search applications" />{search && <button className="clear-search" onClick={() => setSearch("")} aria-label="Clear search"><X size={15} /></button>}</label>
            <label className="filter-box"><SlidersHorizontal size={16} /><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} aria-label="Filter by status"><option>All statuses</option><option>Applied</option><option>Interview</option><option>Offer</option><option>Rejected</option><option>Wishlist</option></select></label>
            <label className="sort-box"><span>Sort by</span><select value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort applications"><option value="updated">Recently updated</option><option value="company">Company A–Z</option><option value="deadline">Follow-up date</option></select></label>
          </div>

          {loading ? <div className="loading-state"><span className="spinner" />Loading your applications…</div> : sortedApplications.length ? <div className="application-list">{sortedApplications.map(application => <ApplicationCard key={application._id} application={application} onEdit={item => { setEditing(item); setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }} onDelete={deleteApplication} />)}</div> : <div className="empty-state"><div className="empty-icon"><BriefcaseBusiness size={25} /></div><h3>{search || statusFilter !== "All statuses" ? "No matching applications" : "Your next opportunity starts here"}</h3><p>{search || statusFilter !== "All statuses" ? "Try changing your search or filter." : "Add your first application to start building your job-search pipeline."}</p>{!search && statusFilter === "All statuses" && <button className="button button-primary" onClick={() => { setEditing(null); setShowForm(true); }}><Plus size={17} /> Add your first application</button>}</div>}
          <div className="list-footer"><span>Showing {sortedApplications.length} {sortedApplications.length === 1 ? "application" : "applications"}</span><span>Stay consistent. Your effort adds up.</span></div>
        </section>
        <footer className="footer">Built to make your job search a little more organized. <span>JobTrack © {new Date().getFullYear()}</span></footer>
      </main>
    </div>
  );
}
