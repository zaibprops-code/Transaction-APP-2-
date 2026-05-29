export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1 min-h-0 overflow-y-auto pb-16 md:pb-0">
      {children}
    </main>
  );
}
