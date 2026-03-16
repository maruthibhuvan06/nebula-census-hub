import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, Trash2, Edit2, LogOut, Users, Home as HomeIcon,
  UserCheck, UserX, Shield, X, Save
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import { toast } from "sonner";
import ThemeToggle from "@/components/ThemeToggle";
import { getEntries, deleteEntry, updateEntry, type CensusEntry } from "@/lib/census-data";

const CHART_COLORS = ["#0080ff", "#00c8ff", "#0050cc", "#00a0e0", "#003399", "#66d9ff"];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<CensusEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<CensusEntry | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("admin_auth") !== "true") {
      navigate("/admin");
      return;
    }
    setEntries(getEntries());
  }, [navigate]);

  const filtered = useMemo(() => {
    if (!searchQuery) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter(e =>
      e.headOfFamily.toLowerCase().includes(q) ||
      e.state.toLowerCase().includes(q) ||
      e.district.toLowerCase().includes(q) ||
      e.village.toLowerCase().includes(q)
    );
  }, [entries, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const totalFamilies = entries.length;
    const totalPopulation = entries.reduce((s, e) => s + e.numberOfMembers, 0);
    let male = 0, female = 0, other = 0, working = 0, notWorking = 0;
    entries.forEach(e => e.members.forEach(m => {
      if (m.gender === "Male") male++;
      else if (m.gender === "Female") female++;
      else other++;
      if (m.workingStatus === "Yes") working++;
      else if (m.workingStatus === "No") notWorking++;
    }));
    return { totalFamilies, totalPopulation, male, female, other, working, notWorking };
  }, [entries]);

  const genderData = [
    { name: "Male", value: stats.male },
    { name: "Female", value: stats.female },
    { name: "Other", value: stats.other },
  ].filter(d => d.value > 0);

  const workData = [
    { name: "Working", value: stats.working },
    { name: "Not Working", value: stats.notWorking },
  ];

  const handleDelete = (id: string) => {
    deleteEntry(id);
    setEntries(getEntries());
    toast.success("Entry deleted");
  };

  const handleEdit = (entry: CensusEntry) => {
    setEditingId(entry.id);
    setEditData({ ...entry });
  };

  const handleSave = () => {
    if (editData) {
      updateEntry(editData.id, editData);
      setEntries(getEntries());
      setEditingId(null);
      setEditData(null);
      toast.success("Entry updated");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-strong border-b border-border sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center neon-glow">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button onClick={handleLogout} className="glass neon-border rounded-lg px-4 py-2 text-sm font-medium text-foreground flex items-center gap-2 hover:bg-destructive/10">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: HomeIcon, label: "Total Families", value: stats.totalFamilies, color: "text-primary" },
            { icon: Users, label: "Total Population", value: stats.totalPopulation, color: "text-accent" },
            { icon: UserCheck, label: "Working", value: stats.working, color: "text-green-400" },
            { icon: UserX, label: "Not Working", value: stats.notWorking, color: "text-orange-400" },
          ].map(({ icon: Icon, label, value, color }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass neon-border rounded-xl p-4">
              <Icon className={`h-6 w-6 ${color} mb-2`} />
              <p className="text-2xl font-display font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        {entries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass neon-border rounded-xl p-4">
              <h3 className="font-display font-semibold text-foreground mb-4">Gender Distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {genderData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="glass neon-border rounded-xl p-4">
              <h3 className="font-display font-semibold text-foreground mb-4">Working Status</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={workData}>
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(210,100%,50%)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Search + Table */}
        <div className="glass neon-border rounded-xl p-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
            <h3 className="font-display font-semibold text-foreground">Census Entries ({filtered.length})</h3>
            <div className="flex-1" />
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name, state, district..."
                className="w-full glass rounded-lg pl-10 pr-4 py-2 text-sm text-foreground bg-transparent focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No entries found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Head of Family", "State", "District", "Village", "Members", "Submitted", "Actions"].map(h => (
                      <th key={h} className="text-left py-3 px-3 text-muted-foreground font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(entry => (
                    <tr key={entry.id} className="border-b border-border/50 hover:bg-primary/5 transition-colors">
                      <td className="py-3 px-3 font-medium text-foreground">{entry.headOfFamily}</td>
                      <td className="py-3 px-3 text-muted-foreground">{entry.state}</td>
                      <td className="py-3 px-3 text-muted-foreground">{entry.district}</td>
                      <td className="py-3 px-3 text-muted-foreground">{entry.village}</td>
                      <td className="py-3 px-3 text-foreground">{entry.numberOfMembers}</td>
                      <td className="py-3 px-3 text-muted-foreground text-xs">{new Date(entry.submittedAt).toLocaleDateString()}</td>
                      <td className="py-3 px-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(entry)} className="p-1.5 rounded-md hover:bg-primary/10 text-primary">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(entry.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {editingId && editData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass neon-border rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-foreground">Edit Entry</h3>
                <button onClick={() => { setEditingId(null); setEditData(null); }} className="p-1 hover:bg-muted rounded-md">
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(["headOfFamily", "state", "district", "village", "pincode", "houseNumber"] as const).map(field => (
                  <div key={field}>
                    <label className="text-xs text-muted-foreground capitalize">{field.replace(/([A-Z])/g, " $1")}</label>
                    <input
                      value={editData[field]}
                      onChange={e => setEditData({ ...editData, [field]: e.target.value })}
                      className="w-full glass rounded-lg px-3 py-2 text-sm text-foreground bg-transparent focus:outline-none focus:ring-2 focus:ring-ring mt-1"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => { setEditingId(null); setEditData(null); }} className="glass neon-border px-4 py-2 rounded-lg text-sm font-medium text-foreground">
                  Cancel
                </button>
                <button onClick={handleSave} className="gradient-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 neon-glow">
                  <Save className="h-4 w-4" /> Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
