import { useState } from "react";
import { Activity, Shield, Building2, Warehouse, Hospital, FlaskConical, Eye, EyeOff, ArrowRight, Lock, UserPlus, CheckCircle2, AlertCircle } from "lucide-react";
import { authService } from "../services/authService";

export type UserRole = "admin" | "government" | "supplier" | "warehouse" | "hospital" | "pharmacist";

interface RoleOption {
  id: UserRole;
  label: string;
  org: string;
  icon: React.ElementType;
  color: string;
  accent: string;
  bg: string;
}

const roles: RoleOption[] = [
  { id: "admin", label: "System Admin", org: "National Drug Authority", icon: Shield, color: "text-teal-400", accent: "border-teal-500 bg-teal-500/10", bg: "bg-teal-500" },
  { id: "government", label: "Government / Authority", org: "Ministry of Health & FW", icon: Building2, color: "text-blue-400", accent: "border-blue-500 bg-blue-500/10", bg: "bg-blue-500" },
  { id: "hospital", label: "Hospital / Institution", org: "Medical Institution", icon: Hospital, color: "text-emerald-400", accent: "border-emerald-500 bg-emerald-500/10", bg: "bg-emerald-500" },
  { id: "supplier", label: "Supplier", org: "Pharmaceutical Manufacturer", icon: FlaskConical, color: "text-violet-400", accent: "border-violet-500 bg-violet-500/10", bg: "bg-violet-500" },
  { id: "warehouse", label: "Warehouse Manager", org: "Central / Regional Warehouse", icon: Warehouse, color: "text-amber-400", accent: "border-amber-500 bg-amber-500/10", bg: "bg-amber-500" },
  { id: "pharmacist", label: "Pharmacist", org: "Hospital Pharmacy", icon: FlaskConical, color: "text-rose-400", accent: "border-rose-500 bg-rose-500/10", bg: "bg-rose-500" },
];

const orgAccounts: Record<UserRole, Array<{ label: string; email: string; pass: string; name: string; org: string }>> = {
  admin: [
    { label: "National Admin", email: "admin@pharmtrack.gov.in", pass: "Admin@2025", name: "Dr. Rajesh Kumar", org: "National Drug Authority" },
  ],
  government: [
    { label: "MoHFW Secretary", email: "authority@mohfw.gov.in", pass: "Govt@2025", name: "Sec. Priya Menon", org: "Ministry of Health & FW" },
  ],
  hospital: [
    { label: "AIIMS New Delhi", email: "aiims.delhi@pharmtrack.gov.in", pass: "Aiims@2025", name: "Dr. Meena Iyer", org: "AIIMS New Delhi" },
    { label: "PGI Chandigarh", email: "pgi.chd@pharmtrack.gov.in", pass: "Pgi@2025", name: "Dr. Arvind Sharma", org: "PGI Chandigarh" },
    { label: "KGMU Lucknow", email: "kgmu.lko@pharmtrack.gov.in", pass: "Kgmu@2025", name: "Dr. R. P. Singh", org: "KGMU Lucknow" },
    { label: "Civil Hospital Ahmedabad", email: "civil.ahmedabad@pharmtrack.gov.in", pass: "Civil@2025", name: "Dr. Bhavin Patel", org: "Civil Hospital Ahmedabad" },
  ],
  supplier: [
    { label: "Cipla Ltd", email: "supply@cipla.com", pass: "Supplier@2025", name: "Ramesh Singh", org: "Cipla Ltd" },
    { label: "Sun Pharmaceutical", email: "supply@sunpharma.com", pass: "Sun@2025", name: "Alok Patel", org: "Sun Pharmaceutical" },
    { label: "Dr. Reddy's Labs", email: "orders@drreddys.com", pass: "Reddys@2025", name: "Venkatesh Rao", org: "Dr. Reddy's Laboratories" },
    { label: "Lupin Ltd", email: "supply@lupin.com", pass: "Lupin@2025", name: "Deepak Joshi", org: "Lupin Ltd" },
  ],
  warehouse: [
    { label: "Central Warehouse Delhi", email: "wh.delhi@pharmtrack.gov.in", pass: "Warehouse@2025", name: "Suresh Verma", org: "Central Warehouse Delhi" },
    { label: "Regional WH Mumbai", email: "wh.mumbai@pharmtrack.gov.in", pass: "Warehouse@2025", name: "Manoj Desai", org: "Regional Warehouse Mumbai" },
    { label: "Regional WH Chennai", email: "wh.chennai@pharmtrack.gov.in", pass: "Warehouse@2025", name: "K. Raman", org: "Regional Warehouse Chennai" },
  ],
  pharmacist: [
    { label: "KGMU Pharmacy", email: "pharma@kgmu.edu.in", pass: "Pharma@2025", name: "Kavitha Nair", org: "KGMU Lucknow" },
  ],
};

