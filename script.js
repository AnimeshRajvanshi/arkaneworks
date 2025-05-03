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

    // Sticky content block fade-in/out
    contentBlocks.forEach((block, index) => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const scrollY = window.scrollY;
                const blockTop = block.getBoundingClientRect().top + scrollY;
                const blockHeight = block.offsetHeight;
                const viewportHeight = window.innerHeight;
                const progress = Math.min(Math.max((scrollY - blockTop + 160) / (blockHeight * 0.8), 0), 1);

                if (entry.isIntersecting && progress < 1) {
                    block.classList.add('visible');
                    block.style.opacity = Math.sin(progress * Math.PI * 0.8);
                } else {
                    block.classList.remove('visible');
                    block.style.opacity = 0;
                }
            });
        }, { threshold: 0.8 });
        observer.observe(block);
    });

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
            const frameIndex = Math.floor(scrollProgress * (frameCount - 1));
            const opacity = Math.sin(scrollProgress * Math.PI * 0.5);

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
