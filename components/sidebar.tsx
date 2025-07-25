import Link from "next/link";

export default function Sidebar({ active = "dashboard" }: { active?: string }) {
  return (
    <aside className="fixed left-0 top-[60px] h-[calc(100vh-60px)] w-[50px] bg-black flex flex-col items-center py-6 z-40">
      <Link href="/basketball" className="mb-6">
        <span
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
            active === "basketball"
              ? "bg-[#F4D03F] text-black text-2xl shadow-lg"
              : "hover:bg-[#F4D03F]/80 text-white text-xl"
          }`}
          style={{ fontSize: active === "basketball" ? "2rem" : "1.5rem" }}
        >
          🏀
        </span>
      </Link>
      <span className="mb-6 opacity-50 cursor-default select-none text-white text-xl" style={{ fontSize: "1.5rem" }}>
        🏈
      </span>
      <span className="mb-6 opacity-50 cursor-default select-none text-white text-xl" style={{ fontSize: "1.5rem" }}>
        🏒
      </span>
      <span className="opacity-50 cursor-default select-none text-white text-xl" style={{ fontSize: "1.5rem" }}>
        ⚽
      </span>
    </aside>
  );
} 