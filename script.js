document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.querySelector('.menu-button');
    const menuLinks = document.querySelector('.menu-links');
    const dropdowns = document.querySelectorAll('.dropdown');
    const contentBlocks = document.querySelectorAll('.content-block');
    const canvas = document.querySelector('.animation-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const scrollArrow = document.querySelector('.scroll-arrow');

    // Debug: Log if scrollArrow is found
    if (!scrollArrow) {
        console.warn('Scroll arrow element not found. Ensure <div class="scroll-arrow"> exists in HTML.');
    }

    // Mobile menu toggle
    if (menuButton && menuLinks) {
        menuButton.addEventListener('click', () => {
            menuButton.classList.toggle('open');
            menuLinks.classList.toggle('open');
        });
    }

    // Mobile dropdown toggle
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                dropdown.classList.toggle('open');
            }
        });
    });

    // Debounce function to limit scroll event frequency
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Sticky content block and scroll arrow visibility
    function updateContentVisibility() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        const bodyScrollHeight = document.body.scrollHeight;
        
        // Skip scroll-related logic for index.html, projects.html
        if (currentPage === 'index.html' || currentPage === 'projects.html') {
            contentBlocks.forEach(block => block.classList.add('visible')); // Ensure content is visible
            return;
        }

        // Handle about.html: keep certifications visible, hide arrow at page bottom
        if (currentPage === 'about.html') {
            contentBlocks.forEach(block => block.classList.add('visible')); // Keep certifications block visible
            if (scrollArrow) {
                if (scrollY >= bodyScrollHeight - viewportHeight) {
                    scrollArrow.classList.remove('visible');
                } else {
                    scrollArrow.classList.add('visible');
                }
            }
            return;
        }

        let currentBlock = null;
        let isLastBlock = false;

        contentBlocks.forEach((block, index) => {
            const blockStart = index * viewportHeight;
            const blockEnd = (index + 1) * viewportHeight;
            const isWrongWay = document.querySelector('.video-background') !== null;
            const videoSectionHeight = isWrongWay ? viewportHeight : 0;

            // Adjust for wrongway.html video section
            const adjustedStart = blockStart + videoSectionHeight;
            const adjustedEnd = blockEnd + videoSectionHeight;

            if (scrollY >= adjustedStart && scrollY < adjustedEnd) {
                currentBlock = block;
                block.classList.add('visible');
                if (index === contentBlocks.length - 1) {
                    isLastBlock = true;
                }
            } else {
                block.classList.remove('visible');
            }
        });

        // Ensure only one block is visible at a time
        contentBlocks.forEach(block => {
            if (block !== currentBlock) {
                block.classList.remove('visible');
            }
        });

        // Scroll arrow visibility for other pages
        if (scrollArrow) {
            const pageBottom = bodyScrollHeight - viewportHeight;
            const lastBlockTop = contentBlocks[contentBlocks.length - 1]?.getBoundingClientRect().top + scrollY;
            if (isLastBlock && lastBlockTop && scrollY >= lastBlockTop - viewportHeight / 2 || scrollY >= pageBottom) {
                scrollArrow.classList.remove('visible');
            } else {
                scrollArrow.classList.add('visible');
            }
        }
    }

    // Initial visibility
    if (contentBlocks.length > 0) {
        contentBlocks[0].classList.add('visible');
    }
    if (scrollArrow) {
        scrollArrow.classList.add('visible');
    }

    // Update visibility on scroll with debounce
    window.addEventListener('scroll', debounce(updateContentVisibility, 16));

    // Animation sequence (skip for about.html, index.html, projects.html)
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPage === 'about.html' || currentPage === 'index.html' || currentPage === 'projects.html') {
        return; // Skip canvas logic
    }

    if (canvas && ctx) {
        const frameFolder = canvas.dataset.frameFolder;
        const frameCount = 120;
        const frames = [];
        let loadedFrames = 0;
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        document.body.appendChild(loadingIndicator);

        // Resize canvas to viewport
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Load and display first frame immediately
        const firstFrame = new Image();
        firstFrame.src = `/assets/${frameFolder}/frame_001.png`;
        firstFrame.onload = () => {
            drawFrame(firstFrame, 1);
            if (!isWrongWay) {
                canvas.classList.add('visible');
            }
        };
        firstFrame.onerror = () => {
            loadingIndicator.innerHTML = '<span>Failed to load animation</span>';
        };
        frames[0] = firstFrame;

        // Preload remaining frames
        for (let i = 2; i <= frameCount; i++) {
            const img = new Image();
            const paddedIndex = i.toString().padStart(3, '0');
            img.src = `/assets/${frameFolder}/frame_${paddedIndex}.png`;
            img.onload = () => {
                loadedFrames++;
                if (loadedFrames === frameCount - 1) {
                    loadingIndicator.remove();
                }
            };
            img.onerror = () => {
                loadingIndicator.innerHTML = '<span>Failed to load animation</span>';
            };
            frames[i - 1] = img;
        }

        // Draw frame helper
        function drawFrame(img, opacity) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (img) {
                const aspectRatio = 1280 / 720;
                const canvasAspect = canvas.width / canvas.height;
                let drawWidth, drawHeight, offsetX, offsetY;

                if (canvasAspect > aspectRatio) {
                    drawHeight = canvas.height;
                    drawWidth = drawHeight * aspectRatio;
                    offsetX = canvas.width - drawWidth;
                    offsetY = 0;
                } else {
                    drawWidth = canvas.width;
                    drawHeight = drawWidth / aspectRatio;
                    offsetX = 0;
                    offsetY = canvas.height - drawHeight;
                }

                ctx.globalAlpha = opacity;
                ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
                ctx.globalAlpha = 1;
            }
        }

        // Animation logic
        const isWrongWay = frameFolder === 'wrongway_frames';
        const videoSection = document.querySelector('.video-background');
        const referencesSection = document.querySelector('.content-block:last-child');
        let animationStart = 0;
        let animationEnd = 0;

        function updateAnimation() {
            if (!referencesSection) return;

            const scrollY = window.scrollY;
            const referencesTop = referencesSection.getBoundingClientRect().top + scrollY;
            const viewportHeight = window.innerHeight;

            if (isWrongWay && videoSection) {
                animationStart = videoSection.getBoundingClientRect().bottom + scrollY;
                animationEnd = referencesTop - viewportHeight;
            } else {
                animationStart = 0;
                animationEnd = referencesTop - viewportHeight;
            }

            const scrollRange = animationEnd - animationStart;
            if (scrollRange <= 0) {
                // Ensure first frame is visible on load for non-video pages
                if (!isWrongWay && frames[0]) {
                    drawFrame(frames[0], 1);
                    canvas.classList.add('visible');
                }
                return;
            }

            const scrollProgress = Math.min(Math.max((scrollY - animationStart) / scrollRange, 0), 1);
            let frameIndex = Math.floor(scrollProgress * (frameCount - 1));
            let opacity = isWrongWay ? (scrollProgress > 0 ? 1 : 0) : 1;

            // Persist last frame after animation ends
            if (scrollY >= animationEnd) {
                frameIndex = frameCount - 1; // Last frame
                opacity = 1; // Keep visible
            }

            // Draw frame
            drawFrame(frames[frameIndex], opacity);

            requestAnimationFrame(updateAnimation);
        }

        // Start animation
        if (isWrongWay && videoSection) {
            const videoObserver = new IntersectionObserver(entries => {
                if (!entries[0].isIntersecting) {
                    canvas.classList.add('visible');
                    drawFrame(frames[0], 1); // Draw first frame when video is out of view
                } else {
                    canvas.classList.remove('visible');
                    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas during video
                }
            }, { threshold: 0 });
            videoObserver.observe(videoSection);
        } else {
            // Ensure canvas is visible on load for non-video pages
            if (frames[0]) {
                drawFrame(frames[0], 1);
                canvas.classList.add('visible');
            }
        }

        updateAnimation();
    }
});
