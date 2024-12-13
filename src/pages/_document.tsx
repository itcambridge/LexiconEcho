import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="x-content-type-options" content="nosniff" />
        <meta httpEquiv="cache-control" content="public, max-age=31536000, immutable" />
        <title>LexiconEcho - Executive Consultation System</title>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 