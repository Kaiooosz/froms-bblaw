import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Portal BBLAW | Formulário Especializado",
  description: "Formulários especializados para assessoria jurídica e financeira internacional da Bezerra Borges Advogados.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('unhandledrejection', function(event) {
                if (event.reason && typeof event.reason.message === 'string' && event.reason.message.includes('MetaMask')) {
                  event.preventDefault();
                  event.stopImmediatePropagation();
                  console.warn('Bloqueio reforçado: aviso MetaMask.');
                }
              }, true);
            `
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <div className="premium-bg" />
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
