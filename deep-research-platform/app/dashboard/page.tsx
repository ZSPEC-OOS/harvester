import { Container } from "@/components/layout/Container";
import { TopBar } from "@/components/layout/TopBar";
import { ResearchConsole } from "@/components/research/ResearchConsole";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-ds-bg text-ds-text">
      <TopBar />
      <Container>
        <ResearchConsole />
      </Container>
    </main>
  );
}
