import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-cover bg-center bg-no-repeat relative" style={{backgroundImage: "url('https://mcgillathletics.ca/images/2024/6/7/hock_m_Picard-Hooper_crop_CIS_2012_WEST-McG_GM7b_Brian_Smith.jpg?width=1884&quality=80&format=jpg)"}}>
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/40"></div>
      
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