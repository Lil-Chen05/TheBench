import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-yellow-400">
      <div className="w-full max-w-sm flex flex-col items-center">
        <div className="mb-8 mt-2">
          <span className="text-4xl md:text-5xl font-black pixelated-text text-black select-none">THE BENCH</span>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
