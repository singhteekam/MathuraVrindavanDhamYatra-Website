<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9">

  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>XML Sitemap — Mathura Vrindavan Dham Yatra</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fafaf9; color: #1c1917; }

          header { background: linear-gradient(135deg, #ea580c, #f97316); color: #fff; padding: 28px 40px; }
          header h1 { font-size: 1.4rem; font-weight: 700; letter-spacing: -0.02em; }
          header p  { font-size: 0.85rem; opacity: 0.85; margin-top: 6px; }

          .summary { display: flex; gap: 24px; padding: 16px 40px; background: #fff7ed; border-bottom: 1px solid #fed7aa; font-size: 0.82rem; color: #9a3412; flex-wrap: wrap; }
          .summary strong { font-weight: 600; }

          table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
          thead th {
            background: #fff7ed;
            color: #7c2d12;
            font-weight: 600;
            padding: 10px 16px;
            text-align: left;
            border-bottom: 2px solid #fdba74;
            white-space: nowrap;
          }
          thead th:first-child { width: 48px; text-align: center; padding-left: 40px; }
          tbody tr { border-bottom: 1px solid #f5f5f4; }
          tbody tr:hover { background: #fff7ed; }
          tbody td { padding: 9px 16px; vertical-align: middle; }
          tbody td:first-child { text-align: center; color: #a8a29e; font-size: 0.75rem; padding-left: 40px; }

          a { color: #ea580c; text-decoration: none; word-break: break-all; }
          a:hover { text-decoration: underline; }

          .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 999px;
            font-size: 0.72rem;
            font-weight: 600;
            letter-spacing: 0.02em;
          }
          .freq  { background: #e7e5e4; color: #57534e; }
          .p-hi  { background: #dcfce7; color: #15803d; }
          .p-med { background: #fef9c3; color: #a16207; }
          .p-low { background: #f1f5f9; color: #64748b; }

          footer { padding: 24px 40px; font-size: 0.78rem; color: #a8a29e; border-top: 1px solid #e7e5e4; margin-top: 8px; }
        </style>
      </head>
      <body>

        <header>
          <h1>Mathura Vrindavan Dham Yatra — XML Sitemap</h1>
          <p>
            <xsl:value-of select="count(sm:urlset/sm:url)"/> URLs ·
            Generated <xsl:value-of select="substring(sm:urlset/sm:url[1]/sm:lastmod, 1, 10)"/>
          </p>
        </header>

        <div class="summary">
          <span>This sitemap is read by search engines (Google, Bing) to discover all pages on the site.</span>
          <span>Total URLs: <strong><xsl:value-of select="count(sm:urlset/sm:url)"/></strong></span>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>URL</th>
              <th>Last Modified</th>
              <th>Change Frequency</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            <xsl:for-each select="sm:urlset/sm:url">
              <tr>
                <td><xsl:value-of select="position()"/></td>
                <td>
                  <a href="{sm:loc}">
                    <xsl:value-of select="sm:loc"/>
                  </a>
                </td>
                <td><xsl:value-of select="substring(sm:lastmod, 1, 10)"/></td>
                <td>
                  <span class="badge freq">
                    <xsl:value-of select="sm:changefreq"/>
                  </span>
                </td>
                <td>
                  <xsl:variable name="pri" select="number(sm:priority)"/>
                  <xsl:choose>
                    <xsl:when test="$pri >= 0.8">
                      <span class="badge p-hi"><xsl:value-of select="sm:priority"/></span>
                    </xsl:when>
                    <xsl:when test="$pri >= 0.5">
                      <span class="badge p-med"><xsl:value-of select="sm:priority"/></span>
                    </xsl:when>
                    <xsl:otherwise>
                      <span class="badge p-low"><xsl:value-of select="sm:priority"/></span>
                    </xsl:otherwise>
                  </xsl:choose>
                </td>
              </tr>
            </xsl:for-each>
          </tbody>
        </table>

        <footer>
          Mathura Vrindavan Dham Yatra · mathuravrindavandhamyatra.com
        </footer>

      </body>
    </html>
  </xsl:template>

</xsl:stylesheet>
