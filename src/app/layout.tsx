import { Breadcrumbs } from "@/components/breadcrumbs";
import { Header } from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import "@/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ClearanceProvider } from "./clearance";

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
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light" // TODO:  change in prod
            enableSystem
            disableTransitionOnChange
          >
            <ClearanceProvider>
              <Header />
              <main className="flex h-[92dvh] flex-col justify-start gap-4 pt-[12dvh]">
                <Breadcrumbs />
                <section className="flex w-full justify-center pt-6">
                  {children}
                </section>
              </main>
              <Toaster position="bottom-right" />
            </ClearanceProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
