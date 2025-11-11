import Reports from "../../../pages-src/Reports";

export const metadata = {
  title: "Reports",
  description: "View AI-analyzed medical reports and summaries.",
};

export default function Page({ params }) {
  return <Reports userId={params.userId} />;
}

