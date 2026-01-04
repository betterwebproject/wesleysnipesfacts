const params = new URLSearchParams(window.location.search);
const tag = params.get('tag');
const search = params.get('search');

let postsData = null;
let filteredPosts = [];
let offset = 0;
const limit = 20;
let isLoading = false;

// Helper function to extract plain text from HTML
function getPlainText(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
}

// Function to highlight tag text in post content
function highlightTagInText(text, tag) {
    if (!tag) return text;
    
    // Create a case-insensitive regex that matches whole words or phrases
    const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedTag})`, 'gi');
    
    // Replace matches with highlighted spans
    return text.replace(regex, '<span class="highlight-tag">$1</span>');
}

// Function to make footnote references accessible
function makeFootnotesAccessible(postElement, postId) {
    const postText = postElement.querySelector('.post-text');
    const postNotes = postElement.querySelector('.post-notes');
    
    if (!postText || !postNotes) return;
    
    // Find all sup elements in post text (footnote references)
    const footnoteRefs = postText.querySelectorAll('sup');
    
    // Find all sup elements in post notes (footnote definitions)
    const footnoteDefs = postNotes.querySelectorAll('sup');
    
    // Make each footnote reference accessible
    footnoteRefs.forEach((sup, index) => {
        const footnoteNum = sup.textContent.trim();
        
        // Create unique IDs using postId to avoid conflicts
        const uniqueRefId = `fnref-${postId}-${footnoteNum}`;
        const uniqueDefId = `fn-${postId}-${footnoteNum}`;
        
        // Wrap the sup content in a link
        const link = document.createElement('a');
        link.href = `#${uniqueDefId}`;
        link.setAttribute('role', 'doc-noteref');
        link.setAttribute('aria-label', `Footnote ${footnoteNum}`);
        link.id = uniqueRefId;
        link.textContent = sup.textContent;
        
        // Replace sup content with the link
        sup.textContent = '';
        sup.appendChild(link);
        
        // If there's a corresponding definition, set it up
        if (footnoteDefs[index]) {
            const def = footnoteDefs[index];
            def.id = uniqueDefId;
            def.setAttribute('role', 'doc-endnote');
            link.setAttribute('aria-describedby', uniqueDefId);
        }
    });
}

// Function to setup share buttons for a specific post
function setupShareButtons(postElement, post) {
    const postUrl = `${window.location.origin}/post.html?id=${post.id}`;
    const plainText = getPlainText(post.text);

    // Use querySelector to find buttons within this specific post element
    const twitterBtn = postElement.querySelector('.share-twitter');
    const tumblrBtn = postElement.querySelector('.share-tumblr');
    const copyBtn = postElement.querySelector('.copy-link');

    twitterBtn.addEventListener('click', () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(postUrl)}`;
        const popup = window.open(url, '_blank', 'noopener,noreferrer');
        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
            window.location.href = url;
        }
    });

    tumblrBtn.addEventListener('click', () => {
        const captionWithTitle = `<h1><strong>${post.title}</strong></h1>${plainText}`;
        const tumblrUrl = `https://www.tumblr.com/widgets/share/tool?posttype=link&canonicalUrl=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(post.title)}&content=${encodeURIComponent(postUrl)}&caption=${encodeURIComponent(captionWithTitle)}`;
        window.open(tumblrUrl, '_blank', 'width=540,height=600');
    });
    
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(postUrl).then(() => {
            alert('Link copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy link:', err);
        });
    });
}

