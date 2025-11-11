const fs = require('fs');
const path = require('path');

// Read posts.json
const postsData = JSON.parse(fs.readFileSync('posts.json', 'utf8'));

// Filter out the alert and big-book posts, reverse to show newest first
const posts = postsData
  .filter(post => post.id !== 'alert' && post.id !== 'big-book')
  .reverse()
  .slice(0, 20); // Get latest 20 posts

// Helper function to strip HTML tags and decode entities
function stripHtml(html) {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&shy;/g, '')
    .replace(/&[a-z]+;/gi, match => {
      const entities = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&ndash;': '–',
        '&mdash;': '—',
        '&hellip;': '…'
      };
      return entities[match] || match;
    });
}

// Helper function to escape XML special characters
function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Generate RSS items
const items = posts.map(post => {
  const plainText = stripHtml(post.text);
  const description = plainText.length > 300 
    ? plainText.substring(0, 300) + '...' 
    : plainText;
  
  const categories = post.tags
    .map(tag => `    <category>${escapeXml(tag)}</category>`)
    .join('\n');
  
  return `  <item>
    <title>${escapeXml(post.title)}</title>
    <link>https://wesleysnipesfacts.com/post.html?id=${post.id}</link>
    <guid>https://wesleysnipesfacts.com/post.html?id=${post.id}</guid>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <description>${escapeXml(description)}</description>
${categories}
  </item>`;
}).join('\n\n');

// Generate RSS XML
const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="rss.xsl"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Wesley Snipes Facts™</title>
    <link>https://wesleysnipesfacts.com</link>
    <description>Your Home for Wesley Snipes Fact Checks!</description>
    <language>en-US</language>
    <atom:link href="https://wesleysnipesfacts.com/rss.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    
${items}
    
  </channel>
</rss>`;

// Write RSS file
fs.writeFileSync('rss.xml', rssXml);
console.log('✅ RSS feed generated successfully!');
console.log(`📝 Generated ${posts.length} items`);
console.log('📍 Output: rss.xml');