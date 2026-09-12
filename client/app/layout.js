import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SEO_DEFAULTS } from "@/constants/seo";
import { Toaster } from "sonner";

export const metadata = SEO_DEFAULTS;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#fafafc] text-slate-900 font-sans">
        <AuthProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </body>
    </html>
  );
}
