import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Trash2, Edit2, LogOut, Users, Home as HomeIcon,
  UserCheck, UserX, Shield, X, Save, Eye, ChevronDown, ChevronUp
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import { toast } from "sonner";
import ThemeToggle from "@/components/ThemeToggle";
import { getEntries, deleteEntry, updateEntry, type CensusEntry } from "@/lib/census-data";

const CHART_COLORS = ["hsl(210,100%,50%)", "hsl(200,100%,55%)", "hsl(220,80%,45%)", "hsl(190,90%,50%)", "hsl(230,70%,55%)", "hsl(210,60%,65%)"];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<CensusEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<CensusEntry | null>(null);
  const [viewingEntry, setViewingEntry] = useState<CensusEntry | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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
    setEditData({ ...entry, members: entry.members.map(m => ({ ...m })) });
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

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const InfoRow = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex justify-between py-1.5 border-b border-border/30 last:border-0">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <span className="text-xs text-foreground font-semibold text-right max-w-[60%]">{value || "—"}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
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

        {/* Entries Table */}
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
            <div className="space-y-3">
              {filtered.map(entry => (
                <div key={entry.id} className="glass rounded-xl border border-border/50 overflow-hidden">
                  {/* Summary Row */}
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-primary/5 transition-colors"
                    onClick={() => toggleRow(entry.id)}
                  >
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-sm">
                      <div>
                        <p className="text-[10px] text-muted-foreground">Head of Family</p>
                        <p className="font-semibold text-foreground truncate">{entry.headOfFamily}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">State</p>
                        <p className="text-foreground truncate">{entry.state}</p>
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-[10px] text-muted-foreground">District</p>
                        <p className="text-foreground truncate">{entry.district}</p>
                      </div>
                      <div className="hidden md:block">
                        <p className="text-[10px] text-muted-foreground">Village</p>
                        <p className="text-foreground truncate">{entry.village}</p>
                      </div>
                      <div className="hidden md:block">
                        <p className="text-[10px] text-muted-foreground">Members</p>
                        <p className="text-foreground">{entry.numberOfMembers}</p>
                      </div>
                      <div className="hidden md:block">
                        <p className="text-[10px] text-muted-foreground">Submitted</p>
                        <p className="text-foreground text-xs">{new Date(entry.submittedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={e => { e.stopPropagation(); setViewingEntry(entry); }} className="p-1.5 rounded-md hover:bg-primary/10 text-primary" title="View Full Details">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); handleEdit(entry); }} className="p-1.5 rounded-md hover:bg-primary/10 text-primary" title="Edit">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); handleDelete(entry.id); }} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {expandedRows.has(entry.id) ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {/* Expanded Inline Details */}
                  <AnimatePresence>
                    {expandedRows.has(entry.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-border/50"
                      >
                        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Location Info */}
                          <div className="glass rounded-lg p-3">
                            <h4 className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">📍 Location</h4>
                            <InfoRow label="State" value={entry.state} />
                            <InfoRow label="District" value={entry.district} />
                            <InfoRow label="Taluk" value={entry.taluk} />
                            <InfoRow label="Village / Area" value={entry.village} />
                            <InfoRow label="Pincode" value={entry.pincode} />
                          </div>

                          {/* Family Info */}
                          <div className="glass rounded-lg p-3">
                            <h4 className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">👨‍👩‍👧 Family</h4>
                            <InfoRow label="Head of Family" value={entry.headOfFamily} />
                            <InfoRow label="House Number" value={entry.houseNumber} />
                            <InfoRow label="House Type" value={entry.houseType} />
                            <InfoRow label="Members" value={entry.numberOfMembers} />
                            <InfoRow label="Monthly Income" value={entry.monthlyIncome} />
                          </div>

                          {/* Additional Info */}
                          <div className="glass rounded-lg p-3">
                            <h4 className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">📊 Additional</h4>
                            <InfoRow label="Religion" value={entry.religion} />
                            <InfoRow label="Category" value={entry.category} />
                            <InfoRow label="Disability" value={entry.disabilityStatus} />
                            <InfoRow label="Migration" value={entry.migrationStatus} />
                            <InfoRow label="Internet" value={entry.internetAvailability} />
                            <InfoRow label="Water Source" value={entry.drinkingWaterSource} />
                            <InfoRow label="Toilet" value={entry.toiletFacility} />
                            <InfoRow label="Electricity" value={entry.electricityAvailability} />
                          </div>

                          {/* Members Table */}
                          {entry.members.length > 0 && (
                            <div className="md:col-span-3 glass rounded-lg p-3">
                              <h4 className="text-xs font-bold text-primary mb-3 uppercase tracking-wider">👤 Family Members</h4>
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="border-b border-border">
                                      {["#", "Name", "Age", "Gender", "Education", "Occupation", "Working", "Marital Status", "Phone", "Aadhaar"].map(h => (
                                        <th key={h} className="text-left py-2 px-2 text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {entry.members.map((m, i) => (
                                      <tr key={i} className="border-b border-border/30 hover:bg-primary/5">
                                        <td className="py-2 px-2 text-muted-foreground">{i + 1}</td>
                                        <td className="py-2 px-2 font-medium text-foreground whitespace-nowrap">{m.name || "—"}</td>
                                        <td className="py-2 px-2 text-foreground">{m.age || "—"}</td>
                                        <td className="py-2 px-2 text-foreground">{m.gender || "—"}</td>
                                        <td className="py-2 px-2 text-foreground whitespace-nowrap">{m.education || "—"}</td>
                                        <td className="py-2 px-2 text-foreground whitespace-nowrap">{m.occupation || "—"}</td>
                                        <td className="py-2 px-2 text-foreground">{m.workingStatus || "—"}</td>
                                        <td className="py-2 px-2 text-foreground whitespace-nowrap">{m.maritalStatus || "—"}</td>
                                        <td className="py-2 px-2 text-foreground">{m.phone || "—"}</td>
                                        <td className="py-2 px-2 text-foreground">{m.aadhaar || "—"}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Full Detail View Modal */}
        <AnimatePresence>
          {viewingEntry && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setViewingEntry(null)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass neon-border rounded-2xl p-6 w-full max-w-3xl max-h-[85vh] overflow-y-auto m-4"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-display font-bold text-foreground text-lg">Full Census Details</h3>
                  <button onClick={() => setViewingEntry(null)} className="p-1 hover:bg-muted rounded-md">
                    <X className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div className="glass rounded-lg p-4">
                    <h4 className="text-sm font-bold text-primary mb-3">📍 Location Details</h4>
                    <InfoRow label="State" value={viewingEntry.state} />
                    <InfoRow label="District" value={viewingEntry.district} />
                    <InfoRow label="Taluk" value={viewingEntry.taluk} />
                    <InfoRow label="Village / Area" value={viewingEntry.village} />
                    <InfoRow label="Pincode" value={viewingEntry.pincode} />
                  </div>
                  <div className="glass rounded-lg p-4">
                    <h4 className="text-sm font-bold text-primary mb-3">👨‍👩‍👧 Family Details</h4>
                    <InfoRow label="Head of Family" value={viewingEntry.headOfFamily} />
                    <InfoRow label="House Number" value={viewingEntry.houseNumber} />
                    <InfoRow label="House Type" value={viewingEntry.houseType} />
                    <InfoRow label="Total Members" value={viewingEntry.numberOfMembers} />
                    <InfoRow label="Monthly Income" value={viewingEntry.monthlyIncome} />
                  </div>
                </div>

                <div className="glass rounded-lg p-4 mb-5">
                  <h4 className="text-sm font-bold text-primary mb-3">📊 Additional Information</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4">
                    <InfoRow label="Religion" value={viewingEntry.religion} />
                    <InfoRow label="Category" value={viewingEntry.category} />
                    <InfoRow label="Disability" value={viewingEntry.disabilityStatus} />
                    <InfoRow label="Migration" value={viewingEntry.migrationStatus} />
                    <InfoRow label="Internet" value={viewingEntry.internetAvailability} />
                    <InfoRow label="Water Source" value={viewingEntry.drinkingWaterSource} />
                    <InfoRow label="Toilet" value={viewingEntry.toiletFacility} />
                    <InfoRow label="Electricity" value={viewingEntry.electricityAvailability} />
                  </div>
                </div>

                {viewingEntry.members.length > 0 && (
                  <div className="glass rounded-lg p-4">
                    <h4 className="text-sm font-bold text-primary mb-3">👤 Family Members ({viewingEntry.members.length})</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border">
                            {["#", "Name", "Age", "Gender", "Education", "Occupation", "Working", "Marital Status", "Phone", "Aadhaar"].map(h => (
                              <th key={h} className="text-left py-2 px-2 text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {viewingEntry.members.map((m, i) => (
                            <tr key={i} className="border-b border-border/30">
                              <td className="py-2 px-2 text-muted-foreground">{i + 1}</td>
                              <td className="py-2 px-2 font-medium text-foreground whitespace-nowrap">{m.name || "—"}</td>
                              <td className="py-2 px-2 text-foreground">{m.age || "—"}</td>
                              <td className="py-2 px-2 text-foreground">{m.gender || "—"}</td>
                              <td className="py-2 px-2 text-foreground whitespace-nowrap">{m.education || "—"}</td>
                              <td className="py-2 px-2 text-foreground whitespace-nowrap">{m.occupation || "—"}</td>
                              <td className="py-2 px-2 text-foreground">{m.workingStatus || "—"}</td>
                              <td className="py-2 px-2 text-foreground whitespace-nowrap">{m.maritalStatus || "—"}</td>
                              <td className="py-2 px-2 text-foreground">{m.phone || "—"}</td>
                              <td className="py-2 px-2 text-foreground">{m.aadhaar || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-muted-foreground mt-4 text-right">Submitted: {new Date(viewingEntry.submittedAt).toLocaleString()}</p>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Edit Modal */}
        {editingId && editData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass neon-border rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto m-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-foreground">Edit Entry</h3>
                <button onClick={() => { setEditingId(null); setEditData(null); }} className="p-1 hover:bg-muted rounded-md">
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              {/* Basic fields */}
              <h4 className="text-xs font-bold text-primary mb-2 uppercase">Location & Family</h4>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {(["headOfFamily", "state", "district", "taluk", "village", "pincode", "houseNumber", "houseType", "monthlyIncome", "religion", "category"] as const).map(field => (
                  <div key={field}>
                    <label className="text-xs text-muted-foreground capitalize">{field.replace(/([A-Z])/g, " $1")}</label>
                    <input
                      value={editData[field] as string}
                      onChange={e => setEditData({ ...editData, [field]: e.target.value })}
                      className="w-full glass rounded-lg px-3 py-2 text-sm text-foreground bg-transparent focus:outline-none focus:ring-2 focus:ring-ring mt-1"
                    />
                  </div>
                ))}
              </div>

              {/* Additional fields */}
              <h4 className="text-xs font-bold text-primary mb-2 uppercase">Additional Info</h4>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {(["disabilityStatus", "migrationStatus", "internetAvailability", "drinkingWaterSource", "toiletFacility", "electricityAvailability"] as const).map(field => (
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

              {/* Members editing */}
              {editData.members.length > 0 && (
                <>
                  <h4 className="text-xs font-bold text-primary mb-2 uppercase">Family Members</h4>
                  <div className="space-y-3 mb-4">
                    {editData.members.map((member, idx) => (
                      <div key={idx} className="glass rounded-lg p-3">
                        <p className="text-xs font-semibold text-primary mb-2">Member {idx + 1}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {(["name", "age", "gender", "education", "occupation", "workingStatus", "maritalStatus", "phone", "aadhaar"] as const).map(f => (
                            <div key={f}>
                              <label className="text-[10px] text-muted-foreground capitalize">{f.replace(/([A-Z])/g, " $1")}</label>
                              <input
                                value={member[f]}
                                onChange={e => {
                                  const updated = [...editData.members];
                                  updated[idx] = { ...updated[idx], [f]: e.target.value };
                                  setEditData({ ...editData, members: updated });
                                }}
                                className="w-full glass rounded-md px-2 py-1.5 text-xs text-foreground bg-transparent focus:outline-none focus:ring-1 focus:ring-ring mt-0.5"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3">
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
