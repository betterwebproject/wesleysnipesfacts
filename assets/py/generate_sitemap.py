#!/usr/bin/env python3
"""
Sitemap Generator for Wesley Snipes Facts
Generates sitemap.xml from posts.json
"""

import json
from datetime import datetime
from urllib.parse import quote

# Configuration
BASE_URL = 'https://yourwebsite.com'  # UPDATE THIS to your actual domain
SITEMAP_FILE = 'sitemap.xml'

# Static pages
STATIC_PAGES = [
    {'url': '', 'priority': '1.0', 'changefreq': 'weekly'},  # Homepage
    {'url': 'about.html', 'priority': '0.8', 'changefreq': 'monthly'},
    {'url': 'faq.html', 'priority': '0.7', 'changefreq': 'monthly'},
    {'url': 'statement.html', 'priority': '0.6', 'changefreq': 'yearly'},
    {'url': 'death.html', 'priority': '0.7', 'changefreq': 'monthly'},
    {'url': 'tax-revolt.html', 'priority': '0.7', 'changefreq': 'monthly'},
]

def load_posts():
    """Load posts from posts.json"""
    with open('posts.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def get_all_tags(posts):
    """Extract all unique tags from posts"""
    tags = set()
    for post in posts:
        if post.get('id') != 'alert':  # Skip alert post
            for tag in post.get('tags', []):
                tags.add(tag)
    return sorted(tags)

def generate_sitemap():
    """Generate sitemap.xml"""
    posts = load_posts()
    all_tags = get_all_tags(posts)
    current_date = datetime.now().strftime('%Y-%m-%d')
    
    # Start sitemap
    sitemap = []
    sitemap.append('<?xml version="1.0" encoding="UTF-8"?>')
    sitemap.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    # Add static pages
    for page in STATIC_PAGES:
        url = f"{BASE_URL}/{page['url']}" if page['url'] else BASE_URL
        sitemap.append('  <url>')
        sitemap.append(f"    <loc>{url}</loc>")
        sitemap.append(f"    <lastmod>{current_date}</lastmod>")
        sitemap.append(f"    <changefreq>{page['changefreq']}</changefreq>")
        sitemap.append(f"    <priority>{page['priority']}</priority>")
        sitemap.append('  </url>')
    
    # Add individual post pages
    for post in posts:
        post_id = post.get('id')
        if post_id == 'alert':
            continue  # Skip alert post or handle specially
        
        url = f"{BASE_URL}/post.html?id={post_id}"
        sitemap.append('  <url>')
        sitemap.append(f"    <loc>{url}</loc>")
        sitemap.append(f"    <lastmod>{current_date}</lastmod>")
        sitemap.append(f"    <changefreq>monthly</changefreq>")
        sitemap.append(f"    <priority>0.6</priority>")
        sitemap.append('  </url>')
    
    # Add tag pages
    for tag in all_tags:
        # URL encode the tag for proper URL formatting
        encoded_tag = quote(tag)
        url = f"{BASE_URL}/tag.html?tag={encoded_tag}"
        sitemap.append('  <url>')
        sitemap.append(f"    <loc>{url}</loc>")
        sitemap.append(f"    <lastmod>{current_date}</lastmod>")
        sitemap.append(f"    <changefreq>weekly</changefreq>")
        sitemap.append(f"    <priority>0.7</priority>")
        sitemap.append('  </url>')
    
    # Close sitemap
    sitemap.append('</urlset>')
    
    # Write to file
    with open(SITEMAP_FILE, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sitemap))
    
    # Print summary
    print(f"✓ Sitemap generated: {SITEMAP_FILE}")
    print(f"  - {len(STATIC_PAGES)} static pages")
    print(f"  - {len([p for p in posts if p.get('id') != 'alert'])} post pages")
    print(f"  - {len(all_tags)} tag pages")
    print(f"  - Total URLs: {len(STATIC_PAGES) + len([p for p in posts if p.get('id') != 'alert']) + len(all_tags)}")
    print(f"\nRemember to update BASE_URL in this script to your actual domain!")

if __name__ == '__main__':
    generate_sitemap()
