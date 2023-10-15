import { Breadcrumbs } from "@/components/breadcrumbs";
import { Header } from "@/components/header";
import { SessionProvider } from "@/components/session-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { getAdminPanel } from "@/lib/admin-panel";
import { authOptions } from "@/lib/auth";
import "@/styles/globals.css";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Project Allocation",
  description: "A web app for preference based matching",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  const adminPanel = await getAdminPanel(user);

  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light" // TODO:  change in prod
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <Header adminPanel={adminPanel} />
            <main className="flex h-[92dvh] flex-col justify-start gap-4">
              <Breadcrumbs />
              <section className="flex w-full justify-center pt-6">
                {children}
              </section>
            </main>
            <Toaster position="bottom-right" />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
