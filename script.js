document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.querySelector('.menu-button');
    const menuLinks = document.querySelector('.menu-links');
    const dropdowns = document.querySelectorAll('.dropdown');
    const contentBlocks = document.querySelectorAll('.content-block');
    const canvas = document.querySelector('.animation-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;

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

    // Sticky content block visibility
    function updateContentVisibility() {
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        let currentBlock = null;

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
    }

    // Initial visibility (first block only)
    if (contentBlocks.length > 0) {
        contentBlocks[0].classList.add('visible');
    }

    // Update visibility on scroll
    window.addEventListener('scroll', updateContentVisibility);

    // Animation sequence
    if (canvas && ctx) {
        const frameFolder = canvas.dataset.frameFolder;
        const frameCount = 120;
        const frames = [];
        let loadedFrames = 0;
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.textContent = 'Loading animation...';
        document.body.appendChild(loadingIndicator);

        // Preload frames
        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            const paddedIndex = i.toString().padStart(3, '0');
            img.src = `/assets/${frameFolder}/frame_${paddedIndex}.png`;
            img.onload = () => {
                loadedFrames++;
                if (loadedFrames === frameCount) {
                    loadingIndicator.remove();
                    canvas.classList.add('visible');
                }
            };
            img.onerror = () => {
                loadingIndicator.textContent = 'Failed to load animation';
            };
            frames.push(img);
        }

        // Resize canvas to viewport
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

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
            if (scrollRange <= 0) return;

            const scrollProgress = Math.min(Math.max((scrollY - animationStart) / scrollRange, 0), 1);
            let frameIndex = Math.floor(scrollProgress * (frameCount - 1));
            let opacity = scrollProgress > 0 ? 1 : 0;

            // Persist last frame after animation ends
            if (scrollY >= animationEnd) {
                frameIndex = frameCount - 1; // Last frame
                opacity = 1; // Keep visible
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (frames[frameIndex]) {
                const img = frames[frameIndex];
                const aspectRatio = 1280 / 720;
                const canvasAspect = canvas.width / canvas.height;
                let drawWidth, drawHeight, offsetX, offsetY;

                if (canvasAspect > aspectRatio) {
                    drawWidth = canvas.height * aspectRatio;
                    drawHeight = canvas.height;
                    offsetX = (canvas.width - drawWidth) / 2;
                    offsetY = 0;
                } else {
                    drawWidth = canvas.width;
                    drawHeight = canvas.width / aspectRatio;
                    offsetX = 0;
                    offsetY = (canvas.height - drawHeight) / 2;
                }

                ctx.globalAlpha = opacity;
                ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
                ctx.globalAlpha = 1;
            }

            requestAnimationFrame(updateAnimation);
        }

        // Start animation
        if (isWrongWay && videoSection) {
            const videoObserver = new IntersectionObserver(entries => {
                if (!entries[0].isIntersecting) {
                    canvas.classList.add('visible');
                } else {
                    canvas.classList.remove('visible');
                }
            }, { threshold: 0 });
            videoObserver.observe(videoSection);
        } else {
            canvas.classList.add('visible');
        }

        updateAnimation();
    }
});
