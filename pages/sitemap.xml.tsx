import { GetServerSideProps } from "next";

function generateSiteMap() {
  // Always use production URL for sitemap (Google doesn't allow preview URLs)
  // Only use VERCEL_URL if it's a production deployment
  const isProduction = process.env.VERCEL_ENV === 'production';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
    (isProduction && process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "https://github-states-generator.vercel.app";
  
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>${baseUrl}</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
       <changefreq>weekly</changefreq>
       <priority>1.0</priority>
     </url>
   </urlset>
 `;
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // Generate the XML sitemap
  const sitemap = generateSiteMap();

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default SiteMap;

