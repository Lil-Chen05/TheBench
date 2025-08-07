"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { AuthButton } from "@/components/auth-button";
import { Trophy, ArrowRight } from "lucide-react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <main className="min-h-screen flex flex-col items-center bg-black">
      {/* HEADER */}
      <nav className="w-full flex justify-center border-b border-black/10 h-20 bg-black">
        <div className="w-full max-w-6xl flex justify-between items-center p-3 px-8 text-sm">
          <div className="flex gap-5 items-center font-black text-2xl tracking-widest text-yellow-400 select-none">
            THE BENCH
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="w-full flex flex-col items-center justify-center pt-32 py-16 bg-yellow-400 animate-fade-in relative">
        <h1 className="text-6xl md:text-8xl font-black tracking-tight text-black drop-shadow-lg mb-4 font-mono uppercase pixelated-text">
          THE BENCH
        </h1>
        <p className="text-2xl md:text-3xl font-extrabold text-black tracking-wide text-center mb-8 animate-slide-up">
          NO ONE RIDES THE BENCH HERE
        </p>

         {/* Auth Button is under here now */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="relative group">
            {/* Glow effect behind button */}
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-200 animate-pulse"></div>
            
            {/* Main button container */}
            <div className="relative [&_*]:!rounded-full [&_*]:!font-extrabold [&_*]:!uppercase [&_*]:!tracking-widest [&_*]:!text-lg [&_*]:!px-12 [&_*]:!py-4 [&_*]:!shadow-2xl [&_*]:!border-4 [&_*]:transition-all [&_*]:duration-300 [&_*]:hover:scale-110 [&_*]:hover:shadow-xl [&_a]:!text-black [&_a]:!bg-yellow-400 [&_a]:!border-black [&_a]:hover:!bg-white [&_a]:hover:!border-yellow-400 [&_a]:hover:!text-black [&_*]:!transform [&_*]:active:scale-95">
              <AuthButton />
            </div>
          </div>
        </div>
        
        {/* Dashboard Access Button for Logged-in Users */}
        {!loading && user && (
          <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <Link href="/dashboard">
              <Button className="bg-black text-yellow-400 hover:bg-gray-900 hover:text-yellow-300 font-bold text-lg px-8 py-4 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-black hover:border-yellow-400 group">
                <Trophy className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                Go to Dashboard
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
            <p className="text-black/70 text-center mt-4 font-medium">
              Welcome back! Ready to make some picks?
            </p>
          </div>
        )}
      </section>

      {/* OUR STORY SECTION */}
      <section className="w-full flex justify-center bg-black py-16 px-4">
        <div className="max-w-3xl w-full">
          <Card className="bg-black text-white border-yellow-400 shadow-xl animate-fade-in-up">
            <CardContent className="p-8">
              <h2 className="text-3xl md:text-4xl font-black mb-4 text-yellow-400 uppercase tracking-wider">Our Story</h2>
              <p className="text-lg md:text-xl font-medium leading-relaxed">
                In every game, there&apos;s more happening than what we see on the court or field. <span className="font-extrabold text-yellow-400">The Bench</span> is where the next breakout moment brews. It&apos;s where energy builds, where teammates support, where stories begin. Our platform gives fans and students a chance to step off The Bench and into the action—whether they&apos;re making picks, competing in fantasy leagues, or repping their school pride. Just like real players fighting for their shot, our users aren&apos;t bystanders—they&apos;re active participants in the game.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* BEHIND THE NAME SECTION */}
      <section className="w-full flex justify-center bg-yellow-400 py-16 px-4">
        <div className="max-w-3xl w-full">
          <Card className="bg-yellow-400 text-black border-black shadow-xl animate-fade-in-up">
            <CardContent className="p-8">
              <h2 className="text-3xl md:text-4xl font-black mb-4 uppercase tracking-wider">Behind The Name</h2>
              <p className="text-lg md:text-xl font-medium leading-relaxed">
                The line <span className="font-extrabold">&apos;No one rides the bench here&apos;</span> flips a historically negative sports phrase into a call to action. It&apos;s a name that invites everyone into the game — especially powerful on campuses where students may feel on the outside of varsity athletics. It gives you long-term content storytelling potential: underdog stories, rising talent, fan engagement, &apos;next man up&apos; culture. Scalability: Works beyond fantasy sports — merch, interviews, media, athlete collabs, etc.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full flex items-center justify-center border-t border-black mx-auto text-center text-xs gap-8 py-10 bg-black text-white">
        <p>
          Powered by {" "}
          <a
            href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
            target="_blank"
            className="font-bold hover:underline text-yellow-400"
            rel="noreferrer noopener"
          >
            Supabase
          </a>
        </p>
        <ThemeSwitcher />
      </footer>
    </main>
  );
}
