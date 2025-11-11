"use client";
import Image from "next/image";

export default function Loader() {
  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-[#0e0e0e]">
      <div className="relative flex flex-col items-center">
        <div className="absolute -inset-10 rounded-full bg-blue-500/10 blur-2xl" />
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full border-4 border-blue-500/30" />
          <div className="absolute inset-4 animate-pulse rounded-full border-2 border-blue-400/40" />
          <div className="relative rounded-full p-3 bg-white/5 ring-1 ring-white/10 backdrop-blur">
            <Image
              src="/images/logo.png"
              width={96}
              height={96}
              alt="ZoctorAI"
              priority
              className="rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

