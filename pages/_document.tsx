import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="description" content="Generate beautiful, customizable GitHub statistics cards for your profile README. Free GitHub stats generator with 40+ themes, multiple card types, and live preview." />
        <meta name="keywords" content="github stats, github profile, github readme, github stats card, github statistics, profile readme, github badges, github metrics" />
        <meta name="author" content="GitHub Stats Generator" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="GitHub Stats Generator" />
        <meta property="og:description" content="Generate beautiful, customizable GitHub statistics cards for your profile README. 40+ themes, multiple card types, and live preview." />
        <meta property="og:image" content="/og-image.png" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="GitHub Stats Generator" />
        <meta name="twitter:description" content="Generate beautiful, customizable GitHub statistics cards for your profile README." />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://github-states-generator.vercel.app" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

