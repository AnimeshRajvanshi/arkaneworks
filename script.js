document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.querySelector('.menu-button');
    const menuLinks = document.querySelector('.menu-links');
    const dropdowns = document.querySelectorAll('.dropdown');
    const sections = document.querySelectorAll('.page');
    const canvas = document.querySelector('.model-canvas');
    const canvasWrapper = document.querySelector('.canvas-wrapper');
    const scrollContainer = document.querySelector('.scroll-container');
    const video = document.querySelector('.background-video');
    const loadingIndicator = document.querySelector('.loading-indicator');
    const imagePreload = document.querySelector('.image-preload');

    // Debug elements and dimensions
    console.log('Canvas element:', canvas ? 'Found' : 'Not found', canvas);
    console.log('Scroll container:', scrollContainer ? 'Found' : 'Not found', scrollContainer);
    console.log(`Viewport: innerWidth=${window.innerWidth}, innerHeight=${window.innerHeight}, clientWidth=${document.documentElement.clientWidth}, clientHeight=${document.documentElement.clientHeight}, visualViewport=${window.visualViewport ? window.visualViewport.width + 'x' + window.visualViewport.height : 'N/A'}`);
    console.log(`Document scrollHeight: ${document.body.scrollHeight}, Container scrollHeight: ${scrollContainer ? scrollContainer.scrollHeight : 'N/A'}`);

    // Video playback
    if (video) {
        video.addEventListener('error', (e) => console.error('Video error:', e));
        video.addEventListener('loadeddata', () => console.log('Video loaded successfully'));
        video.addEventListener('canplay', () => console.log('Video can play'));
        video.addEventListener('play', () => console.log('Video playing'));
        video.addEventListener('pause', () => console.log('Video paused'));
        video.addEventListener('stalled', () => console.log('Video stalled'));

        const tryPlay = () => {
            video.play().catch(err => {
                console.error('Video play failed:', err);
                setTimeout(tryPlay, 1000);
            });
        };
        tryPlay();

        const videoObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    tryPlay();
                    console.log('Video section visible, attempting to play');
                } else {
                    video.pause();
                    console.log('Video section hidden, paused');
                }
            });
        }, { threshold: 0.5 });
        videoObserver.observe(document.querySelector('.video-background'));
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

    // Fade-in and fade-out animation for text
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            console.log(`Section: ${entry.target.className}, Intersecting: ${entry.isIntersecting}, Ratio: ${entry.intersectionRatio}`);
            if (entry.isIntersecting && entry.intersectionRatio >= 0.1) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, { 
        threshold: 0.1,
        rootMargin: '0px' /* Fast trigger */
    });

    sections.forEach(section => observer.observe(section));

    // Scroll-driven image sequence animation
    if (canvas && canvasWrapper && scrollContainer && window.location.pathname.includes('wrongway.html')) {
        const context = canvas.getContext('2d');
        const animationContainer = document.querySelector('.animation-container');
        const totalFrames = 120;
        const animationDuration = window.innerHeight * 3; // 3 viewports (pages 2-4)
        const images = [];
        let imagesLoaded = 0;
        let aspectRatio = 16 / 9;

        // Load image with retries
        const loadImageWithRetry = (src, maxRetries = 3, retryDelay = 1000) => {
            return new Promise((resolve, reject) => {
                let attempts = 0;
                const tryLoad = () => {
                    const img = document.createElement('img');
                    img.src = src;
                    img.style.display = 'none';
                    imagePreload.appendChild(img);
                    img.onload = () => {
                        console.log(`Frame ${src.match(/frame_\d+/)[0]} loaded`);
                        resolve(img);
                    };
                    img.onerror = () => {
                        attempts++;
                        console.error(`Error loading frame ${src}, attempt ${attempts}/${maxRetries}`);
                        if (attempts < maxRetries) {
                            setTimeout(tryLoad, retryDelay);
                        } else {
                            console.error(`Failed to load frame ${src} after ${maxRetries} attempts`);
                            reject(new Error(`Failed to load frame ${src}`));
                        }
                    };
                };
                tryLoad();
            });
        };

        // Preload images with Promise
        const loadImages = () => {
            return new Promise((resolve) => {
                const loadPromises = [];
                for (let i = 1; i <= totalFrames; i++) {
                    const src = `/assets/wrongway_frames/frame_${i.toString().padStart(3, '0')}.png`;
                    loadPromises.push(loadImageWithRetry(src).then(img => {
                        images.push(img);
                        imagesLoaded++;
                        if (imagesLoaded === totalFrames) {
                            if (loadingIndicator) {
                                loadingIndicator.style.display = 'none';
                                console.log('All frames loaded, hiding loading indicator');
                            }
                            resolve();
                        }
                    }).catch(err => {
                        console.warn(`Using fallback for ${src}: ${err.message}`);
                        const fallbackImg = document.createElement('img');
                        fallbackImg.src = '/assets/wrongway_frames/frame_001.png';
                        images.push(fallbackImg);
                        imagesLoaded++;
                        if (imagesLoaded === totalFrames) {
                            if (loadingIndicator) {
                                loadingIndicator.style.display = 'none';
                                console.log('All frames loaded with fallbacks, hiding loading indicator');
                            }
                            resolve();
                        }
                    }));
                }
            });
        };

        // Show loading indicator
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
        }

        // Initialize canvas size
        const resizeCanvas = () => {
            canvas.width = document.documentElement.clientWidth;
            canvas.height = document.documentElement.clientHeight;
            console.log(`Canvas resized: width=${canvas.width}, height=${canvas.height}, clientWidth=${document.documentElement.clientWidth}, clientHeight=${document.documentElement.clientHeight}`);
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Draw frame on canvas
        function drawFrame(frameIndex) {
            if (images[frameIndex] && images[frameIndex].complete) {
                const img = images[frameIndex];
                let drawWidth = canvas.width;
                let drawHeight = canvas.width / aspectRatio;
                if (drawHeight > canvas.height) {
                    drawHeight = canvas.height;
                    drawWidth = canvas.height * aspectRatio;
                }
                drawWidth = Math.min(drawWidth, canvas.width);
                drawHeight = Math.min(drawHeight, canvas.height);
                const offsetX = (canvas.width - drawWidth) / 2;
                const offsetY = drawHeight < canvas.height ? canvas.height - drawHeight : 0; // Align bottom
                context.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
                context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
                // Log pixel data for debugging
                const pixelData = context.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;
                requestAnimationFrame(() => {
                    canvas.style.display = 'none';
                    canvas.offsetHeight; // Trigger reflow
                    canvas.style.display = 'block';
                    console.log(`Drawing frame: ${frameIndex}, offsetX: ${offsetX}, offsetY: ${offsetY}, drawWidth: ${drawWidth}, drawHeight: ${drawHeight}, centerPixel: ${pixelData}`);
                });
            } else {
                console.warn(`Frame ${frameIndex} not loaded`);
                setTimeout(() => drawFrame(frameIndex), 100);
            }
        }

        // Debounce function
        function debounce(func, wait) {
            let timeout;
            return function (...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        }

        // Scroll handler
        let lastFrameIndex = -1;

        const updateFrame = () => {
            const containerRect = animationContainer.getBoundingClientRect();
            const scrollY = window.scrollY;
            const containerTop = containerRect.top + scrollY;
            const containerHeight = containerRect.height;
            const scrollPosition = Math.max(0, scrollY - containerTop);
            const progress = Math.min(Math.max(scrollPosition / animationDuration, 0), 1);
            const frameIndex = Math.floor(progress * (totalFrames - 1));
            // Calculate opacity for fade-in/fade-out
            let opacity = 1;
            if (progress < 0.1) {
                opacity = progress * 10; // Fade in over first 10%
            } else if (progress > 0.9) {
                opacity = (1 - progress) * 10; // Fade out over last 10%
            }
            canvasWrapper.style.opacity = opacity.toString();
            if (frameIndex !== lastFrameIndex) {
                drawFrame(frameIndex);
                lastFrameIndex = frameIndex;
            }
            console.log(`ScrollY: ${scrollY}, ContainerTop: ${containerTop}, ScrollPosition: ${scrollPosition}, Progress: ${progress}, FrameIndex: ${frameIndex}, Opacity: ${opacity}`);
        };

        // Canvas visibility observer
        const canvasObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    canvasWrapper.style.display = 'block';
                    canvasWrapper.style.zIndex = '0'; // Above background, below content
                    canvasWrapper.style.visibility = 'visible';
                    canvasWrapper.style.opacity = '0'; // Start faded out
                    console.log('Canvas wrapper display: block, z-index: 0, visibility: visible, opacity: 0');
                    console.log(`Canvas wrapper computed style: display=${getComputedStyle(canvasWrapper).display}, z-index=${getComputedStyle(canvasWrapper).zIndex}, visibility=${getComputedStyle(canvasWrapper).visibility}, opacity=${getComputedStyle(canvasWrapper).opacity}`);
                    console.log(`Stacking context: page.zIndex=${getComputedStyle(document.querySelector('.page')).zIndex}, pageBackground.zIndex=${getComputedStyle(document.querySelector('.page-background') || document.body).zIndex}, canvasWrapper.zIndex=${getComputedStyle(canvasWrapper).zIndex}, content.zIndex=${getComputedStyle(document.querySelector('.content')).zIndex}, videoContainer.zIndex=${getComputedStyle(document.querySelector('.video-container')).zIndex}`);
                } else {
                    canvasWrapper.style.display = 'none';
                    canvasWrapper.style.zIndex = '0';
                    canvasWrapper.style.visibility = 'hidden';
                    canvasWrapper.style.opacity = '0';
                    console.log('Canvas wrapper display: none, z-index: 0, visibility: hidden, opacity: 0');
                }
            });
        }, { threshold: 0.1, rootMargin: '-10%' });

        // Start animation after images load
        loadImages().then(() => {
            // Wait for first frame to be fully loaded
            if (images[0].complete) {
                aspectRatio = images[0].width / images[0].height;
                drawFrame(0);
                console.log('Initial frame loaded, aspect ratio:', aspectRatio);
            } else {
                images[0].onload = () => {
                    aspectRatio = images[0].width / images[0].height;
                    drawFrame(0);
                    console.log('Initial frame loaded, aspect ratio:', aspectRatio);
                };
            }
            canvasObserver.observe(animationContainer);
            window.addEventListener('scroll', debounce(updateFrame, 16));
            document.addEventListener('touchmove', debounce(updateFrame, 16));
            // Fallback: Display static image if canvas appears blank
            setTimeout(() => {
                if (lastFrameIndex === -1) {
                    // Sample multiple pixels
                    const pixels = [
                        context.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data,
                        context.getImageData(canvas.width - 10, 10, 1, 1).data,
                        context.getImageData(10, canvas.height - 10, 1, 1).data
                    ];
                    console.log(`Canvas pixel data: center=${pixels[0]}, topRight=${pixels[1]}, bottomLeft=${pixels[2]}`);
                    if (pixels.every(pixel => pixel.every(val => val === 0))) {
                        console.warn('Canvas appears blank, adding fallback image');
                        const fallbackImg = document.createElement('img');
                        fallbackImg.src = '/assets/wrongway_frames/frame_001.png';
                        fallbackImg.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; max-width: 100vw; max-height: 100vh; z-index: 0; display: none; object-fit: contain;';
                        canvasWrapper.appendChild(fallbackImg);
                        const fallbackObserver = new IntersectionObserver(entries => {
                            entries.forEach(entry => {
                                if (entry.isIntersecting) {
                                    fallbackImg.style.display = 'block';
                                    console.log('Fallback image display: block');
                                } else {
                                    fallbackImg.style.display = 'none';
                                    console.log('Fallback image display: none');
                                }
                            });
                        }, { threshold: 0.1, rootMargin: '-10%' });
                        fallbackObserver.observe(animationContainer);
                    }
                } else {
                    console.log('Canvas rendering active, skipping fallback');
                }
            }, 5000);
        }).catch(err => {
            console.error('Image loading failed:', err);
            if (loadingIndicator) {
                loadingIndicator.textContent = 'Using static image';
                loadingIndicator.style.display = 'none';
                const fallbackImg = document.createElement('img');
                fallbackImg.src = '/assets/wrongway_frames/frame_001.png';
                fallbackImg.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; max-width: 100vw; max-height: 100vh; z-index: 0; display: none; object-fit: contain;';
                canvasWrapper.appendChild(fallbackImg);
                const fallbackObserver = new IntersectionObserver(entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            fallbackImg.style.display = 'block';
                            console.log('Fallback image display: block due to load failure');
                        } else {
                            fallbackImg.style.display = 'none';
                            console.log('Fallback image display: none');
                        }
                    });
                }, { threshold: 0.1, rootMargin: '-10%' });
                fallbackObserver.observe(animationContainer);
            }
        });
    } else {
        console.warn('Animation skipped: Canvas, canvasWrapper, or scrollContainer missing, or not on wrongway.html');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }
});
