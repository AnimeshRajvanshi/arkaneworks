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
    console.log(`Viewport: innerHeight=${window.innerHeight}, clientHeight=${document.documentElement.clientHeight}, visualViewport=${window.visualViewport ? window.visualViewport.height : 'N/A'}`);
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
        const context = canvas.getContext('2d', { willReadFrequently: true });
        const animationContainer = document.querySelector('.animation-container');
        const totalFrames = 120;
        const animationDuration = window.innerHeight * 3; // 3 viewports (pages 2-4)
        const images = [];
        let imagesLoaded = 0;
        let aspectRatio = 16 / 9;

        // Preload images with Promise
        const loadImages = () => {
            return new Promise((resolve, reject) => {
                for (let i = 1; i <= totalFrames; i++) {
                    const img = document.createElement('img');
                    img.src = `/assets/wrongway_frames/frame_${i.toString().padStart(3, '0')}.png`;
                    img.style.display = 'none';
                    imagePreload.appendChild(img);
                    images.push(img);
                    img.onload = () => {
                        imagesLoaded++;
                        console.log(`Frame ${i} loaded`);
                        if (imagesLoaded === totalFrames) {
                            if (loadingIndicator) {
                                loadingIndicator.style.display = 'none';
                                console.log('All frames loaded, hiding loading indicator');
                            }
                            resolve();
                        }
                    };
                    img.onerror = () => {
                        console.error(`Error loading frame ${i}: ${img.src}`);
                        reject(new Error(`Failed to load frame ${i}`));
                    };
                }
            });
        };

        // Show loading indicator
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
        }

        // Initialize canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            console.log(`Canvas resized: width=${canvas.width}, height=${canvas.height}`);
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Draw frame on canvas
        function drawFrame(frameIndex) {
            if (images[frameIndex] && images[frameIndex].complete) {
                const img = images[frameIndex];
                let drawWidth = canvas.width;
                let drawHeight = canvas.width / aspectRatio;
                if (drawHeight < canvas.height) {
                    drawHeight = canvas.height;
                    drawWidth = canvas.height * aspectRatio;
                }
                const offsetX = (canvas.width - drawWidth) / 2;
                const offsetY = (canvas.height - drawHeight) / 2;
                context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
                console.log(`Drawing frame: ${frameIndex}, offsetX: ${offsetX}, offsetY: ${offsetY}, drawWidth: ${drawWidth}, drawHeight: ${drawHeight}`);
                // Force repaint
                canvas.style.display = 'none';
                canvas.offsetHeight; // Trigger reflow
                canvas.style.display = 'block';
            } else {
                console.warn(`Frame ${frameIndex} not loaded`);
            }
        }

        // Throttle function
        function throttle(func, limit) {
            let inThrottle;
            return function (...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => (inThrottle = false), limit);
                }
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
            if (frameIndex !== lastFrameIndex) {
                drawFrame(frameIndex);
                lastFrameIndex = frameIndex;
            }
            console.log(`ScrollY: ${scrollY}, ContainerTop: ${containerTop}, ScrollPosition: ${scrollPosition}, Progress: ${progress}, FrameIndex: ${frameIndex}`);
        };

        // Canvas visibility observer
        const canvasObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    canvasWrapper.style.display = 'block';
                    canvasWrapper.style.zIndex = '10'; // Above content
                    console.log('Canvas wrapper display: block, z-index: 10');
                    console.log(`Canvas wrapper computed style: display=${getComputedStyle(canvasWrapper).display}, z-index=${getComputedStyle(canvasWrapper).zIndex}`);
                    updateFrame();
                } else {
                    canvasWrapper.style.display = 'none';
                    canvasWrapper.style.zIndex = '0'; // Reset
                    console.log('Canvas wrapper display: none, z-index: 0');
                }
            });
        }, { threshold: 0.01 });

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
            window.addEventListener('scroll', throttle(updateFrame, 16));
            document.addEventListener('touchmove', throttle(updateFrame, 16));
            // Fallback: Display static image if canvas fails
            setTimeout(() => {
                if (!context.getImageData(0, 0, 1, 1).data.some(val => val !== 0)) {
                    console.warn('Canvas appears blank, adding fallback image');
                    const fallbackImg = document.createElement('img');
                    fallbackImg.src = '/assets/wrongway_frames/frame_001.png';
                    fallbackImg.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 5; display: none;';
                    canvasWrapper.appendChild(fallbackImg);
                    canvasObserver.observe(animationContainer); // Re-observe to toggle fallback
                    canvasObserver.disconnect(); // Disconnect original observer
                    canvasObserver.observe(animationContainer, {
                        callback: entries => {
                            entries.forEach(entry => {
                                if (entry.isIntersecting) {
                                    fallbackImg.style.display = 'block';
                                    console.log('Fallback image display: block');
                                } else {
                                    fallbackImg.style.display = 'none';
                                    console.log('Fallback image display: none');
                                }
                            });
                        }
                    });
                }
            }, 5000);
        }).catch(err => {
            console.error('Image loading failed:', err);
            if (loadingIndicator) {
                loadingIndicator.textContent = 'Failed to load animation';
                loadingIndicator.style.display = 'block';
            }
        });
    } else {
        console.warn('Animation skipped: Canvas, canvasWrapper, or scrollContainer missing, or not on wrongway.html');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }
});