interface LoginProps {
  onLogin: (role: UserRole, name: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");
  const [selectedOrgIndex, setSelectedOrgIndex] = useState(0);

  // Login form state
  const [email, setEmail] = useState("admin@pharmtrack.gov.in");
  const [password, setPassword] = useState("Admin@2025");
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [regForm, setRegForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    organization: "",
    phone: "",
    role: "hospital" as UserRole,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const selectRole = (role: UserRole) => {
    setSelectedRole(role);
    setSelectedOrgIndex(0);
    const orgs = orgAccounts[role];
    if (orgs && orgs.length > 0) {
      setEmail(orgs[0].email);
      setPassword(orgs[0].pass);
    }
    setError("");
    setSuccessMsg("");
  };

  const selectOrgAccount = (index: number) => {
    setSelectedOrgIndex(index);
    const org = orgAccounts[selectedRole][index];
    if (org) {
      setEmail(org.email);
      setPassword(org.pass);
    }
    setError("");
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await authService.login(email.trim(), password);
      onLogin(res.role || selectedRole, res.name || "Authenticated User");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Invalid credentials. Please verify your email and password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!regForm.name.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!regForm.email.trim() || !regForm.email.includes("@")) {
      setError("A valid email address is required.");
      return;
    }
    if (regForm.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (regForm.password !== regForm.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.register({
        name: regForm.name.trim(),
        email: regForm.email.trim().toLowerCase(),
        password: regForm.password,
        role: regForm.role,
        organization: regForm.organization.trim() || undefined,
        phone: regForm.phone.trim() || undefined,
      });

      setSuccessMsg("Account registered successfully! Logging you in...");
      setTimeout(() => {
        onLogin(res.role || regForm.role, res.name || regForm.name);
      }, 800);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Registration failed. This email may already be registered.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const selectedRoleData = roles.find((r) => r.id === selectedRole)!;
  const currentOrgList = orgAccounts[selectedRole] || [];

  return (
    <div className="min-h-screen flex" style={{ background: "#070e1f" }}>
      {/* Left panel – branding */}
      <div className="hidden lg:flex flex-col justify-between w-[46%] p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0a1628 0%, #0f2040 60%, #0e2a4a 100%)" }}>
        {/* Grid bg */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "linear-gradient(rgba(6,182,212,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.4) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        {/* Glow */}
        <div className="absolute top-32 left-20 w-72 h-72 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div className="absolute bottom-32 right-10 w-56 h-56 rounded-full opacity-8"
          style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)", filter: "blur(40px)" }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Activity size={22} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg" style={{ fontFamily: "'DM Sans', sans-serif" }}>PharmTrack</p>
              <p className="text-teal-400 text-xs">National Drug Supply Chain</p>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Intelligent Drug<br />Inventory &<br />Supply Chain
          </h1>
          <p className="text-blue-300 text-base leading-relaxed max-w-sm">
            End-to-end pharmaceutical supply-chain visibility — from manufacturer to patient. Predict shortages before they happen.
          </p>

          <div className="flex flex-col gap-3 mt-10">
            {["AI Demand Forecasting & Reorder", "Cold Chain IoT Telemetry Monitoring", "Smart Stock Redistribution Engine", "GS1 QR Drug Traceability & Lineage", "Real-time Emergency Hospital SOS"].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                <span className="text-sm text-blue-200">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex gap-6 text-center">
            {[{ v: "20+", l: "Drugs" }, { v: "12", l: "Hospitals" }, { v: "8", l: "Suppliers" }, { v: "91.4%", l: "AI Accuracy" }].map((s) => (
              <div key={s.l}>
                <p className="text-teal-300 font-bold text-xl" style={{ fontFamily: "'DM Sans', sans-serif" }}>{s.v}</p>
                <p className="text-blue-400 text-xs mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
          <p className="text-blue-500 text-xs mt-6">Smart India Hackathon 2025 · Problem Statement PSS04</p>
        </div>
      </div>

      {/* Right panel – login / register form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto max-h-screen">
        <div className="w-full max-w-md my-auto">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
              <Activity size={16} className="text-white" />
            </div>
            <p className="text-white font-bold" style={{ fontFamily: "'DM Sans', sans-serif" }}>PharmTrack</p>
          </div>

          {/* Auth Mode Toggle */}
          <div className="flex p-1 rounded-xl bg-white/5 border border-white/10 mb-6">
            <button
              onClick={() => { setAuthMode("login"); setError(""); setSuccessMsg(""); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                authMode === "login" ? "bg-teal-500 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthMode("register"); setError(""); setSuccessMsg(""); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                authMode === "register" ? "bg-teal-500 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              Create Account / Register
            </button>
          </div>

          {authMode === "login" ? (
            <>
              <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>Sign in to your account</h2>
              <p className="text-slate-400 text-sm mb-6">Select organization role or enter custom credentials</p>

              {/* Role selector */}
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2.5">Select Role</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => selectRole(role.id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                      selectedRole === role.id ? role.accent + " border-opacity-100 ring-1 ring-teal-400/50" : "border-white/10 hover:border-white/20 bg-white/[0.02]"
                    }`}
                  >
                    <role.icon size={15} className={selectedRole === role.id ? role.color : "text-slate-500"} />
                    <div>
                      <p className={`text-xs font-semibold leading-tight ${selectedRole === role.id ? "text-white" : "text-slate-400"}`}>{role.label}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Organization Account Fast-Select (if multiple) */}
              {currentOrgList.length > 1 && (
                <div className="mb-4">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Facility / Node Account</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {currentOrgList.map((org, i) => (
                      <button
                        key={org.email}
                        onClick={() => selectOrgAccount(i)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                          selectedOrgIndex === i
                            ? "bg-teal-500/20 text-teal-300 border border-teal-500/50 font-bold"
                            : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {org.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Credentials Form */}
              <div className="space-y-3.5 mb-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@organization.gov.in"
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 pr-12 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs mb-4">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs mb-4">
                  <CheckCircle2 size={14} className="shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 shadow-lg shadow-teal-500/20"
                style={{ background: "linear-gradient(135deg, #06b6d4, #6366f1)" }}
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock size={14} /> Sign In <ArrowRight size={14} />
                  </>
                )}
              </button>

              <div className="mt-4 pt-4 border-t border-white/10 text-center">
                <p className="text-xs text-slate-400">
                  Don't have an account?{" "}
                  <button
                    onClick={() => { setAuthMode("register"); setError(""); }}
                    className="text-teal-400 hover:underline font-semibold"
                  >
                    Register new organization
                  </button>
                </p>
              </div>
            </>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>Register New Account</h2>
                <p className="text-slate-400 text-xs mb-4">Enroll a hospital, supplier, warehouse or admin identity</p>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Account Role *</label>
                <select
                  value={regForm.role}
                  onChange={(e) => setRegForm({ ...regForm, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 bg-slate-900 border border-white/10"
                >
                  <option value="hospital">Hospital / Medical Institution</option>
                  <option value="supplier">Pharmaceutical Supplier / Manufacturer</option>
                  <option value="warehouse">Warehouse / Logistics Manager</option>
                  <option value="pharmacist">Hospital Pharmacist</option>
                  <option value="government">Government / Regulatory Authority</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Amit Verma"
                    value={regForm.name}
                    onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 bg-white/5 border border-white/10"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Organization Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Apollo Hospital"
                    value={regForm.organization}
                    onChange={(e) => setRegForm({ ...regForm, organization: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 bg-white/5 border border-white/10"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="contact@organization.gov.in"
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 bg-white/5 border border-white/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 chars"
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 bg-white/5 border border-white/10"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={regForm.confirmPassword}
                    onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 bg-white/5 border border-white/10"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Phone (Optional)</label>
                <input
                  type="tel"
                  placeholder="+91 98110 00000"
                  value={regForm.phone}
                  onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 bg-white/5 border border-white/10"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs">
                  <CheckCircle2 size={14} className="shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-2 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 shadow-lg shadow-teal-500/20 bg-teal-500"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus size={14} /> Create Account
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <p className="text-xs text-slate-400">
                  Already have credentials?{" "}
                  <button
                    type="button"
                    onClick={() => { setAuthMode("login"); setError(""); }}
                    className="text-teal-400 hover:underline font-semibold"
                  >
                    Sign In instead
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
