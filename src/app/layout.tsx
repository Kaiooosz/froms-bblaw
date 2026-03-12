import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { ChatButton } from "@/components/ChatButton";
import Script from "next/script";

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
        <ThemeProvider>
          <AuthProvider>
            {children}
            <ChatButton />
          </AuthProvider>
        </ThemeProvider>

        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17998581237"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'AW-17998581237');
          `}
        </Script>
      </body>
    </html>
  );
}
