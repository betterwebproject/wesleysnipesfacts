<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:svg="http://www.w3.org/2000/svg">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  
  <xsl:template match="/">
    <html lang="en-US">
      <head>         
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, interactive-widget=resizes-content"/>
        <meta name="color-scheme" content="light dark"/>
        <title><xsl:value-of select="rss/channel/title"/> RSS Feed - Wesley Snipes Facts</title>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="32x32"/>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any"/>
        <link rel="stylesheet" href="/assets/css/style.css"/>  
        <style>main{max-width:56ch}.info{margin-block-start:var(--big-gap);margin-block-end:calc(var(--big-gap) * 1.25)}.subscribe{width:fit-content;padding:.75rem var(--gap);border:1px solid var(--border);border-radius:1rem;box-shadow:0 2px 6px rgba(0,0,0,.05);font-family:monospace;font-size:var(--micro);word-break:break-all;background:var(--post-background)}.item{padding:var(--big-gap) var(--gap);border:1px solid var(--border);border-radius:1rem;box-shadow:0 2px 6px rgba(0,0,0,.05);background-color:var(--post-background)}.item+.item{margin-block-start:calc(var(--big-gap) * 2)}.item-title{font-family:var(--heading);font-size:var(--heading-1)}.tags{display:flex;flex-wrap:wrap}.tag{color:var(--accent)}</style>
      </head>
      <body>
        <a href="#main-content" class="skip-link">Skip to content</a>
        <header class="header-small">
          <img class="header-image" src="/assets/graphics/header_img.webp" alt="Image of Wesley Snipes, with Kwanzaa facepaint and Egyptian rod, in a jail cell for tax evasion" width="500" height="500"/>
          <a class="margins-off" href="/">
            <svg:svg viewBox="0 0 25 21.4" role="img" aria-hidden="true">
              <svg:path fill="currentColor" d="M.523 9.449a1.79 1.79 0 0 0 0 2.528l8.929 8.928a1.788 1.788 0 0 0 2.528-2.527l-5.888-5.882h17.121c.988 0 1.786-.798 1.786-1.786s-.798-1.786-1.786-1.786H6.098l5.876-5.881A1.788 1.788 0 0 0 9.446.515L.518 9.443z"/>
            </svg:svg>
            <span class="site-title-small">Wesley Snipes Facts<sup>TM</sup></span>
          </a>
        </header>
        <main id="main-content" class="margins-off" tabindex="-1">
          <div class="info">
            <h1>RSS Feed</h1>
            <p>This is an RSS feed. Copy the URL below into your RSS reader to subscribe. Or scroll down for the latest facts.🔥</p>
            <p class="subscribe"><xsl:value-of select="rss/channel/atom:link/@href"/></p>
          </div>
          
          <xsl:for-each select="rss/channel/item">
            <div class="item">
              <h2 class="item-title">
                <a href="{link}"><xsl:value-of select="title"/></a>
              </h2>
              <div class="item-description">
                <xsl:value-of select="description" disable-output-escaping="yes"/>
              </div>
              <xsl:if test="category">
                <div class="tags margins-off">
                  <xsl:for-each select="category">
                    <span class="tag"><xsl:value-of select="."/></span>
                  </xsl:for-each>
                </div>
              </xsl:if>
            </div>
          </xsl:for-each>
          
        </main>
      </body>
    </html>
  </xsl:template>
  
</xsl:stylesheet>