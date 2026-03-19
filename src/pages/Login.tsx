import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, User, Mail, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ThemeToggle from "@/components/ThemeToggle";
import { login, register } from "@/lib/auth";

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const resetFields = () => {
    setUsername(""); setEmail(""); setPassword(""); setConfirmPassword("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) { toast.error("Please enter your username"); return; }
    if (!password) { toast.error("Please enter your password"); return; }

    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const result = login(username, password);
    setLoading(false);

    if (result.success) {
      toast.success("Login successful!");
      navigate("/");
    } else {
      toast.error(result.error || "Login failed");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) { toast.error("Please enter a username"); return; }
    if (username.length < 3) { toast.error("Username must be at least 3 characters"); return; }
    if (!email.trim()) { toast.error("Please enter your email"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error("Enter a valid email address"); return; }
    if (!password) { toast.error("Please enter a password"); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (password !== confirmPassword) { toast.error("Passwords do not match"); return; }

    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const result = register(username, email, password);
    if (!result.success) { setLoading(false); toast.error(result.error || "Registration failed"); return; }

    login(username, password);
    setLoading(false);
    toast.success("Account created successfully!");
    navigate("/");
  };

  const focusNext = (nextId: string) => (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); document.getElementById(nextId)?.focus(); }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-accent/5 blur-3xl" />
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
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center neon-glow"
          >
            <Shield className="h-6 w-6 text-primary-foreground" />
          </motion.div>
          <div>
            <h1 className="font-display font-bold text-xl text-foreground">Smart Census Portal</h1>
          </div>
        </div>

        {/* Tab toggle */}
        <div className="flex mb-6 glass rounded-lg p-1">
          <button
            onClick={() => { setIsSignUp(false); resetFields(); }}
            className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${!isSignUp ? "gradient-primary text-primary-foreground neon-glow" : "text-muted-foreground hover:text-foreground"}`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsSignUp(true); resetFields(); }}
            className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${isSignUp ? "gradient-primary text-primary-foreground neon-glow" : "text-muted-foreground hover:text-foreground"}`}
          >
            Sign Up
          </button>
        </div>

        <AnimatePresence mode="wait">
          {!isSignUp ? (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleLogin}
              className="space-y-4"
            >
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full glass neon-border rounded-lg pl-10 pr-4 py-3 text-foreground bg-transparent focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                  onKeyDown={focusNext("login-password")}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full glass neon-border rounded-lg pl-10 pr-12 py-3 text-foreground bg-transparent focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full gradient-primary text-primary-foreground py-3 rounded-lg font-display font-semibold neon-glow flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Login"}
              </motion.button>
            </motion.form>
          ) : (
            <motion.form
              key="signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSignUp}
              className="space-y-4"
            >
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full glass neon-border rounded-lg pl-10 pr-4 py-3 text-foreground bg-transparent focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                  onKeyDown={focusNext("reg-email")}
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full glass neon-border rounded-lg pl-10 pr-4 py-3 text-foreground bg-transparent focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                  onKeyDown={focusNext("reg-password")}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full glass neon-border rounded-lg pl-10 pr-12 py-3 text-foreground bg-transparent focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                  onKeyDown={focusNext("reg-confirm")}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  id="reg-confirm"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full glass neon-border rounded-lg pl-10 pr-4 py-3 text-foreground bg-transparent focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                />
              </div>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full gradient-primary text-primary-foreground py-3 rounded-lg font-display font-semibold neon-glow flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Account"}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="text-sm text-muted-foreground text-center mt-4">
          {isSignUp ? (
            <>Already have an account?{" "}<button onClick={() => { setIsSignUp(false); resetFields(); }} className="text-primary font-medium hover:underline">Sign In</button></>
          ) : (
            <>Don't have an account?{" "}<button onClick={() => { setIsSignUp(true); resetFields(); }} className="text-primary font-medium hover:underline">Sign Up</button></>
          )}
        </p>
      </motion.div>
    </div>
  );
}
