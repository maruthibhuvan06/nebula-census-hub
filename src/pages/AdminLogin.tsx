import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Lock, User } from "lucide-react";
import { toast } from "sonner";
import ThemeToggle from "@/components/ThemeToggle";

// Demo credentials — in production, use proper server-side auth
const ADMIN_USER = "admin";
const ADMIN_PASS = "census2025";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      sessionStorage.setItem("admin_auth", "true");
      navigate("/admin/dashboard");
    } else {
      toast.error("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 glass neon-border rounded-2xl p-8 w-full max-w-md"
      >
        <div className="flex items-center gap-3 mb-6 justify-center">
          <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center neon-glow">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-foreground">Admin Portal</h1>
            <p className="text-xs text-muted-foreground">Smart Census Portal</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full glass neon-border rounded-lg pl-10 pr-4 py-3 text-foreground bg-transparent focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full glass neon-border rounded-lg pl-10 pr-4 py-3 text-foreground bg-transparent focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
              required
            />
          </div>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full gradient-primary text-primary-foreground py-3 rounded-lg font-display font-semibold neon-glow"
          >
            Login
          </motion.button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Demo: admin / census2025
        </p>
      </motion.div>
    </div>
  );
}
