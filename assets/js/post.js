const params = new URLSearchParams(window.location.search);
const postId = params.get('id');

// Function to update SEO meta tags
function updateMetaTags(post) {
    // Extract plain text from HTML for description
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = post.text;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    
    // Create description (first 155 characters for SEO)
    const description = plainText.substring(0, 155) + (plainText.length > 155 ? '...' : '');
    
    // Update title
    document.title = `${post.title} - Wesley Snipes Facts™`;
    
    // Update or create meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);
    
    // Update or create Open Graph tags
    updateOrCreateMeta('property', 'og:title', post.title);
    updateOrCreateMeta('property', 'og:description', description);
    updateOrCreateMeta('property', 'og:url', window.location.href);
    updateOrCreateMeta('property', 'og:type', 'article');
    
    // Add image if present
    if (post.image) {
        const fullImageUrl = new URL(post.image, window.location.origin).href;
        updateOrCreateMeta('property', 'og:image', fullImageUrl);
    }
    
    // Update or create Twitter Card tags
    updateOrCreateMeta('name', 'twitter:card', 'summary');
    updateOrCreateMeta('name', 'twitter:title', post.title);
    updateOrCreateMeta('name', 'twitter:description', description);
    
    if (post.image) {
        const fullImageUrl = new URL(post.image, window.location.origin).href;
        updateOrCreateMeta('name', 'twitter:image', fullImageUrl);
    }
}

// Helper function to update or create meta tags
function updateOrCreateMeta(attr, attrValue, content) {
    let meta = document.querySelector(`meta[${attr}="${attrValue}"]`);
    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, attrValue);
        document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
}

async function loadPost() {
    try {
        const response = await fetch('posts.json');
        if (!response.ok) throw new Error('Failed to load post');
        
        const data = await response.json();
        const post = data.find(p => p.id == postId);
        
        if (post) {
            // Update SEO meta tags first
            updateMetaTags(post);
            
            // Update page title
            document.title = post.title || '';
            
            // Dynamically insert heading above #post-content
            const postContent = document.getElementById('post-content');
            if (postContent) {
                // Remove any previous heading
                const prevHeading = document.querySelector('.post-results-heading');
                if (prevHeading) prevHeading.remove();
                const headingText = `Fact showing <span class="post-term">#${postId}</span>`;
                const headingEl = document.createElement('h2');
                headingEl.className = 'post-results-heading';
                headingEl.innerHTML = headingText;
                postContent.parentNode.insertBefore(headingEl, postContent);
            }
            postContent.innerHTML = `
                ${post.title ? `<h1 class="post-title">${post.title}</h1>` : ''}
                ${post.image ? `<img src="${post.image}" alt="${post.title || ''}" class="post-image">` : ''}
                <p class="post-text">${post.text}</p>
                <p class="post-notes">${post.notes}</p>
                <p class="post-tags margins-off">${post.tags.map(t => `<a href="tag.html?tag=${encodeURIComponent(t)}" class="tag">${t}</a>`).join('')}</p>
                <hr>
                <div class="share-container">
                    <p>Share this fact!</p>
                    <div class="share-buttons margins-off">
                        <button id="share-twitter" class="share-button" type="button">Twitter</button>
                        <button id="share-tumblr" class="share-button" type="button">Tumblr</button>
                        <button id="copyLink" class="share-button copy" type="button">Web</button>
                    </div>
                </div>
            `;
            updateShareLinks(post.title);
        } else {
            document.getElementById('post-content').innerHTML = '<p>Post not found.</p>';
            const prevHeading = document.querySelector('.post-results-heading');
            if (prevHeading) prevHeading.remove();
        }
    } catch (error) {
        console.error('Error loading post:', error);
        document.getElementById('post-content').innerHTML = '<p>Error loading post. Please try again.</p>';
        const prevHeading = document.querySelector('.post-results-heading');
        if (prevHeading) prevHeading.remove();
    }
}

function updateShareLinks(postTitle) {
    const postId = new URLSearchParams(window.location.search).get('id'); 
    const postUrl = `${window.location.origin}/post.html?id=${postId}`;

    document.getElementById('share-twitter').addEventListener('click', () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(postTitle)}&url=${encodeURIComponent(postUrl)}`;
        window.open(url, '_blank');
    });

    document.getElementById('share-tumblr').addEventListener('click', () => {
        const tumblrUrl = new URL('https://www.tumblr.com/widgets/share/tool');
        tumblrUrl.searchParams.set('canonicalUrl', postUrl);
        tumblrUrl.searchParams.set('title', postTitle);
        tumblrUrl.searchParams.set('caption', postExcerpt || '');
        window.open(tumblrUrl.toString(), '_blank', 'width=600,height=400');
    });
    
    document.getElementById('copyLink').addEventListener('click', () => {
        navigator.clipboard.writeText(postUrl).then(() => {
            alert('Link copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy link:', err);
        });
    });
}

loadPost();