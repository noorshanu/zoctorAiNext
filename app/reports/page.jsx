import { Suspense } from "react";
import ClientPage from "./ClientPage";

export const metadata = {
  title: "Reports",
  description: "View AI-analyzed medical reports and summaries.",
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">
          Loading reports…
        </div>
      }
    >
      <ClientPage />
    </Suspense>
  );
}


