const params = new URLSearchParams(window.location.search);
const tag = params.get('tag');
const search = params.get('search');

let postsData = null;
let filteredPosts = [];
let offset = 0;
const limit = 20;
let isLoading = false;

// Function to highlight tag text in post content
function highlightTagInText(text, tag) {
    if (!tag) return text;
    
    // Create a case-insensitive regex that matches whole words or phrases
    const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedTag})`, 'gi');
    
    // Replace matches with highlighted spans
    return text.replace(regex, '<span class="highlight-tag">$1</span>');
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
                        <li><button id="share-twitter" class="share-button" type="button" aria-label="Share to Twitter">Twitter</button></li>
                        <li><button id="share-tumblr" class="share-button" type="button" aria-label="Share to Tumblr">Tumblr</button></li>
                        <li><button id="copyLink" class="share-button copy" type="button" aria-label="Copy link">Web</button></li>
                    </ul>
                </div>
            `;
            document.getElementById('tag-posts').appendChild(postElement);
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