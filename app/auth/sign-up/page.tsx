import { SignUpForm } from "@/components/sign-up-form";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-cover bg-center bg-no-repeat relative" style={{backgroundImage: "url('https://images.sidearmdev.com/convert?url=https%3a%2f%2fdxbhsrqyrr690.cloudfront.net%2fsidearm.nextgen.sites%2fmcgill.sidearmsports.com%2fimages%2f2022%2f3%2f10%2fBball_M_Whyne_Quarry_McG_UQAM_F_17_22_33.jpg&type=webp')"}}>
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      <div className="w-full max-w-md rounded-xl shadow-2xl p-8 border-2 border-yellow-400/50 backdrop-blur-md relative z-10 bg-black/20">
        {/* Content */}
        <div className="relative z-10">
          <div className="mb-8 text-center">
            <span className="text-4xl md:text-5xl font-black pixelated-text text-yellow-400 select-none drop-shadow-2xl">THE BENCH</span>
          </div>
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}