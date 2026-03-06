import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="pt-BR">
            <Head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              window.addEventListener('unhandledrejection', function(event) {
                if (event.reason && event.reason.message && event.reason.message.includes('MetaMask')) {
                  event.stopImmediatePropagation();
                  event.preventDefault();
                }
              }, true);
            `
                    }}
                />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
