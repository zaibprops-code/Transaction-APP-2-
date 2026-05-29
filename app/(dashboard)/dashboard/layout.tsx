import { Header } from "@/components/dashboard/header";

export default function DashboardHomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1 min-h-0 overflow-y-auto pb-16 md:pb-0">
        {children}
      </main>
    </>
  );
}
