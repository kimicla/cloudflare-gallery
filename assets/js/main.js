// Gallery state
let currentPage = 1;
let isLoading = false;
let hasMore = true;
let loadingObserver;
let galleryImages = [];

// UI state management
function showLoading() {
    const loader = document.querySelector('.gallery-loader');
    if (loader) {
        loader.style.display = 'block';
    }
}

function hideLoading() {
    const loader = document.querySelector('.gallery-loader');
    if (loader) {
        loader.style.display = 'none';
    }
}

function showError(message) {
    const errorDiv = document.querySelector('.gallery-error');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

// Image element creation
function createImageElement(image, index) {
    const config = window.galleryConfig;
    if (!config) {
        throw new Error('Gallery configuration not found');
    }

    if (!image || !image.id) {
        throw new Error('Invalid image data: missing id');
    }

    const imgContainer = document.createElement('div');
    imgContainer.className = 'gallery-item';
    
    try {
        const baseUrl = `https://imagedelivery.net/${config.accountHash}/${image.id}`;
        
        // Create a link for Lightbox2
        const link = document.createElement('a');
        link.href = `${baseUrl}/full`;
        link.setAttribute('data-lightbox', 'gallery');
        link.setAttribute('data-title', image.filename ? image.filename.replace(/\.[^/.]+$/, '') : '');
        
        // Create the image element
        const img = document.createElement('img');
        img.src = `${baseUrl}/thumbnail`;
        img.alt = image.filename || '';
        img.loading = 'lazy';
        img.dataset.id = image.id;
        img.dataset.index = index;
        img.classList.add('loading');
        
        // Handle image loading
        img.onload = () => {
            img.classList.remove('loading');
            img.classList.add('loaded');
        };
        
        // Handle image error
        img.onerror = () => {
            img.classList.remove('loading');
            img.classList.add('error');
        };
        
        // Add loading placeholder
        const placeholder = document.createElement('div');
        placeholder.className = 'image-loading-placeholder';
        
        // Add caption if filename exists
        if (image.filename) {
            const caption = document.createElement('div');
            caption.className = 'gallery-item-caption';
            caption.textContent = image.filename.replace(/\.[^/.]+$/, '');
            imgContainer.appendChild(caption);
        }
        
        // Assemble the elements
        link.appendChild(img);
        imgContainer.appendChild(link);
        imgContainer.appendChild(placeholder);
        
        return imgContainer;
    } catch (error) {
        console.error('Error creating image element:', error);
        throw error;
    }
}

// Image loading and pagination
async function loadImages(page) {
    if (isLoading || !hasMore) return;
    
    isLoading = true;
    showLoading();
    
    try {
        const config = window.galleryConfig;
        if (!config) {
            throw new Error('Gallery configuration not found');
        }

        const perPage = config.itemsPerPage || 30;
        const url = `${config.workerURL}?page=${page}&per_page=${perPage}&prefix=${config.imagePrefix}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.errors?.[0]?.message || 'API request failed');
        }
        
        if (!data.result || !Array.isArray(data.result.images)) {
            throw new Error('Invalid API response structure');
        }
        
        const images = data.result.images;
        const gallery = document.querySelector('.gallery');
        
        if (!gallery) {
            throw new Error('Gallery container not found');
        }
        
        if (images.length > 0) {
            const fragment = document.createDocumentFragment();
            const startIndex = galleryImages.length;
            
            galleryImages.push(...images);
            
            images.forEach((image, index) => {
                try {
                    const imgElement = createImageElement(image, startIndex + index);
                    fragment.appendChild(imgElement);
                } catch (imgError) {
                    console.error('Failed to create image element:', imgError);
                }
            });
            
            gallery.appendChild(fragment);

            currentPage = page;
            hasMore = images.length >= perPage;
            
            if (hasMore) {
                initializeIntersectionObserver();
            } else {
                if (loadingObserver) {
                    loadingObserver.disconnect();
                }
                const sentinel = document.querySelector('.gallery-sentinel');
                if (sentinel) {
                    sentinel.remove();
                }
                
                const endMessage = document.createElement('div');
                endMessage.className = 'gallery-end-message';
                endMessage.textContent = 'No more images to load';
                gallery.appendChild(endMessage);
            }

            // Initialize or refresh Lightbox
            if (typeof lightbox !== 'undefined') {
                lightbox.option({
                    'resizeDuration': 200,
                    'wrapAround': true,
                    'albumLabel': 'Image %1 of %2',
                    'fadeDuration': 300,
                    'imageFadeDuration': 300,
                    'disableScrolling': true
                });
            }
        } else {
            hasMore = false;
            if (gallery && gallery.children.length === 0) {
                const noImagesMessage = document.createElement('div');
                noImagesMessage.className = 'gallery-no-images';
                noImagesMessage.textContent = 'No images found';
                gallery.appendChild(noImagesMessage);
            }
        }
    } catch (error) {
        console.error('Error loading images:', error);
        showError(`Error: ${error.message}`);
        hasMore = false;
    } finally {
        isLoading = false;
        hideLoading();
    }
}

// Intersection Observer for infinite scroll
function initializeIntersectionObserver() {
    if (loadingObserver) {
        loadingObserver.disconnect();
    }

    const sentinel = document.querySelector('.gallery-sentinel');
    if (!sentinel) {
        const gallery = document.querySelector('.gallery');
        if (gallery) {
            const newSentinel = document.createElement('div');
            newSentinel.className = 'gallery-sentinel';
            gallery.appendChild(newSentinel);
        }
    }

    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    loadingObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isLoading && hasMore) {
                loadImages(currentPage + 1);
            }
        });
    }, options);

    const currentSentinel = document.querySelector('.gallery-sentinel');
    if (currentSentinel) {
        loadingObserver.observe(currentSentinel);
    }
}

// Initialize gallery when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.gallery-container');
    if (!container) {
        console.error('Gallery container not found');
        return;
    }

    // Read configuration from data attributes
    window.galleryConfig = {
        accountHash: container.dataset.accountHash || container.getAttribute('data-account-hash'),
        workerURL: container.dataset.workerUrl || container.getAttribute('data-worker-url'),
        imagePrefix: container.dataset.imagePrefix || container.getAttribute('data-image-prefix'),
        layout: container.dataset.layout || container.getAttribute('data-layout') || 'grid',
        category: container.dataset.category || container.getAttribute('data-category') || 'all',
        itemsPerPage: parseInt(container.dataset.itemsPerPage || container.getAttribute('data-items-per-page') || '30', 10)
    };

    // Verify required configuration
    if (!window.galleryConfig.accountHash || !window.galleryConfig.workerURL) {
        console.error('Missing required configuration:', {
            accountHash: window.galleryConfig.accountHash,
            workerURL: window.galleryConfig.workerURL
        });
        showError('Missing required gallery configuration');
        return;
    }

    // Initialize intersection observer
    initializeIntersectionObserver();

    // Start loading images
    loadImages(1);
});

