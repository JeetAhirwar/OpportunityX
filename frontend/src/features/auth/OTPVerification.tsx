import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

const OTPVerification = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleVerify = async () => {
    if (otp.length < 6) return;
    setIsLoading(true);
    try {
      await api.post("/auth/verify-otp", { otp }, { skipAuth: true });
      toast({ title: "Verified!", description: "Your account has been verified." });
      navigate("/login");
    } catch (error: any) {
      toast({ title: "Verification failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
        <Link to="/" className="mb-8 inline-flex items-center gap-2">
          <div className="gradient-primary flex h-9 w-9 items-center justify-center rounded-lg">
            <Briefcase className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">Opportunity<span className="gradient-text">X</span></span>
        </Link>

        <h1 className="mb-2 font-display text-2xl font-bold">Verify Your Email</h1>
        <p className="mb-8 text-sm text-muted-foreground">Enter the 6-digit code sent to your email</p>

        <div className="mb-6 flex justify-center">
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button onClick={handleVerify} className="gradient-primary w-full border-0" disabled={otp.length < 6 || isLoading}>
          {isLoading ? "Verifying..." : "Verify"} {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>

        <p className="mt-4 text-sm text-muted-foreground">
          Didn't receive the code?{" "}
          <button className="font-medium text-primary hover:underline">Resend</button>
        </p>

        <p className="mt-6">
          <Link to="/login" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            <ArrowLeft className="h-3 w-3" /> Back to Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default OTPVerification;

