import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import Header from "@/components/header";
import { Inter } from "next/font/google";
import { dark } from "@clerk/themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Talentra",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en" className="dark">
        <head>
          <link rel="icon" href="/favlogoround.png" sizes="any" />
        </head>
        <body suppressHydrationWarning className={`${inter.className}`}>
          {/* <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
          > */}
            <Header />
            <main className="min-h-screen">{children}</main>
            <Toaster richColors />

            <footer className="bg-muted/50 py-12">
              <div className="container mx-auto px-4 text-center text-gray-200">
                <p>Crafted with Love & Passion 🚀</p>
              </div>
            </footer>
          {/* </ThemeProvider> */}
        </body>
      </html>
    </ClerkProvider>
  );
}
