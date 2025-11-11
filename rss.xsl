<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  
  <xsl:template match="/">
    <html lang="en-US">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title><xsl:value-of select="rss/channel/title"/> - RSS Feed</title>
        <style>
          @font-face {
          font-family: 'Triptych Roman';
          src: url('/assets/type/triptych_roman.woff2') format('woff2');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
          }
          
          @font-face {
          font-family: 'Triptych Italick';
          src: url('/assets/type/triptych_italick.woff2') format('woff2');
          font-weight: 400;
          font-style: italic;
          font-display: swap;
          }
          
          @font-face {
          font-family: 'Triptych Grotesque';
          src: url('/assets/type/triptych_grotesque.woff2') format('woff2');
          font-weight: bold;
          font-style: normal;
          font-display: swap;
          }
          
          :root {
          --body: 'Triptych Roman', Georgia, serif;
          --italic: 'Triptych Italick', Georgia, serif;
          --heading: 'Triptych Grotesque', Arial, sans-serif;
          --paragraph: calc(1rem + .2vw);
          --micro: calc(var(--paragraph) * .85);
          --heading-1: calc(1.6rem + .75vw);
          --max-width: 56ch;
          --gap: 1.5rem;
          --big-gap: 3rem;
          --primary: #111;
          --accent: brown;
          --border: #DDD;
          --post-background: floralwhite;
          --background: #ECE6DD
          }
          
          @media (prefers-color-scheme:dark) {
          :root {
          --primary: #D3CEC1;
          --accent: #E08585;
          --border: #5D5D5D;
          --post-background: #171717;
          --background: #111
          }
          }
          
          * {
          margin: 0;
          padding: 0;
          box-sizing: border-box
          }
          
          body {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-height: 100vh;
          padding: var(--big-gap) 1rem;
          font-family: var(--body);
          font-size: var(--paragraph);
          line-height: 1.65;
          color: var(--primary);
          background-color: var(--background)
          }
          
          header {
          display: flex;
          flex-direction: column;
          justify-items: center;
          align-items: center;
          }
          
          main {
          max-width: var(--max-width);
          width: 100%
          }
          
          header * + *, 
          main * + * {
          margin-block-start: var(--gap)
          }
          
          .margins-off > * + * {
          margin-block-start: unset;
          }
          
          img.header-image {
          max-width: 200px;
          }
          
          h1 {
          font-family: var(--heading);
          font-size: var(--heading-1);
          line-height: 1.2;
          color: var(--accent);
          }
          
          h2 {
          font-family: var(--italic);
          font-size: calc(var(--heading-1) * .575);
          line-height: 1.2;
          }
          
          .subtitle {
          font-family: var(--italic);
          font-size: var(--subtitle);
          }
          
          .info {
          margin-block-start: calc(var(--big-gap) * 1.5);
          margin-block-end: calc(var(--big-gap) * 1.5);
          }
          
          .subscribe {
          width: fit-content;
          padding: .5rem 1rem;
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
          
          a {
          color: var(--accent);
          text-decoration: none;
          transition: opacity .2s ease
          }
          
          a:hover {
          opacity: .6
          }
          
          sup {
          color: var(--accent);
          line-height: 1
          }
        </style>
      </head>
      <body>
        <main>
          <header>
            <img class="header-image" src="/assets/graphics/header_img.webp" alt="Header image"/>
            <h1><xsl:value-of select="rss/channel/title"/></h1>
            <p class="subtitle"><xsl:value-of select="rss/channel/description"/></p>
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