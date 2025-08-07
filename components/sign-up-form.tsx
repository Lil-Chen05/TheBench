"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getAuthRedirectUrl } from "@/lib/utils/environment";
import { logger } from "@/lib/utils/logger";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    // Validate passwords match
    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    try {
      logger.info("User signup attempt", { email });

      // Get the correct redirect URL for this environment - redirect to login after confirmation
      const redirectUrl = getAuthRedirectUrl('/auth/login');

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        logger.authError(null, "signup", error);
        throw error;
      }

      if (data?.user) {
        logger.authSuccess(data.user.id, "signup", { email });
      }

      // Redirect to success page
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      setError(errorMessage);
      logger.error("Signup form error", { email, error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-yellow-400/95 backdrop-blur-sm border-2 border-black shadow-2xl hover:bg-yellow-400 hover:shadow-xl transition-all duration-300 group">
        <CardHeader>
          <CardTitle className="text-3xl font-black text-black pixelated-text uppercase tracking-wide group-hover:text-gray-800 transition-colors duration-300">Sign Up</CardTitle>
          <CardDescription className="text-base text-black/80 font-semibold">Create your account to get off the bench</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-black font-bold uppercase tracking-wide">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="player@thebench.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="bg-white/90 border-2 border-black/30 text-black placeholder:text-black/50 focus:border-black focus:ring-black/20 hover:border-black/50 transition-all duration-200"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-black font-bold uppercase tracking-wide">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  minLength={8}
                  className="bg-white/90 border-2 border-black/30 text-black placeholder:text-black/50 focus:border-black focus:ring-black/20 hover:border-black/50 transition-all duration-200"
                />
                <p className="text-xs text-black/70 font-semibold">Password must be at least 8 characters long</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="repeat-password" className="text-black font-bold uppercase tracking-wide">Repeat Password</Label>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-white/90 border-2 border-black/30 text-black placeholder:text-black/50 focus:border-black focus:ring-black/20 hover:border-black/50 transition-all duration-200"
                />
              </div>
              {error && (
                <div className="bg-red-100 border-2 border-red-600 rounded-lg p-3">
                  <p className="text-sm text-red-700 font-semibold">{error}</p>
                </div>
              )}
              <Button 
                type="submit" 
                className="w-full mt-2 bg-black text-yellow-400 font-black uppercase tracking-widest hover:bg-gray-900 hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-yellow-400 pixelated-text" 
                disabled={isLoading}
              >
                {isLoading ? "Joining The Team..." : "Join The Bench"}
              </Button>
            </div>
            <div className="mt-6 text-center text-sm">
              <span className="text-black/80">Already on the team? </span>
              <Link
                href="/auth/login"
                className="text-black font-bold hover:text-black/80 hover:underline transition-colors duration-200 uppercase tracking-wide"
              >
                Gear Up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}