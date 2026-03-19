import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, BarChart3, LogOut } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import CensusForm from "@/components/CensusForm";
import { getCurrentUser, logout } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const user = getCurrentUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 glass-strong border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center neon-glow"
            >
              <Shield className="h-5 w-5 text-primary-foreground" />
            </motion.div>
            <div>
              <h1 className="font-display font-bold text-lg leading-tight text-foreground">
                Smart Census Portal
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-muted-foreground hidden sm:block">
                Welcome, <span className="text-primary font-medium">{user.username}</span>
              </span>
            )}
            <Link
              to="/admin"
              className="glass neon-border rounded-lg px-4 py-2 text-sm font-medium text-foreground flex items-center gap-2 transition-all hover:bg-primary/10"
            >
              <BarChart3 className="h-4 w-4 text-primary" /> Admin
            </Link>
            <button
              onClick={handleLogout}
              className="glass neon-border rounded-lg px-4 py-2 text-sm font-medium text-foreground flex items-center gap-2 transition-all hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold gradient-text mb-2">
            National Census 2025
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Fill in your household details below. All information is kept secure and confidential.
          </p>
        </motion.div>

        <CensusForm />
      </main>
    </div>
  );
}
