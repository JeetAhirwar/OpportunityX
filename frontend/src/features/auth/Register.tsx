import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/store/AuthContext";
import { Eye, EyeOff, Mail, Lock, User, Briefcase, ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getDashboardPath } from "@/utils/authRoutes";
import OXLogo from "@/components/common/OXLogo";

const roles = [
  { value: "candidate", label: "Job Seeker", desc: "Find and apply for jobs", icon: User },
  { value: "recruiter", label: "Recruiter", desc: "Post jobs and find talent", icon: Users },
];

const Register = () => {
  const [searchParams] = useSearchParams();
  const requestedRole = searchParams.get("role");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(requestedRole === "recruiter" ? "recruiter" : "candidate");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const registeredUser = await register({ name, email, password, role });
      toast({ title: "Account created!", description: "Welcome to OpportunityX." });
      navigate(getDashboardPath(registeredUser.role), { replace: true });
    } catch (error: any) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
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
          <h2 className="mb-4 font-display text-3xl font-bold">Join OpportunityX</h2>
          <p className="text-muted-foreground">Create your account and start exploring thousands of opportunities or find the perfect candidate.</p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="premium-surface w-full max-w-md rounded-lg p-6">
          <Link to="/" className="mb-8 flex items-center gap-2">
            <OXLogo className="h-9 w-9" />
            <span className="font-display text-xl font-bold">Opportunity<span className="gradient-text">X</span></span>
          </Link>

          <h1 className="mb-2 font-display text-2xl font-bold">Create Account</h1>
          <p className="mb-6 text-sm text-muted-foreground">Choose your role and get started</p>

          {/* Role selection */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            {roles.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all ${
                  role === r.value ? "border-primary/60 bg-primary/10 shadow-inner" : "border-border/80 bg-background/40 hover:border-primary/30"
                }`}
              >
                <r.icon className={`h-6 w-6 ${role === r.value ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-sm font-semibold">{r.label}</span>
                <span className="text-xs text-muted-foreground">{r.desc}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required minLength={8} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="gradient-primary w-full border-0" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Account"} {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;

