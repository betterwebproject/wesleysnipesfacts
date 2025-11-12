// Prevent first letter clipping in search input by prepending a hair space
const tagSearchInput = document.getElementById('tag-search-input');
const tagSearchError = document.getElementById('tag-search-error');
if (tagSearchInput) {
    tagSearchInput.addEventListener('input', function() {
        const prefix = '\u200A\u200A'; // two hair spaces
        if (!tagSearchInput.value.startsWith(prefix)) {
            tagSearchInput.value = prefix + tagSearchInput.value.replace(/^\u200A+/, '');
            tagSearchInput.setSelectionRange(tagSearchInput.value.length, tagSearchInput.value.length);
        }
        if (tagSearchError) tagSearchError.textContent = '';
    });
}

// Tag search bar logic with custom error message and substring matching
const tagSearchForm = document.getElementById('tag-search-form');
if (tagSearchForm && tagSearchInput && tagSearchError) {
    tagSearchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const inputRaw = tagSearchInput.value.trim();
        const input = inputRaw.toLowerCase();
        if (!input) return;

        fetch('posts.json')
            .then(res => res.json())
            .then(posts => {
                // Check if input is a number and matches a post ID
                if (/^\d+$/.test(inputRaw)) {
                    const post = posts.find(p => String(p.id) === inputRaw);
                    if (post) {
                        window.location.href = `post.html?id=${post.id}`;
                        return;
                    }
                }
                // Collect all unique tags
                const tags = Array.from(new Set(posts.flatMap(post => post.tags.map(tag => tag.toLowerCase()))));
                // Match any tag containing the search term
                const matches = tags.filter(tag => tag.includes(input));
                if (matches.length > 0) {
                    tagSearchError.textContent = '';
                    window.location.href = `tag.html?search=${encodeURIComponent(input)}`;
                } else {
                    tagSearchError.textContent = 'Sorry. Please roll again.';
                }
            });
    });
}

// Helper function to extract plain text from HTML
function getPlainText(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
}

