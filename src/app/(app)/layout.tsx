import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/nav";

// Shared layout for all authenticated pages: enforces login and shows the nav bar.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-zinc-950 text-zinc-50">
      <div
        className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-6"
        // Pad the top for the iPhone status bar / notch (safe-area inset).
        style={{ paddingTop: "calc(2rem + env(safe-area-inset-top))" }}
      >
        {children}
      </div>
      <Nav />
    </div>
  );
}
