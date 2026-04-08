"use client";
import { useSearchParams } from "next/navigation";
import ResetPassword from "../../pages-src/ResetPassword";

export default function ClientPage() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || "";
  return <ResetPassword token={token} />;
}