async function loadTagPosts() {
    if (isLoading) return;
    isLoading = true;

    try {
        // Fetch and cache data
        if (!postsData) {
            const response = await fetch('posts.json');
            if (!response.ok) throw new Error('Failed to load posts');
            postsData = await response.json();
            let headingText = '';
            let term = search || tag || '';
            if (search) {
                // Filter posts whose tags contain the search term as a substring
                const searchTerm = search.toLowerCase();
                filteredPosts = postsData.filter(post =>
                    post.tags.some(t => t.toLowerCase().includes(searchTerm))
                );
                headingText = `Tags for <span class="tag-term">${term}</span>`;
                document.title = `Posts matching: ${search}`;
            } else {
                filteredPosts = postsData.filter(p => p.tags.includes(tag));
                if (filteredPosts.length > 0) {
                    headingText = `Tags for <span class="tag-term">${term}</span>`;
                    document.title = `Posts tagged: ${tag}`;
                }
            }
            
            // Update or create canonical URL
            let canonical = document.querySelector('link[rel="canonical"]');
            if (!canonical) {
                canonical = document.createElement('link');
                canonical.rel = 'canonical';
                document.head.appendChild(canonical);
            }
            canonical.href = window.location.href;
            // Insert heading above results
            document.getElementById('tag-posts').innerHTML = `<h2 class="tag-results-heading">${headingText}</h2>`;
            if (filteredPosts.length === 0) {
                document.getElementById('tag-posts').innerHTML += '<p class="no-posts">No posts found for this tag.</p>';
                isLoading = false;
                return;
            }
        }

        const posts = filteredPosts.slice(offset, offset + limit);

        if (posts.length === 0) {
            window.removeEventListener('scroll', handleScroll);
            isLoading = false;
            return;
        }

        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post';
            
            // Highlight the tag in post text and notes
            const highlightedText = tag ? highlightTagInText(post.text, tag) : post.text;
            const highlightedNotes = tag ? highlightTagInText(post.notes, tag) : post.notes;
            
            // Use classes instead of IDs for share buttons
            postElement.innerHTML = `
                ${post.title ? `<h2><a href="post.html?id=${post.id}" class="post-title">${post.title}</a></h2>` : ''}
                ${post.image ? `<img src="${post.image}" alt="${post.title || ''}" class="post-image">` : ''}
                <p class="post-text">${highlightedText}</p> 
                <p class="post-notes">${highlightedNotes}</p>
                <ul class="post-tags margins-off" aria-label="Tags">${post.tags.map(t =>`<li><a href="tag.html?tag=${encodeURIComponent(t)}" class="tag${t === tag ? ' active-tag' : ''}">${t}</a></li>`).join('')}</ul>
                <hr aria-hidden="true">
                <div class="share-container">
                    <p aria-hidden="true">Share this fact!</p>
                    <ul class="share-buttons margins-off">
                        <li><button class="share-button share-twitter" type="button" aria-label="Share to Twitter">Twitter</button></li>
                        <li><button class="share-button share-tumblr" type="button" aria-label="Share to Tumblr">Tumblr</button></li>
                        <li><button class="share-button copy copy-link" type="button" aria-label="Copy link">Web</button></li>
                    </ul>
                </div>
            `;
            // Remove .post-notes if empty
            const notesEl = postElement.querySelector('.post-notes');
            if (notesEl && !notesEl.textContent.trim()) {
                notesEl.remove();
            }
            
            // Make footnotes accessible after creating the element
            makeFootnotesAccessible(postElement, post.id);
            
            // Setup share buttons for this specific post
            setupShareButtons(postElement, post);
            
            const tagPostsContainer = document.getElementById('tag-posts');
            tagPostsContainer.appendChild(postElement);
            
            // Trigger animation on first load only
            if (!tagPostsContainer.classList.contains('fade-in-ready')) {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        tagPostsContainer.classList.add('fade-in-ready');
                    });
                });
            }
        });

        offset += posts.length;
        isLoading = false;

        if (offset >= filteredPosts.length) {
            window.removeEventListener('scroll', handleScroll);
        }
    } catch (error) {
        console.error('Error loading tag posts:', error);
        document.getElementById('tag-posts').innerHTML = '<p class="error">Error loading posts. Please try again.</p>';
        isLoading = false;
    }
}

function handleScroll() {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        loadTagPosts();
    }
}

window.addEventListener('scroll', handleScroll);
// Initial load
loadTagPosts();