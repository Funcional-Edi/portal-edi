import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { PortalChrome } from "./portal-chrome";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portal de Integração",
  description:
    "Portal modular do time EDI/Tecnologia — documentação viva, homologação e automações com IA.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-white font-sans text-slate-900 antialiased">
        {children}
        <PortalChrome />
      </body>
    </html>
  );
}
