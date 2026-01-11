"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/dashboard");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-400/30 shadow-2xl hover:border-yellow-400/60 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-3xl font-black text-yellow-400 pixelated-text uppercase tracking-wide">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-yellow-400 font-bold uppercase tracking-wide">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="player@thebench.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/50 border-2 border-yellow-400/30 text-yellow-100 placeholder:text-yellow-400/50 focus:border-yellow-400 focus:ring-yellow-400/20 hover:border-yellow-400/50 transition-all duration-200"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-yellow-400 font-bold uppercase tracking-wide">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm text-yellow-300 font-bold hover:text-yellow-400 hover:underline transition-colors duration-200"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black/50 border-2 border-yellow-400/30 text-yellow-100 placeholder:text-yellow-400/50 focus:border-yellow-400 focus:ring-yellow-400/20 hover:border-yellow-400/50 transition-all duration-200"
                />
              </div>
              {error && (
                <div className="bg-red-900/20 border-2 border-red-400 rounded-lg p-3">
                  <p className="text-sm text-red-300 font-semibold">{error}</p>
                </div>
              )}
              <Button 
                type="submit" 
                className="w-full mt-2 bg-yellow-400 text-black font-black uppercase tracking-widest hover:bg-yellow-300 hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-black pixelated-text" 
                disabled={isLoading}
              >
                {isLoading ? "Getting You In..." : "Enter The Bench"}
              </Button>
            </div>
            <div className="mt-6 text-center text-sm">
              <span className="text-yellow-300/80">New to the team? </span>
              <Link
                href="/auth/sign-up"
                className="text-yellow-400 font-bold hover:text-yellow-300 hover:underline transition-colors duration-200 uppercase tracking-wide"
              >
                Join The Bench
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}