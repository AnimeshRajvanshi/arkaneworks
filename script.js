document.addEventListener('DOMContentLoaded', () => {
    // Menu toggle for mobile
    const menuButton = document.querySelector('.menu-button');
    const menuLinks = document.querySelector('.menu-links');
    const dropdown = document.querySelector('.dropdown');
    const dropdownContent = document.querySelector('.dropdown-content');

    if (menuButton && menuLinks) {
        menuButton.addEventListener('click', () => {
            menuButton.classList.toggle('open');
            menuLinks.classList.toggle('open');
            if (dropdown && dropdownContent) {
                dropdown.classList.toggle('open');
            }
        });
    }

    // Content block fade-in/out
    const contentBlocks = document.querySelectorAll('.content-block');
    const observerOptions = {
        root: null,
        rootMargin: '-10% 0px',
        threshold: 0.1
    };

    const contentObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const block = entry.target;
            const fadeDuration = block.dataset.fadeDuration || '0.5s';
            block.style.transitionDuration = fadeDuration;
            if (entry.isIntersecting) {
                block.classList.add('visible');
                console.log(`Content block visible: ${block.className}, ratio: ${entry.intersectionRatio}`);
            } else {
                block.classList.remove('visible');
            }
        });
    }, observerOptions);

    contentBlocks.forEach(block => contentObserver.observe(block));

    // Video handling for wrongway.html
    const video = document.querySelector('.background-video');
    if (video) {
        console.log('Video element found:', video);

        const attemptVideoPlay = () => {
            video.play().then(() => {
                console.log('Video playing');
            }).catch(err => {
                console.error('Video play failed:', err);
                setTimeout(attemptVideoPlay, 1000); // Retry after 1s
            });
        };

        video.addEventListener('loadeddata', () => console.log('Video loaded'));
        video.addEventListener('canplay', () => console.log('Video can play'));
        video.addEventListener('playing', () => console.log('Video is playing'));
        video.addEventListener('pause', () => console.log('Video paused'));

        attemptVideoPlay();

        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    attemptVideoPlay();
                } else {
                    video.pause();
                    console.log('Video paused due to not being in view');
                }
            });
        }, { root: null, threshold: 0.5 });

        videoObserver.observe(video);
    }

    // Canvas animation for wrongway.html
    const canvas = document.querySelector('.model-canvas');
    const canvasWrapper = document.querySelector('.canvas-wrapper');
    const animationContainer = document.querySelector('.animation-container');
    const loadingIndicator = document.querySelector('.loading-indicator');
    const frames = Array.from({ length: 120 }, (_, i) => `/assets/wrongway_frames/frame_${(i + 1).toString().padStart(3, '0')}.png`);
    const totalFrames = frames.length;

    if (canvas && canvasWrapper && animationContainer) {
        const context = canvas.getContext('2d', { willReadFrequently: true });
        let currentFrame = 0;
        let images = [];
        let imagesLoaded = 0;
        let fallbackUsed = false;

        const updateCanvasSize = () => {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            drawFrame(currentFrame);
        };

        const loadImageWithRetry = (src, retries = 3, delay = 1000) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = src;
                img.onload = () => {
                    console.log(`Frame loaded: ${src}`);
                    resolve(img);
                };
                img.onerror = () => {
                    if (retries > 0) {
                        console.error(`Failed to load ${src}, retrying (${retries} left)`);
                        setTimeout(() => loadImageWithRetry(src, retries - 1, delay).then(resolve).catch(reject), delay);
                    } else {
                        console.error(`Failed to load ${src} after retries`);
                        reject(new Error(`Failed to load ${src}`));
                    }
                };
            });
        };

        const preloadImages = async () => {
            if (loadingIndicator) loadingIndicator.style.display = 'block';
            try {
                images = await Promise.all(frames.map(src => loadImageWithRetry(src)));
                imagesLoaded = images.length;
                console.log('All frames loaded:', imagesLoaded);
                if (loadingIndicator) loadingIndicator.style.display = 'none';
            } catch (err) {
                console.error('Some frames failed to load:', err);
                if (loadingIndicator) loadingIndicator.textContent = 'Using static image';
                images = [await loadImageWithRetry(frames[0])]; // Fallback to first frame
                imagesLoaded = 1;
                fallbackUsed = true;
            }
        };

        const drawFrame = (frameIndex) => {
            if (images[frameIndex] && context) {
                context.clearRect(0, 0, canvas.width, canvas.height);
                const img = images[frameIndex];
                const aspectRatio = img.width / img.height;
                let drawWidth = canvas.width;
                let drawHeight = canvas.width / aspectRatio;
                if (drawHeight > canvas.height) {
                    drawHeight = canvas.height;
                    drawWidth = canvas.height * aspectRatio;
                }
                const offsetX = (canvas.width - drawWidth) / 2;
                const offsetY = (canvas.height - drawHeight) / 2;
                context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
                console.log(`Drawing frame ${frameIndex + 1}`);

                // Check if canvas is blank
                setTimeout(() => {
                    const pixelData = context.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;
                    const topRight = context.getImageData(canvas.width - 1, 0, 1, 1).data;
                    const bottomLeft = context.getImageData(0, canvas.height - 1, 1, 1).data;
                    const isBlank = pixelData.every(v => v === 0) && topRight.every(v => v === 0) && bottomLeft.every(v => v === 0);
                    if (isBlank && !fallbackUsed) {
                        console.error('Canvas is blank, switching to fallback');
                        if (loadingIndicator) loadingIndicator.textContent = 'Using static image';
                        images = [images[0]];
                        imagesLoaded = 1;
                        fallbackUsed = true;
                        drawFrame(0);
                    }
                }, 5000);
            }
        };

        const updateAnimation = () => {
            if (imagesLoaded === 0) return;
            const rect = animationContainer.getBoundingClientRect();
            const scrollTop = window.scrollY || window.pageYOffset;
            const containerTop = rect.top + scrollTop;
            const containerHeight = animationContainer.offsetHeight;
            const progress = Math.min(Math.max((scrollTop - containerTop) / containerHeight, 0), 1);
            currentFrame = Math.floor(progress * (totalFrames - 1));
            drawFrame(currentFrame);
        };

        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    canvasWrapper.style.display = 'block';
                    canvasWrapper.style.visibility = 'visible';
                    updateCanvasSize();
                    window.addEventListener('scroll', updateAnimation);
                    window.addEventListener('resize', updateCanvasSize);
                    console.log('Animation container visible');
                } else {
                    canvasWrapper.style.display = 'none';
                    canvasWrapper.style.visibility = 'hidden';
                    window.removeEventListener('scroll', updateAnimation);
                    window.removeEventListener('resize', updateCanvasSize);
                    console.log('Animation container hidden');
                }
            });
        }, { root: null, rootMargin: '-10% 0px', threshold: 0.1 });

        preloadImages().then(() => {
            updateCanvasSize();
            animationObserver.observe(animationContainer);
        });
    }
});
