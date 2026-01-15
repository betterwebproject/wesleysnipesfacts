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

// Attach a single delegated handler for share buttons on #blogroll (persistent)
const blogrollEl = document.getElementById('blogroll');

// Helper function to handle share button clicks
function handleShareClick(e) {
    const btn = e.currentTarget;
    const postEl = btn.closest('.post');
    if (!postEl) return;
    
    const titleLink = postEl.querySelector('.post-title a');
    const href = titleLink ? titleLink.getAttribute('href') : null;
    const cleanHref = href ? href.replace(/^\//, '') : null;
    const postUrl = cleanHref ? `${window.location.origin}/${cleanHref}` : window.location.href;
    const title = titleLink ? titleLink.textContent.trim() : '';

    if (btn.classList.contains('share-twitter')) {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(postUrl)}`;
        const popup = window.open(url, '_blank', 'noopener,noreferrer');
        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
            window.location.href = url;
        }
    } else if (btn.classList.contains('share-tumblr')) {
        const postTextEl = postEl.querySelector('.post-text');
        const postText = postTextEl ? getPlainText(postTextEl.innerHTML) : '';
        const captionWithTitle = `<h1><strong>${title}</strong></h1>${postText}`;
        const tumblrUrl = `https://www.tumblr.com/widgets/share/tool?posttype=link&canonicalUrl=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(title)}&content=${encodeURIComponent(postUrl)}&caption=${encodeURIComponent(captionWithTitle)}`;
        window.open(tumblrUrl, '_blank', 'width=540,height=600');
    } else if (btn.classList.contains('copy-link')) {
        navigator.clipboard.writeText(postUrl).then(() => {
            alert('Link copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy link:', err);
        });
    }
}


// Infinite scroll state
let postsData = null; // In-memory cache for JSON data
let offset = 0;
const limit = 20;
let isLoading = false;
let allPostsLoaded = false; // Track if we've loaded all posts

async function loadPosts() {
    if (isLoading) return; 
    isLoading = true;

    try {
        // Fetch posts once and cache in memory for the session
        if (!postsData) {
            const response = await fetch('posts.json');
            if (!response.ok) throw new Error('Network response was not ok');
            const fresh = await response.json();
            postsData = fresh.slice().reverse(); // Reverse order so highest fact first
            offset = 0;
        }

        const posts = postsData.slice(offset, offset + limit);

        if (posts.length === 0) {
            allPostsLoaded = true;
            isLoading = false;
            return;
        }

        // Build all post nodes into a DocumentFragment and append once to minimize reflows
        const fragment = document.createDocumentFragment();

        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post gradient-border';
            postElement.innerHTML = `
                ${post.title ? `<h2 class="post-title"><a href="post.html?id=${post.id}">${post.title}</a></h2>` : ''}
                ${post.image ? `<img src="${post.image}" alt="${post.title || ''}" class="post-image">` : ''}
                <p class="post-text">${post.text}</p>
                <p class="post-notes">${post.notes}</p>
                <ul class="post-tags margins-off" aria-label="Tags">${post.tags.map(tag => `<li><a href="tag.html?tag=${encodeURIComponent(tag)}" class="tag">${tag}</a></li>`).join('')}</ul>
                <hr aria-hidden="true">
                <div class="share-container">
                    <p aria-hidden="true">Share this fact!</p>
                    <ul class="share-buttons margins-off">
                        <li><button class="share-button share-twitter" type="button" aria-label="Share to Twitter">Twitter</button></li>
                        <li><button class="share-button share-tumblr" type="button" aria-label="Share to Tumblr">Tumblr</button></li>
                        <li><button class="share-button copy-link" type="button" aria-label="Copy link">Web</button></li>
                    </ul>
                </div>
            `;
            
            // Remove .post-notes if empty
            const notesEl = postElement.querySelector('.post-notes');
            if (notesEl && !notesEl.textContent.trim()) {
                notesEl.remove();
            }
            
            // Attach click handlers directly to buttons
            postElement.querySelectorAll('.share-button').forEach(btn => {
                btn.addEventListener('click', handleShareClick);
            });
            
            // Make footnotes accessible after adding to fragment
            makeFootnotesAccessible(postElement, post.id);
            
            fragment.appendChild(postElement);
        });

        // Append fragment once to DOM and reveal footer
        blogrollEl.appendChild(fragment);
        
        // Trigger animation after layout is stable
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                blogrollEl.classList.add('fade-in-ready');
            });
        });
        
        revealFooterOnce();

        // Announce to screen readers
        const statusEl = document.getElementById('scroll-status');
        if (statusEl) {
            statusEl.textContent = `Loaded ${posts.length} more posts`;
            // Clear after announcement
            setTimeout(() => { statusEl.textContent = ''; }, 1000);
        }

        offset += posts.length;
        isLoading = false;

        if (offset >= postsData.length) {
            allPostsLoaded = true;
            if (statusEl) {
                statusEl.textContent = 'End of posts';
                setTimeout(() => { statusEl.textContent = ''; }, 1000);
            }
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        isLoading = false;
    }
}

// Footer visibility state
let lastScrollTop = 0; 
let scrollTimeout = null;
const footer = document.querySelector('footer');
let footerRevealed = false;
let footerVisibilityAnnounced = false;

// Footer starts `display:none` in HTML to avoid a flash on slow browsers.
// Reveal it only after the first batch of posts is appended so it never appears
// before blog content is painted.
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
        // Check if we should load more posts (only if not all loaded)
        if (!allPostsLoaded && window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
            loadPosts();
        }

        const scrollTop = window.scrollY || document.documentElement.scrollTop;

        if (scrollTop > lastScrollTop) {
            footer.style.transform = 'translateY(0)'; // Show the footer
            footer.style.bottom = '.5rem';
            
            // Announce footer visibility to screen readers (once)
            if (!footerVisibilityAnnounced) {
                const statusEl = document.getElementById('scroll-status');
                if (statusEl) {
                    statusEl.textContent = 'Footer now visible with additional links';
                    setTimeout(() => { statusEl.textContent = ''; }, 2000);
                }
                footerVisibilityAnnounced = true;
            }
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