import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-black via-gray-900 to-black relative">
      
      <div className="w-full max-w-md rounded-xl shadow-2xl p-8 border-2 border-yellow-400/50 backdrop-blur-md relative z-10 bg-black/20">
        {/* Content */}
        <div className="relative z-10">
          <div className="mb-8 text-center">
            <span className="text-4xl md:text-5xl font-black pixelated-text text-yellow-400 select-none drop-shadow-2xl">THE BENCH</span>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}