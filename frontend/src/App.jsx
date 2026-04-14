import { useState, useEffect } from "react";

//const API = "http://localhost:3000/api";
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const API = API_BASE
const BISQUE = "#F2D2BD";
const CORNSILK = "#FFF8DC";
const LAVENDER = "#E6E6FA";

const BUSINESS_TYPES = ["retail", "manufacturing", "services", "wholesale", "agriculture"];
const LOAN_PURPOSES = ["business_expansion", "inventory", "equipment", "working_capital", "personal"];

const fmt = (n) => Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const fmtCurrency = (n) => "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

function StatusBadge({ status }) {
  const map = {
    pending: { bg: "#FFF8DC", color: "#8B6914", border: "#E8C840" },
    approved: { bg: "#D4EDDA", color: "#155724", border: "#5CB85C" },
    rejected: { bg: "#F8D7DA", color: "#721C24", border: "#D9534F" },
    APPROVED: { bg: "#D4EDDA", color: "#155724", border: "#5CB85C" },
    REJECTED: { bg: "#F8D7DA", color: "#721C24", border: "#D9534F" },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600,
      letterSpacing: 0.5, textTransform: "uppercase", fontFamily: "inherit"
    }}>{status}</span>
  );
}

function ScoreRing({ score }) {
  const r = 38, cx = 48, cy = 48, circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const dash = (pct / 100) * circ;
  const color = score >= 60 ? "#5CB85C" : score >= 40 ? "#E8A030" : "#D9534F";
  return (
    <svg width={96} height={96} viewBox="0 0 96 96">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E6E6FA" strokeWidth={8} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize={22} fontWeight={700} fill={color}>{score}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize={10} fill="#888">/ 100</text>
    </svg>
  );
}

function ScoreBar({ label, value, max = 100 }) {
  const pct = (value / max) * 100;
  const color = pct >= 60 ? "#5CB85C" : pct >= 40 ? "#E8A030" : "#D9534F";
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
        <span style={{ color: "#555" }}>{label}</span>
        <span style={{ fontWeight: 600, color }}>{value}</span>
      </div>
      <div style={{ background: "#E6E6FA", borderRadius: 6, height: 8, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, background: color, height: "100%", borderRadius: 6, transition: "width 0.7s ease" }} />
      </div>
    </div>
  );
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  const colors = { success: { bg: "#D4EDDA", border: "#5CB85C", color: "#155724" }, error: { bg: "#F8D7DA", border: "#D9534F", color: "#721C24" } };
  const c = colors[type] || colors.success;
  return (
    <div style={{
      position: "fixed", bottom: 32, right: 32, zIndex: 9999,
      background: c.bg, border: `1.5px solid ${c.border}`, color: c.color,
      borderRadius: 12, padding: "14px 22px", fontSize: 14, fontWeight: 500,
      boxShadow: "0 8px 32px rgba(0,0,0,0.12)", maxWidth: 360, animation: "slideUp 0.3s ease"
    }}>
      {msg}
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(80,60,40,0.22)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24
    }} onClick={onClose}>
      <div style={{
        background: CORNSILK, borderRadius: 20, padding: 36, width: "100%", maxWidth: 520,
        border: `1.5px solid ${BISQUE}`, maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 24px 64px rgba(100,60,20,0.18)"
      }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
      <div style={{ width: 4, height: 24, background: `linear-gradient(to bottom, ${BISQUE}, ${LAVENDER})`, borderRadius: 4 }} />
      <h2 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: "#3a2a1a", fontFamily: "'Playfair Display', Georgia, serif" }}>{children}</h2>
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 18, border: `1.5px solid ${BISQUE}`,
      padding: "24px 28px", boxShadow: "0 4px 24px rgba(200,160,100,0.08)",
      ...style
    }}>
      {children}
    </div>
  );
}

function Input({ label, error, ...props }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#6b4f2a", marginBottom: 6, letterSpacing: 0.3 }}>{label}</label>}
      <input {...props} style={{
        width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 14,
        border: `1.5px solid ${error ? "#D9534F" : "#D8C4AC"}`,
        background: CORNSILK, outline: "none", color: "#2a1a0a",
        boxSizing: "border-box", fontFamily: "inherit",
        transition: "border-color 0.2s",
        ...props.style
      }} />
      {error && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#D9534F" }}>{error}</p>}
    </div>
  );
}

