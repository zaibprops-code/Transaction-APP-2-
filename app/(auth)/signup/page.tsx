"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Zap, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isDemo } from "@/lib/utils";

const passwordRequirements = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Contains a number", test: (p: string) => /\d/.test(p) },
  { label: "Contains uppercase", test: (p: string) => /[A-Z]/.test(p) },
];

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const demo = isDemo();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (demo) {
      await new Promise(r => setTimeout(r, 1000));
      router.push("/onboarding");
      return;
    }

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) throw error;
      router.push("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {demo && (
        <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-400 text-center">
          Demo mode — sign up will redirect to onboarding. Add Supabase keys to enable real auth.
        </div>
      )}

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Start your free trial</h1>
        <p className="text-sm text-muted-foreground">
          14 days free. No credit card required.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Full name</label>
          <Input
            type="text"
            placeholder="Sarah Mitchell"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Work email</label>
          <Input
            type="email"
            placeholder="you@brokerage.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Password</label>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          {password && (
            <div className="space-y-1 mt-2">
              {passwordRequirements.map(req => {
                const met = req.test(password);
                return (
                  <div key={req.label} className="flex items-center gap-1.5 text-xs">
                    <Check className={`w-3 h-3 ${met ? "text-emerald-400" : "text-muted-foreground/30"}`} />
                    <span className={met ? "text-emerald-400" : "text-muted-foreground/50"}>
                      {req.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          <Zap className="w-4 h-4" />
          Create your account
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          By creating an account, you agree to our{" "}
          <Link href="#" className="text-indigo-400 hover:text-indigo-300">Terms of Service</Link>{" "}
          and{" "}
          <Link href="#" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</Link>.
        </p>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
          Sign in
        </Link>
      </div>
    </div>
  );
}
