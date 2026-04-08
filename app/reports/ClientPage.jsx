"use client";
import { useSearchParams } from "next/navigation";
import Reports from "../../pages-src/Reports";

export default function ClientPage() {
  const searchParams = useSearchParams();
  const userId = searchParams?.get("userId") || "";
  return <Reports userId={userId} />;
}



