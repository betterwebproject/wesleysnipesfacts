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

    // Clear error when user types
    tagSearchInput.addEventListener('input', function() {
        tagSearchError.textContent = '';
        tagSearchError.innerHTML = '';
    });
}
let postsData = null; // Cache for JSON data
let offset = 0;
const limit = 20;
let isLoading = false;

async function loadPosts() {
    if (isLoading) return; 
    isLoading = true;

    try {
        // Fetch once and cache
        if (!postsData) {
            const response = await fetch('posts.json');
            if (!response.ok) throw new Error('Network response was not ok');
            postsData = await response.json();
            postsData = postsData.slice().reverse(); // Reverse order so highest fact first
            offset = 0; // Reset offset after reversing
        }

        const posts = postsData.slice(offset, offset + limit);

        if (posts.length === 0) {
            window.removeEventListener('scroll', handleScroll);
            isLoading = false;
            return;
        }

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
            document.getElementById('blogroll').appendChild(postElement);

            // Add share button listeners (use class selectors, not IDs)
            postElement.querySelector('.share-twitter').addEventListener('click', () => {
                const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(postUrl)}`;
                window.open(url, '_blank');
            });
            postElement.querySelector('.share-tumblr').addEventListener('click', () => {
                const url = `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(post.title)}`;
                window.open(url, '_blank');
            });
            postElement.querySelector('.copy-link').addEventListener('click', () => {
                navigator.clipboard.writeText(postUrl).then(() => {
                    alert('Link copied to clipboard!');
                }).catch(err => {
                    console.error('Failed to copy link:', err);
                });
            });
        });

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