// Attach a single delegated handler for share buttons on #blogroll (persistent)
const blogrollEl = document.getElementById('blogroll');
if (blogrollEl) {
    blogrollEl.addEventListener('click', function(e) {
        const btn = e.target.closest('.share-twitter, .share-tumblr, .copy-link');
        if (!btn) return;
        const postEl = btn.closest('.post');
        if (!postEl) return;
        const titleLink = postEl.querySelector('.post-title');
        const href = titleLink ? titleLink.getAttribute('href') : null;
        // Remove leading slash from href if present to avoid double slashes
        const cleanHref = href ? href.replace(/^\//, '') : null;
        const postUrl = cleanHref ? `${window.location.origin}/${cleanHref}` : window.location.href;
        const title = titleLink ? titleLink.textContent.trim() : '';

        if (btn.classList.contains('share-twitter')) {
            // X now uses /post endpoint - include title and URL together
            const tweetText = `${title}\n\n${postUrl}`;
            const url = `https://x.com/intent/post?text=${encodeURIComponent(tweetText)}`;
            window.open(url, '_blank', 'noopener,noreferrer');
        } else if (btn.classList.contains('share-tumblr')) {
            const postTextEl = postEl.querySelector('.post-text');
            const postText = postTextEl ? getPlainText(postTextEl.innerHTML) : '';
            
            // Tumblr share - include title in the caption/content field
            const contentWithTitle = `${title}\n\n${postText}`;
            const tumblrUrl = `https://www.tumblr.com/widgets/share/tool?posttype=link&canonicalUrl=${encodeURIComponent(postUrl)}&content=${encodeURIComponent(contentWithTitle)}`;
            window.open(tumblrUrl, '_blank', 'width=540,height=600');
        } else if (btn.classList.contains('copy-link')) {
            navigator.clipboard.writeText(postUrl).then(() => {
                alert('Link copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy link:', err);
            });
        }
    });
}

// Local cache settings for posts.json
const POSTS_CACHE_KEY = 'wsf_posts_cache_v1';
const POSTS_CACHE_TTL = 1000 * 60 * 60; // 1 hour

let postsData = null; // In-memory cache for JSON data
let offset = 0;
const limit = 20;
let isLoading = false;

async function loadPosts() {
    if (isLoading) return; 
    isLoading = true;

    try {
        // Load postsData from localStorage cache if available and fresh.
        if (!postsData) {
            try {
                const raw = localStorage.getItem(POSTS_CACHE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed && Array.isArray(parsed.posts) && parsed.ts && (Date.now() - parsed.ts) < POSTS_CACHE_TTL) {
                        postsData = parsed.posts.slice().reverse();
                        offset = 0;
                    }
                }
            } catch (err) {
                // ignore malformed cache
                console.warn('posts cache read failed', err);
            }
        }

        // If we still don't have postsData, fetch and populate cache synchronously.
        if (!postsData) {
            const response = await fetch('posts.json');
            if (!response.ok) throw new Error('Network response was not ok');
            const fresh = await response.json();
            try {
                localStorage.setItem(POSTS_CACHE_KEY, JSON.stringify({ ts: Date.now(), posts: fresh }));
            } catch (err) {
                // ignore storage quota errors
                console.warn('posts cache write failed', err);
            }
            postsData = fresh.slice().reverse(); // Reverse order so highest fact first
            offset = 0; // Reset offset after reversing
        } else {
            // If we rendered from cache, refresh cache in background and update in-memory postsData for future loads
            (async () => {
                try {
                    const resp = await fetch('posts.json');
                    if (!resp.ok) return;
                    const fresh = await resp.json();
                    const cachedRaw = localStorage.getItem(POSTS_CACHE_KEY);
                    const cachedStr = cachedRaw || '';
                    const freshStr = JSON.stringify(fresh);
                    if (cachedStr !== freshStr) {
                        try {
                            localStorage.setItem(POSTS_CACHE_KEY, JSON.stringify({ ts: Date.now(), posts: fresh }));
                        } catch (err) {
                            console.warn('posts cache write failed', err);
                        }
                        // update in-memory postsData for subsequent infinite-loads
                        postsData = fresh.slice().reverse();
                    }
                } catch (err) {
                    /* background refresh failed - ignore */
                }
            })();
        }

        const posts = postsData.slice(offset, offset + limit);

        if (posts.length === 0) {
            window.removeEventListener('scroll', handleScroll);
            isLoading = false;
            return;
        }

        // Build all post nodes into a DocumentFragment and append once to minimize reflows
        const fragment = document.createDocumentFragment();

        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post';
            const postUrl = `${window.location.origin}/post.html?id=${post.id}`;
            postElement.innerHTML = `
                ${post.title ? `<h2><a href="post.html?id=${post.id}" class="post-title">${post.title}</a></h2>` : ''}
                ${post.image ? `<img src="${post.image}" alt="${post.title || ''}" class="post-image">` : ''}
                <p class="post-text">${post.text}</p>
                <p class="post-notes">${post.notes}</p>
                <p class="post-tags margins-off">${post.tags.map(tag => `<a href="tag.html?tag=${encodeURIComponent(tag)}" class="tag">${tag}</a>`).join('')}</p>
                <hr>
                <div class="share-container">
                    <p>Share this fact!</p>
                    <div class="share-buttons margins-off">
                        <button class="share-button share-twitter" type="button">Twitter</button>
                        <button class="share-button share-tumblr" type="button">Tumblr</button>
                        <button class="share-button copy-link" type="button">Web</button>
                    </div>
                </div>
            `;
            fragment.appendChild(postElement);
        });

        // Append fragment once to DOM and reveal footer
        blogrollEl.appendChild(fragment);
        revealFooterOnce();

        offset += posts.length;
        isLoading = false;

        if (offset >= postsData.length) {
            window.removeEventListener('scroll', handleScroll);
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        isLoading = false;
    }
}

let lastScrollTop = 0; 
let scrollTimeout = null;
const footer = document.querySelector('footer');
// Footer starts `display:none` in HTML to avoid a flash on slow browsers.
// Reveal it only after the first batch of posts is appended so it never appears
// before blog content is painted.
let footerRevealed = false;

function revealFooterOnce() {
    if (!footer || footerRevealed) return;
    // Restore the intended layout/display from CSS
    footer.style.display = 'flex';
    // Keep it off-screen via transform; visibility can remain default
    footer.style.transform = 'translateY(100%)';
    footerRevealed = true;
}

function handleScroll() {
    if (scrollTimeout) return;
    
    scrollTimeout = setTimeout(() => {
        // Check if we should load more posts
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
            loadPosts();
        }

        const scrollTop = window.scrollY || document.documentElement.scrollTop;

        if (scrollTop > lastScrollTop) {
            footer.style.transform = 'translateY(0)'; // Show the footer
            footer.style.bottom = '.5rem';
        } else {
            footer.style.transform = 'translateY(100%)'; // Hide the footer
            footer.style.bottom = '-.5rem';
        }

        lastScrollTop = scrollTop;
        scrollTimeout = null;
    }, 100);
}

window.addEventListener('scroll', handleScroll);
loadPosts();