function Select({ label, error, children, ...props }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#6b4f2a", marginBottom: 6, letterSpacing: 0.3 }}>{label}</label>}
      <select {...props} style={{
        width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 14,
        border: `1.5px solid ${error ? "#D9534F" : "#D8C4AC"}`,
        background: CORNSILK, outline: "none", color: "#2a1a0a",
        boxSizing: "border-box", fontFamily: "inherit", cursor: "pointer"
      }}>
        {children}
      </select>
      {error && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#D9534F" }}>{error}</p>}
    </div>
  );
}

function Btn({ children, variant = "primary", loading, ...props }) {
  const styles = {
    primary: { background: "#8B5E3C", color: "#FFF8DC", border: "none" },
    secondary: { background: "transparent", color: "#8B5E3C", border: `1.5px solid #8B5E3C` },
    danger: { background: "#D9534F", color: "#fff", border: "none" },
    success: { background: "#5CB85C", color: "#fff", border: "none" },
  };
  return (
    <button {...props} style={{
      padding: "10px 22px", borderRadius: 10, fontSize: 14, fontWeight: 600,
      cursor: props.disabled || loading ? "not-allowed" : "pointer",
      opacity: props.disabled || loading ? 0.6 : 1,
      transition: "all 0.18s", fontFamily: "inherit", letterSpacing: 0.3,
      ...styles[variant], ...props.style
    }}>
      {loading ? "Please wait…" : children}
    </button>
  );
}

/* ── PROFILE FORM ─────────────────────────────────────────────────── */
function ProfileForm({ onCreated }) {
  const [form, setForm] = useState({ owner_name: "", pan: "", business_type: "", monthly_revenue: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function submit() {
    setLoading(true); setErrors({});
    try {
      const res = await fetch(`${API}/profile`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, monthly_revenue: parseFloat(form.monthly_revenue) }) });
      const data = await res.json();
      if (!data.success) { const e = {}; (data.errors || []).forEach(x => e[x.field] = x.message); setErrors(e); }
      else onCreated(data.data);
    } catch { setErrors({ general: "Network error" }); }
    setLoading(false);
  }

  return (
    <div>
      <SectionTitle>Create Business Profile</SectionTitle>
      {errors.general && <p style={{ color: "#D9534F", marginBottom: 12, fontSize: 13 }}>{errors.general}</p>}
      <Input label="Owner Name" placeholder="e.g. Arjun Sharma" value={form.owner_name} onChange={e => set("owner_name", e.target.value)} error={errors.owner_name} />
      <Input label="PAN Number" placeholder="ABCDE1234F" value={form.pan} onChange={e => set("pan", e.target.value.toUpperCase())} error={errors.pan} />
      <Select label="Business Type" value={form.business_type} onChange={e => set("business_type", e.target.value)} error={errors.business_type}>
        <option value="">Select business type…</option>
        {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
      </Select>
      <Input label="Monthly Revenue (₹)" type="number" placeholder="e.g. 150000" value={form.monthly_revenue} onChange={e => set("monthly_revenue", e.target.value)} error={errors.monthly_revenue} />
      <Btn loading={loading} onClick={submit} style={{ width: "100%", padding: 12, marginTop: 4 }}>Create Profile</Btn>
    </div>
  );
}

