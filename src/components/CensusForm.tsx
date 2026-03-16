import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, UserPlus, MapPin, Home, Users, BarChart3, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import FloatingInput from "./FloatingInput";
import FloatingSelect from "./FloatingSelect";
import ProgressIndicator from "./ProgressIndicator";
import {
  STATES, DISTRICTS, TALUKS, EDUCATION_LEVELS, OCCUPATIONS, RELIGIONS,
  CATEGORIES, WATER_SOURCES, INCOME_RANGES, HOUSE_TYPES,
  type FamilyMember, type CensusEntry, addEntry,
} from "@/lib/census-data";

const STEPS = ["Location", "Family", "Members", "Additional"];

const emptyMember = (): FamilyMember => ({
  name: "", age: "", gender: "", education: "", occupation: "",
  workingStatus: "", maritalStatus: "", phone: "", aadhaar: "",
});

export default function CensusForm() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // Location
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [taluk, setTaluk] = useState("");
  const [village, setVillage] = useState("");
  const [pincode, setPincode] = useState("");

  // Family
  const [headOfFamily, setHeadOfFamily] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [houseType, setHouseType] = useState("");
  const [memberCount, setMemberCount] = useState("");
  const [customCount, setCustomCount] = useState("");

  // Members
  const [members, setMembers] = useState<FamilyMember[]>([]);

  // Additional
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [religion, setReligion] = useState("");
  const [category, setCategory] = useState("");
  const [disability, setDisability] = useState("");
  const [migration, setMigration] = useState("");
  const [internet, setInternet] = useState("");
  const [waterSource, setWaterSource] = useState("");
  const [toilet, setToilet] = useState("");
  const [electricity, setElectricity] = useState("");

  const actualCount = memberCount === "More than 9" ? parseInt(customCount) || 0 : parseInt(memberCount) || 0;

  const updateMember = (idx: number, field: keyof FamilyMember, val: string) => {
    setMembers(prev => prev.map((m, i) => i === idx ? { ...m, [field]: val } : m));
  };

  const handleMemberCountChange = (val: string) => {
    setMemberCount(val);
    const count = val === "More than 9" ? 0 : parseInt(val) || 0;
    if (val !== "More than 9") {
      setMembers(Array.from({ length: count }, () => emptyMember()));
    }
  };

  const applyCustomCount = () => {
    const count = parseInt(customCount) || 0;
    setMembers(Array.from({ length: count }, () => emptyMember()));
  };

  const canProceed = () => {
    if (step === 0) return state && district && village && pincode;
    if (step === 1) return headOfFamily && houseNumber && houseType && memberCount && actualCount > 0;
    if (step === 2) return members.length > 0 && members.every(m => m.name && m.age && m.gender);
    return true;
  };

  const handleSubmit = () => {
    const entry: CensusEntry = {
      id: crypto.randomUUID(),
      state, district, taluk, village, pincode,
      headOfFamily, houseNumber, houseType,
      numberOfMembers: actualCount, members,
      monthlyIncome, religion, category,
      disabilityStatus: disability, migrationStatus: migration,
      internetAvailability: internet, drinkingWaterSource: waterSource,
      toiletFacility: toilet, electricityAvailability: electricity,
      submittedAt: new Date().toISOString(),
    };
    addEntry(entry);
    setSubmitted(true);
    toast.success("Census data submitted successfully!");
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass neon-border rounded-2xl p-12 text-center max-w-lg mx-auto"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
        >
          <CheckCircle className="h-20 w-20 text-green-400 mx-auto mb-6" />
        </motion.div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-3">Submission Successful!</h2>
        <p className="text-muted-foreground mb-6">Your census data has been recorded.</p>
        <button
          onClick={() => window.location.reload()}
          className="gradient-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold neon-glow transition-transform hover:scale-105"
        >
          Submit Another Entry
        </button>
      </motion.div>
    );
  }

  const districts = DISTRICTS[state] || [];
  const taluks = TALUKS[district] || [];

  return (
    <div className="max-w-4xl mx-auto">
      <ProgressIndicator steps={STEPS} current={step} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
          className="glass neon-border rounded-2xl p-6 md:p-8"
        >
          {/* Step 0: Location */}
          {step === 0 && (
            <div>
              <h2 className="text-xl font-display font-bold text-foreground mb-1 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> Location Information
              </h2>
              <p className="text-sm text-muted-foreground mb-6">Select your location details</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingSelect label="State" options={STATES} value={state} onChange={v => { setState(v); setDistrict(""); setTaluk(""); }} searchable required />
                <FloatingSelect label="District" options={districts} value={district} onChange={v => { setDistrict(v); setTaluk(""); }} searchable required />
                <FloatingSelect label="Taluk" options={taluks} value={taluk} onChange={setTaluk} searchable />
                <FloatingInput label="Village / Area" value={village} onChange={setVillage} required />
                <FloatingInput label="Pincode" value={pincode} onChange={setPincode} type="text" maxLength={6} required />
              </div>
            </div>
          )}

          {/* Step 1: Family */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-display font-bold text-foreground mb-1 flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" /> Family Details
              </h2>
              <p className="text-sm text-muted-foreground mb-6">Enter family head information</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingInput label="Head of Family Name" value={headOfFamily} onChange={setHeadOfFamily} required />
                <FloatingInput label="House Number" value={houseNumber} onChange={setHouseNumber} required />
                <FloatingSelect label="Type of House" options={HOUSE_TYPES} value={houseType} onChange={setHouseType} required />
                <FloatingSelect
                  label="Number of Family Members"
                  options={["1","2","3","4","5","6","7","8","9","More than 9"]}
                  value={memberCount}
                  onChange={handleMemberCountChange}
                  required
                />
                {memberCount === "More than 9" && (
                  <div className="flex gap-2 md:col-span-2">
                    <FloatingInput label="Enter exact number" value={customCount} onChange={setCustomCount} type="number" />
                    <button type="button" onClick={applyCustomCount} className="gradient-primary text-primary-foreground px-4 rounded-lg font-medium">
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Members */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-display font-bold text-foreground mb-1 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Family Members ({members.length})
              </h2>
              <p className="text-sm text-muted-foreground mb-6">Enter details for each family member</p>
              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                {members.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass rounded-xl p-4 border border-border"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <UserPlus className="h-4 w-4 text-primary" />
                      <span className="text-sm font-display font-semibold text-foreground">Member {i + 1}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <FloatingInput label="Name" value={m.name} onChange={v => updateMember(i, "name", v)} required />
                      <FloatingInput label="Age" value={m.age} onChange={v => updateMember(i, "age", v)} type="number" required />
                      <FloatingSelect label="Gender" options={["Male","Female","Other"]} value={m.gender} onChange={v => updateMember(i, "gender", v)} required />
                      <FloatingSelect label="Education" options={EDUCATION_LEVELS} value={m.education} onChange={v => updateMember(i, "education", v)} />
                      <FloatingSelect label="Occupation" options={OCCUPATIONS} value={m.occupation} onChange={v => updateMember(i, "occupation", v)} />
                      <FloatingSelect label="Working Status" options={["Yes","No"]} value={m.workingStatus} onChange={v => updateMember(i, "workingStatus", v)} />
                      <FloatingSelect label="Marital Status" options={["Single","Married","Widowed","Divorced"]} value={m.maritalStatus} onChange={v => updateMember(i, "maritalStatus", v)} />
                      <FloatingInput label="Phone Number" value={m.phone} onChange={v => updateMember(i, "phone", v)} maxLength={10} />
                      <FloatingInput label="Aadhaar (Optional)" value={m.aadhaar} onChange={v => updateMember(i, "aadhaar", v)} maxLength={12} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Additional */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-display font-bold text-foreground mb-1 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" /> Additional Census Data
              </h2>
              <p className="text-sm text-muted-foreground mb-6">Provide additional household details</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FloatingSelect label="Monthly Family Income" options={INCOME_RANGES} value={monthlyIncome} onChange={setMonthlyIncome} />
                <FloatingSelect label="Religion" options={RELIGIONS} value={religion} onChange={setReligion} />
                <FloatingSelect label="Category" options={CATEGORIES} value={category} onChange={setCategory} />
                <FloatingSelect label="Disability Status" options={["Yes","No"]} value={disability} onChange={setDisability} />
                <FloatingSelect label="Migration Status" options={["Migrated","Non-Migrated"]} value={migration} onChange={setMigration} />
                <FloatingSelect label="Internet Availability" options={["Yes","No"]} value={internet} onChange={setInternet} />
                <FloatingSelect label="Drinking Water Source" options={WATER_SOURCES} value={waterSource} onChange={setWaterSource} />
                <FloatingSelect label="Toilet Facility" options={["Yes","No"]} value={toilet} onChange={setToilet} />
                <FloatingSelect label="Electricity Availability" options={["Yes","No"]} value={electricity} onChange={setElectricity} />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="glass neon-border px-6 py-2.5 rounded-lg font-medium text-foreground transition-all hover:bg-primary/10"
              >
                Previous
              </button>
            ) : <div />}

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => canProceed() && setStep(step + 1)}
                disabled={!canProceed()}
                className="gradient-primary text-primary-foreground px-6 py-2.5 rounded-lg font-semibold neon-glow transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
              >
                Next
              </button>
            ) : (
              <motion.button
                type="button"
                onClick={handleSubmit}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="gradient-primary text-primary-foreground px-8 py-2.5 rounded-lg font-semibold neon-glow flex items-center gap-2 animate-pulse-neon"
              >
                <Send className="h-4 w-4" /> Submit Census
              </motion.button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
