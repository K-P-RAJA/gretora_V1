using Microsoft.AspNetCore.Mvc;

namespace Gretora.API.Controllers
{
    [ApiController]
    public class SitemapController : ControllerBase
    {
        [HttpGet("sitemap.xml")]
        public IActionResult GetSitemap()
        {
            var xml = @"<?xml version=""1.0"" encoding=""UTF-8""?>
<urlset xmlns=""http://www.sitemaps.org/schemas/sitemap/0.9"">
  <url>
    <loc>https://gretora.com/</loc>
    <lastmod>2026-07-27</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://gretora.com/login</loc>
    <lastmod>2026-07-27</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://gretora.com/privacy</loc>
    <lastmod>2026-07-27</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>https://gretora.com/terms</loc>
    <lastmod>2026-07-27</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
</urlset>";
            return Content(xml, "application/xml", System.Text.Encoding.UTF8);
        }

        [HttpGet("robots.txt")]
        public IActionResult GetRobots()
        {
            var txt = @"User-agent: *
Allow: /
Allow: /g/
Disallow: /mygreetings
Disallow: /profile
Disallow: /admin
Disallow: /suspended
Disallow: /reset-password

Sitemap: https://gretora.com/sitemap.xml
Sitemap: https://www.gretora.com/sitemap.xml";
            return Content(txt, "text/plain", System.Text.Encoding.UTF8);
        }
    }
}