/* ── LOAN FORM ────────────────────────────────────────────────────── */
function LoanForm({ onCreated }) {
  const [form, setForm] = useState({ business_id: "", requested_amount: "", tenure_months: "", purpose: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function submit() {
    setLoading(true); setErrors({});
    try {
      const res = await fetch(`${API}/loan`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_id: parseInt(form.business_id), requested_amount: parseFloat(form.requested_amount), tenure_months: parseInt(form.tenure_months), purpose: form.purpose })
      });
      const data = await res.json();
      if (!data.success) { const e = {}; (data.errors || []).forEach(x => e[x.field] = x.message); setErrors(e); }
      else onCreated(data.data);
    } catch { setErrors({ general: "Network error" }); }
    setLoading(false);
  }

  return (
    <div>
      <SectionTitle>Apply for Loan</SectionTitle>
      {errors.general && <p style={{ color: "#D9534F", marginBottom: 12, fontSize: 13 }}>{errors.general}</p>}
      <Input label="Business ID" type="number" placeholder="Enter your business ID" value={form.business_id} onChange={e => set("business_id", e.target.value)} error={errors.business_id} />
      <Input label="Loan Amount (₹)" type="number" placeholder="e.g. 500000" value={form.requested_amount} onChange={e => set("requested_amount", e.target.value)} error={errors.requested_amount} />
      <Input label="Tenure (months)" type="number" placeholder="1 – 120" value={form.tenure_months} onChange={e => set("tenure_months", e.target.value)} error={errors.tenure_months} />
      <Select label="Loan Purpose" value={form.purpose} onChange={e => set("purpose", e.target.value)} error={errors.purpose}>
        <option value="">Select purpose…</option>
        {LOAN_PURPOSES.map(p => <option key={p} value={p}>{p.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</option>)}
      </Select>
      <Btn loading={loading} onClick={submit} style={{ width: "100%", padding: 12, marginTop: 4 }}>Submit Application</Btn>
    </div>
  );
}

/* ── DECISION RESULT ──────────────────────────────────────────────── */
function DecisionResult({ result }) {
  const approved = result.decision === "APPROVED";
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
        <ScoreRing score={result.credit_score} />
        <div>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>Credit Decision</div>
          <StatusBadge status={result.decision} />
          <div style={{ marginTop: 8, fontSize: 13, color: "#555" }}>
            EMI: <strong style={{ color: "#3a2a1a" }}>{fmtCurrency(result.emi_computed)}/mo</strong>
          </div>
        </div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#6b4f2a", marginBottom: 12 }}>Score Breakdown</div>
        {result.breakdown && <>
          <ScoreBar label="Revenue to EMI" value={result.breakdown.revenue_to_emi_score} />
          <ScoreBar label="Loan to Revenue" value={result.breakdown.loan_to_revenue_score} />
          <ScoreBar label="Tenure" value={result.breakdown.tenure_score} />
          <ScoreBar label="Business Type" value={result.breakdown.business_type_score} />
        </>}
      </div>
      {result.reason_codes?.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#6b4f2a", marginBottom: 8 }}>Reason Codes</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {result.reason_codes.map(r => (
              <span key={r} style={{ background: "#F8D7DA", color: "#721C24", border: "1px solid #F5C6CB", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 500 }}>
                {r.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>
      )}
      {result.decision_id && (
        <p style={{ marginTop: 16, fontSize: 11, color: "#aaa", fontFamily: "monospace" }}>Decision ID: {result.decision_id}</p>
      )}
    </div>
  );
}

