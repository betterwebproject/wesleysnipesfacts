<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:atom="http://www.w3.org/2005/Atom">
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
        <style>
          main {
          max-width: 56ch;
          }

          .info {
          margin-block-start: calc(var(--big-gap) * 1.5);
          margin-block-end: calc(var(--big-gap) * 1.5);
          }
          
          .subscribe {
          width: fit-content;
          padding: .5rem;
          border: 1px solid var(--border);
          border-radius: 1rem;
          box-shadow: 0 2px 6px rgba(0,0,0,.05);
          font-family: monospace;
          font-size: var(--micro);
          word-break: break-all;
          background: var(--post-background);
          }
          
          .item {
          margin-block-start: var(--gap);
          padding: var(--gap);
          border: 1px solid var(--border);
          border-radius: 1rem;
          background-color: var(--post-background)
          }
          
          .item-title {
          font-family: var(--heading);
          font-size: var(--heading-1);
          }
          
          .tags {
          display: flex;
          flex-wrap: wrap;
          }
          
          .tag {
          margin-right: 1rem;
          font-size: var(--micro);
          color: var(--accent);
          }
        </style>
      </head>
      <body>
        <main>
          <header class="header-big">
            <img class="header-image" src="/assets/graphics/header_img.webp" alt="Header image"/>
            <a href="/"><h1 class="site-title-big">Wesley Snipes Facts<sup>TM</sup></h1></a>
            <h2 class="site-description">Your Home for Wesley Snipes Facts Checks!</h2>
          </header>
          
          <div class="info">
            <h1>RSS Feed</h1>
            <p>Copy the URL below into your RSS reader to subscribe.</p>
            <p class="subscribe"><xsl:value-of select="rss/channel/atom:link/@href"/></p>
            <p> Or scroll down for the latest facts.🔥</p>
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