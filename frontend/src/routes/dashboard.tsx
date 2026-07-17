import { createFileRoute } from "@tanstack/react-router";
import { AnalysisProvider } from "@/lib/analysis-store";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { DashboardView } from "@/components/dashboard/DashboardView";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — GitGenie" },
      { name: "description", content: "Your AI-generated open source contribution workspace." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <AnalysisProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Sidebar />
        <div className="md:pl-64">
          <Topbar />
          <main className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
            <DashboardView />
          </main>
        </div>
      </div>
    </AnalysisProvider>
  );
}