/* ── LOAN TABLE ───────────────────────────────────────────────────── */
function LoanTable({ loans, onRunDecision, loadingId }) {
  if (!loans.length) return (
    <div style={{ textAlign: "center", padding: 40, color: "#aaa" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
      <p style={{ margin: 0 }}>No loan applications yet</p>
    </div>
  );
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: BISQUE }}>
            {["ID", "Business ID", "Amount", "Tenure", "Purpose", "Status", "Created", "Action"].map(h => (
              <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "#6b4f2a", whiteSpace: "nowrap", borderBottom: `1.5px solid #D8C4AC` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loans.map((l, i) => (
            <tr key={l.id} style={{ background: i % 2 === 0 ? "#fff" : CORNSILK, transition: "background 0.15s" }}>
              <td style={{ padding: "10px 14px", color: "#888" }}>#{l.id}</td>
              <td style={{ padding: "10px 14px", color: "#3a2a1a", fontWeight: 600 }}>{l.business_id}</td>
              <td style={{ padding: "10px 14px", color: "#3a2a1a", fontWeight: 600 }}>{fmtCurrency(l.requested_amount)}</td>
              <td style={{ padding: "10px 14px" }}>{l.tenure_months} mo</td>
              <td style={{ padding: "10px 14px" }}><span style={{ background: LAVENDER, color: "#4a4a7a", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 500 }}>{l.purpose?.replace(/_/g, " ")}</span></td>
              <td style={{ padding: "10px 14px" }}><StatusBadge status={l.status} /></td>
              <td style={{ padding: "10px 14px", color: "#aaa", fontSize: 12 }}>{new Date(l.created_at).toLocaleDateString("en-IN")}</td>
              <td style={{ padding: "10px 14px" }}>
                <Btn variant="secondary" loading={loadingId === l.id} onClick={() => onRunDecision(l.id)}
                  style={{ padding: "6px 14px", fontSize: 12 }}>
                  {l.status === "pending" ? "Run Decision" : "View Result"}
                </Btn>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── LOOK UP PROFILE ──────────────────────────────────────────────── */
function ProfileLookup() {
  const [id, setId] = useState("");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function lookup() {
    if (!id) return;
    setLoading(true); setError(""); setProfile(null);
    try {
      const res = await fetch(`${API}/profile/${id}`);
      const data = await res.json();
      if (data.success) setProfile(data.data);
      else setError(data.message || "Not found");
    } catch { setError("Network error"); }
    setLoading(false);
  }

  return (
    <Card>
      <SectionTitle>Look Up Business Profile</SectionTitle>
      <div style={{ display: "flex", gap: 10 }}>
        <input
          type="number" placeholder="Enter Business ID…" value={id}
          onChange={e => setId(e.target.value)}
          onKeyDown={e => e.key === "Enter" && lookup()}
          style={{ flex: 1, padding: "10px 14px", borderRadius: 10, fontSize: 14, border: `1.5px solid #D8C4AC`, background: CORNSILK, outline: "none", color: "#2a1a0a", fontFamily: "inherit" }}
        />
        <Btn onClick={lookup} loading={loading}>Search</Btn>
      </div>
      {error && <p style={{ color: "#D9534F", marginTop: 10, fontSize: 13 }}>{error}</p>}
      {profile && (
        <div style={{ marginTop: 20, background: LAVENDER, borderRadius: 14, padding: "18px 22px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              ["Owner", profile.owner_name],
              ["PAN", profile.pan],
              ["Business Type", profile.business_type],
              ["Monthly Revenue", fmtCurrency(profile.monthly_revenue)],
              ["Business ID", `#${profile.id}`],
              ["Member Since", new Date(profile.created_at).toLocaleDateString("en-IN")],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 11, color: "#7a7aaa", fontWeight: 600, marginBottom: 2 }}>{k}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#2a2a5a" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

/* ── STATS ROW ────────────────────────────────────────────────────── */
function StatsRow({ loans }) {
  const total = loans.length;
  const approved = loans.filter(l => l.status === "approved").length;
  const rejected = loans.filter(l => l.status === "rejected").length;
  const pending = loans.filter(l => l.status === "pending").length;
  const totalAmt = loans.reduce((s, l) => s + parseFloat(l.requested_amount || 0), 0);

  const stats = [
    { label: "Total Applications", value: total, bg: LAVENDER, accent: "#4a4a7a" },
    { label: "Approved", value: approved, bg: "#D4EDDA", accent: "#155724" },
    { label: "Rejected", value: rejected, bg: "#F8D7DA", accent: "#721C24" },
    { label: "Pending", value: pending, bg: CORNSILK, accent: "#8B6914" },
    { label: "Total Loan Value", value: fmtCurrency(totalAmt), bg: BISQUE, accent: "#6b4f2a" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, marginBottom: 28 }}>
      {stats.map(s => (
        <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: "16px 18px", border: `1px solid rgba(0,0,0,0.06)` }}>
          <div style={{ fontSize: 11, color: s.accent, fontWeight: 600, marginBottom: 4, opacity: 0.8 }}>{s.label}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: s.accent }}>{s.value}</div>
        </div>
      ))}
    </div>
  );
}

/* ── MAIN APP ─────────────────────────────────────────────────────── */
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [loans, setLoans] = useState([]);
  const [loansLoading, setLoansLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [decision, setDecision] = useState(null);
  const [decisionLoadingId, setDecisionLoadingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  async function fetchLoans() {
    setLoansLoading(true);
    try {
      const res = await fetch(`${API}/loan`);
      const data = await res.json();
      if (data.success) setLoans(data.data);
    } catch { }
    setLoansLoading(false);
  }

  useEffect(() => { fetchLoans(); }, []);

  async function runDecision(loanId) {
    setDecisionLoadingId(loanId);
    try {
      const res = await fetch(`${API}/decisions/${loanId}`, { method: "POST" });
      const data = await res.json();
      if (data.error) { showToast(data.error, "error"); }
      else {
        setDecision(data);
        setModal("decision");
        fetchLoans();
      }
    } catch { showToast("Failed to run decision engine", "error"); }
    setDecisionLoadingId(null);
  }

  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "loans", label: "Loan Applications" },
    { id: "profile", label: "Business Profiles" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: BISQUE, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        button { font-family: 'DM Sans', sans-serif; }
        input, select { font-family: 'DM Sans', sans-serif; }
        @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        tr:hover { background: ${BISQUE} !important; }
      `}</style>

      {/* Header */}
      <header style={{
        background: "#2a1a0a", padding: "0 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between", height: 64,
        boxShadow: "0 2px 20px rgba(0,0,0,0.18)", position: "sticky", top: 0, zIndex: 100
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${BISQUE}, ${LAVENDER})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#2a1a0a" }}>V</div>
          <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: 22, color: CORNSILK, letterSpacing: 0.5 }}>Vitto Lending</span>
        </div>
        <nav style={{ display: "flex", gap: 4 }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} style={{
              padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer",
              fontWeight: 500, fontSize: 14, fontFamily: "inherit", transition: "all 0.18s",
              background: tab === n.id ? BISQUE : "transparent",
              color: tab === n.id ? "#2a1a0a" : "rgba(255,248,220,0.7)",
            }}>{n.label}</button>
          ))}
        </nav>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="secondary" onClick={() => setModal("profile")} style={{ background: "transparent", color: CORNSILK, border: `1.5px solid rgba(255,248,220,0.3)`, fontSize: 13 }}>
            + New Profile
          </Btn>
          <Btn onClick={() => setModal("loan")} style={{ background: BISQUE, color: "#2a1a0a", fontSize: 13 }}>
            + Apply for Loan
          </Btn>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 32px" }}>

        {/* Dashboard Tab */}
        {tab === "dashboard" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 32, fontWeight: 700, color: "#2a1a0a", margin: "0 0 6px" }}>Good morning 👋</h1>
              <p style={{ color: "#8B6914", margin: 0, fontSize: 15 }}>Here's an overview of your lending activity.</p>
            </div>
            <StatsRow loans={loans} />
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <SectionTitle>Recent Applications</SectionTitle>
                <Btn variant="secondary" onClick={fetchLoans} style={{ fontSize: 12, padding: "6px 14px" }}>Refresh</Btn>
              </div>
              {loansLoading ? <p style={{ color: "#aaa", textAlign: "center" }}>Loading…</p> : (
                <LoanTable loans={loans.slice(0, 5)} onRunDecision={runDecision} loadingId={decisionLoadingId} />
              )}
            </Card>
          </div>
        )}

        {/* Loans Tab */}
        {tab === "loans" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
              <div>
                <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, fontWeight: 700, color: "#2a1a0a", margin: "0 0 4px" }}>Loan Applications</h1>
                <p style={{ color: "#8B6914", margin: 0, fontSize: 14 }}>{loans.length} total applications</p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Btn variant="secondary" onClick={fetchLoans} style={{ fontSize: 13, padding: "8px 18px" }}>Refresh</Btn>
                <Btn onClick={() => setModal("loan")} style={{ fontSize: 13, padding: "8px 18px" }}>+ New Application</Btn>
              </div>
            </div>
            <StatsRow loans={loans} />
            <Card>
              {loansLoading ? <p style={{ color: "#aaa", textAlign: "center", padding: 24 }}>Loading…</p> : (
                <LoanTable loans={loans} onRunDecision={runDecision} loadingId={decisionLoadingId} />
              )}
            </Card>
          </div>
        )}

        {/* Profile Tab */}
        {tab === "profile" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, fontWeight: 700, color: "#2a1a0a", margin: "0 0 4px" }}>Business Profiles</h1>
              <p style={{ color: "#8B6914", margin: 0, fontSize: 14 }}>Manage and look up business profiles.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <Card>
                <ProfileForm onCreated={(biz) => { showToast(`Profile created! Business ID: ${biz.id}`); }} />
              </Card>
              <ProfileLookup />
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {modal === "profile" && (
        <Modal onClose={() => setModal(null)}>
          <ProfileForm onCreated={(biz) => { showToast(`Profile created! Business ID: ${biz.id}`); setModal(null); }} />
          <Btn variant="secondary" onClick={() => setModal(null)} style={{ marginTop: 12, width: "100%", textAlign: "center" }}>Cancel</Btn>
        </Modal>
      )}

      {modal === "loan" && (
        <Modal onClose={() => setModal(null)}>
          <LoanForm onCreated={(loan) => { showToast(`Loan #${loan.id} submitted successfully!`); setModal(null); fetchLoans(); }} />
          <Btn variant="secondary" onClick={() => setModal(null)} style={{ marginTop: 12, width: "100%", textAlign: "center" }}>Cancel</Btn>
        </Modal>
      )}

      {modal === "decision" && decision && (
        <Modal onClose={() => setModal(null)}>
          <SectionTitle>Credit Decision — Loan #{decision.loan_id}</SectionTitle>
          <DecisionResult result={decision} />
          <Btn onClick={() => setModal(null)} style={{ marginTop: 20, width: "100%", padding: 12, textAlign: "center" }}>Close</Btn>
        </Modal>
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}



// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import heroImg from './assets/hero.png'
// import './App.css'
//
// function App() {
//   const [count, setCount] = useState(0)
//
//   return (
//     <>
//       <section id="center">
//         <div className="hero">
//           <img src={heroImg} className="base" width="170" height="179" alt="" />
//           <img src={reactLogo} className="framework" alt="React logo" />
//           <img src={viteLogo} className="vite" alt="Vite logo" />
//         </div>
//         <div>
//           <h1>Get started</h1>
//           <p>
//             Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
//           </p>
//         </div>
//         <button
//           className="counter"
//           onClick={() => setCount((count) => count + 1)}
//         >
//           Count is {count}
//         </button>
//       </section>
//
//       <div className="ticks"></div>
//
//       <section id="next-steps">
//         <div id="docs">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#documentation-icon"></use>
//           </svg>
//           <h2>Documentation</h2>
//           <p>Your questions, answered</p>
//           <ul>
//             <li>
//               <a href="https://vite.dev/" target="_blank">
//                 <img className="logo" src={viteLogo} alt="" />
//                 Explore Vite
//               </a>
//             </li>
//             <li>
//               <a href="https://react.dev/" target="_blank">
//                 <img className="button-icon" src={reactLogo} alt="" />
//                 Learn more
//               </a>
//             </li>
//           </ul>
//         </div>
//         <div id="social">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#social-icon"></use>
//           </svg>
//           <h2>Connect with us</h2>
//           <p>Join the Vite community</p>
//           <ul>
//             <li>
//               <a href="https://github.com/vitejs/vite" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#github-icon"></use>
//                 </svg>
//                 GitHub
//               </a>
//             </li>
//             <li>
//               <a href="https://chat.vite.dev/" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#discord-icon"></use>
//                 </svg>
//                 Discord
//               </a>
//             </li>
//             <li>
//               <a href="https://x.com/vite_js" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#x-icon"></use>
//                 </svg>
//                 X.com
//               </a>
//             </li>
//             <li>
//               <a href="https://bsky.app/profile/vite.dev" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#bluesky-icon"></use>
//                 </svg>
//                 Bluesky
//               </a>
//             </li>
//           </ul>
//         </div>
//       </section>
//
//       <div className="ticks"></div>
//       <section id="spacer"></section>
//     </>
//   )
// }
//
// export default App
