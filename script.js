document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.querySelector('.menu-button');
    const menuLinks = document.querySelector('.menu-links');
    const dropdowns = document.querySelectorAll('.dropdown');
    const sections = document.querySelectorAll('.page');
    const canvas = document.querySelector('.model-canvas');
    const canvasContainer = document.querySelector('.canvas-container');
    const scrollContainer = document.querySelector('.scroll-container');
    const video = document.querySelector('.background-video');
    const playButton = document.querySelector('.video-play-button');
    const fallbackImage = document.querySelector('.video-fallback');

    // Debug elements and dimensions
    console.log('Canvas element:', canvas ? 'Found' : 'Not found', canvas);
    console.log('Scroll container:', scrollContainer ? 'Found' : 'Not found', scrollContainer);
    console.log('Video element:', video ? 'Found' : 'Not found', video);
    console.log(`Viewport: innerHeight=${window.innerHeight}, clientHeight=${document.documentElement.clientHeight}, visualViewport=${window.visualViewport ? window.visualViewport.height : 'N/A'}`);
    console.log(`Document scrollHeight: ${document.body.scrollHeight}, Container scrollHeight: ${scrollContainer ? scrollContainer.scrollHeight : 'N/A'}`);

    // Video handling
    if (video) {
        // Video event listeners for debugging
        video.addEventListener('loadedmetadata', () => console.log('Video metadata loaded'));
        video.addEventListener('canplay', () => console.log('Video can play'));
        video.addEventListener('playing', () => console.log('Video is playing'));
        video.addEventListener('pause', () => console.log('Video paused'));
        video.addEventListener('error', (e) => console.error('Video error:', e));
        video.addEventListener('stalled', () => console.error('Video stalled'));
        video.addEventListener('loadeddata', () => console.log('Video data loaded'));

        // Attempt to play video
        video.play().catch(err => {
            console.error('Video autoplay failed:', err);
            if (playButton) {
                playButton.style.display = 'block'; // Show play button
            }
            if (fallbackImage) {
                fallbackImage.style.display = 'block'; // Show fallback image
            }
        });
    }

    // Play/pause button handling
    if (playButton && video) {
        playButton.addEventListener('click', () => {
            if (video.paused) {
                video.play().then(() => {
                    console.log('Video manually played');
                    playButton.textContent = 'Pause';
                    if (fallbackImage) {
                        fallbackImage.style.display = 'none';
                    }
                }).catch(err => console.error('Manual play failed:', err));
            } else {
                video.pause();
                console.log('Video manually paused');
                playButton.textContent = 'Play';
            }
        });
    }

    // Raw scroll event debug
    window.addEventListener('scroll', () => {
        console.log(`Raw scroll event (window): ${window.scrollY}`);
    });
    document.addEventListener('touchmove', () => {
        console.log(`Touchmove event: ${window.scrollY}`);
    });

    // Test scroll listener
    window.onscroll = () => {
        console.log(`Basic scroll test: ${window.scrollY}`);
    };

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
        rootMargin: '0px'
    });

    sections.forEach(section => observer.observe(section));

    // Scroll-driven CAD animation
    if (canvas && canvasContainer && scrollContainer && window.location.pathname.includes('wrongway.html')) {
        const context = canvas.getContext('2d', { willReadFrequently: true }); // Safari compatibility
        const secondPage = document.querySelectorAll('.page')[1];
        const fifthPage = document.querySelectorAll('.page')[4];
        const totalFrames = 120; // 120 frames
        const animationDuration = 1170; // Scroll distance from page 2 to page 5 (~3 viewports)
        const images = [];
        let aspectRatio = 16 / 9; // Default aspect ratio

        // Preload images
        for (let i = 1; i <= totalFrames; i++) {
            const img = new Image();
            img.src = `/assets/wrongway_frames/frame_${i.toString().padStart(3, '0')}.png`;
            images.push(img);
        }

        // Debounce function for resize events
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

        // Resize canvas
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            drawFrame(0); // Draw initial frame
            console.log(`Canvas resized: width=${canvas.width}, height=${canvas.height}`);
        };

        // Debounced resize handler
        const debouncedResize = debounce(resizeCanvas, 100);
        window.addEventListener('resize', debouncedResize);
        resizeCanvas(); // Initial call

        // Calculate page offsets
        let secondPageTop = secondPage.getBoundingClientRect().top + window.scrollY;
        let fifthPageTop = fifthPage.getBoundingClientRect().top + window.scrollY;
        console.log(`Initial second page top: ${secondPageTop}, Fifth page top: ${fifthPageTop}, Animation duration: ${animationDuration}, Window innerHeight: ${window.innerHeight}`);

        // Update offsets on resize
        window.addEventListener('resize', () => {
            secondPageTop = secondPage.getBoundingClientRect().top + window.scrollY;
            fifthPageTop = fifthPage.getBoundingClientRect().top + window.scrollY;
            console.log(`Updated second page top: ${secondPageTop}, Fifth page top: ${fifthPageTop}`);
        });

        // Draw frame
        function drawFrame(frameIndex) {
            if (images[frameIndex] && images[frameIndex].complete) {
                context.clearRect(0, 0, canvas.width, canvas.height);
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
                console.log(`Drawing frame: ${frameIndex}`);
            } else {
                console.warn(`Frame ${frameIndex} not loaded`);
            }
        }

        // Scroll handler
        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateFrame = () => {
            const scrollY = window.scrollY;
            // Toggle canvas visibility
            if (scrollY >= secondPageTop && scrollY < fifthPageTop) {
                canvasContainer.style.display = 'block';
                console.log(`Canvas container display: block`);
            } else {
                canvasContainer.style.display = 'none';
                console.log(`Canvas container display: none`);
            }

            // Calculate animation progress
            const scrollPosition = Math.max(0, scrollY - secondPageTop);
            const progress = Math.min(Math.max(scrollPosition / animationDuration, 0), 1);
            const frameIndex = Math.floor(progress * (totalFrames - 1));
            console.log(`ScrollY: ${scrollY}, SecondPageTop: ${secondPageTop}, ScrollPosition: ${scrollPosition}, Progress: ${progress}, FrameIndex: ${frameIndex}`);
            drawFrame(frameIndex);
            ticking = false;
        };

        const handleScroll = () => {
            console.log('Scroll event fired');
            lastScrollY = window.scrollY;
            if (!ticking) {
                requestAnimationFrame(updateFrame);
                ticking = true;
            }
        };

        // Attach scroll listeners
        console.log('Attaching scroll listeners');
        window.addEventListener('scroll', handleScroll);
        document.addEventListener('touchmove', handleScroll);
        document.addEventListener('touchstart', handleScroll); // Mobile support

        // Initial frame and aspect ratio
        images[0].onload = () => {
            aspectRatio = images[0].width / images[0].height;
            drawFrame(0);
            console.log('Initial frame loaded, aspect ratio:', aspectRatio);
        };

        // Debug image loading
        images.forEach((img, index) => {
            img.onload = () => console.log(`Frame ${index + 1} loaded`);
            img.onerror = () => console.error(`Error loading frame ${index + 1}: ${img.src}`);
        });
    } else {
        console.warn('Animation skipped: Canvas, canvasContainer, or scrollContainer missing, or not on wrongway.html');
    }
});
