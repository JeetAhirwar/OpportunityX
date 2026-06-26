import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/store/AuthContext";
import { Eye, EyeOff, Mail, Lock, Briefcase, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getDashboardPath } from "@/utils/authRoutes";
import OXLogo from "@/components/common/OXLogo";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const authenticatedUser = await login(email, password);
      toast({ title: "Welcome back!", description: "You've been logged in successfully." });
      navigate(getDashboardPath(authenticatedUser.role), { replace: true });
    } catch (error: any) {
      toast({ title: "Login failed", description: error.message || "Invalid credentials", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-shell flex min-h-screen">
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden border-r border-border/70 bg-card/45 lg:flex">
        <div className="surface-grid absolute inset-0 opacity-60" />
        <div className="relative max-w-md p-12 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
            <Briefcase className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mb-4 font-display text-3xl font-bold">Welcome Back</h2>
          <p className="text-muted-foreground">Sign in to access your dashboard, manage applications, and discover new opportunities.</p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="premium-surface w-full max-w-md rounded-lg p-6">
          <Link to="/" className="mb-8 flex items-center gap-2">
            <OXLogo className="h-9 w-9" />
            <span className="font-display text-xl font-bold">Opportunity<span className="gradient-text">X</span></span>
          </Link>

          <h1 className="mb-2 font-display text-2xl font-bold">Sign In</h1>
          <p className="mb-8 text-sm text-muted-foreground">Enter your credentials to access your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="gradient-primary w-full border-0" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"} {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">Create one</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;

