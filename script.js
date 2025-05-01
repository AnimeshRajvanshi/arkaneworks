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
        // Video debugging
        video.addEventListener('error', (e) => console.error('Video error:', e));
        video.addEventListener('loadeddata', () => console.log('Video loaded successfully'));
        video.addEventListener('canplay', () => console.log('Video can play'));
        video.addEventListener('play', () => console.log('Video playing'));
        video.addEventListener('pause', () => console.log('Video paused'));
        video.addEventListener('stalled', () => console.log('Video stalled'));

        // Retry playback
        const tryPlay = () => {
            video.play().catch(err => {
                console.error('Video play failed:', err);
                setTimeout(tryPlay, 1000); // Retry after 1s
            });
        };
        tryPlay();

        // Pause/resume based on visibility
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
        const context = canvas.getContext('2d', { willReadFrequently: true }); // Safari compatibility
        const secondPage = document.querySelectorAll('.page')[1];
        const fifthPage = document.querySelectorAll('.page')[4];
        const totalFrames = 120; // 120 frames at 12 FPS
        const animationDuration = 1170; // Span from page 2 to page 5 (~3 viewports)
        const images = [];
        let imagesLoaded = 0;
        let aspectRatio = 16 / 9; // Default aspect ratio, updated on first image load

        // Preload images via hidden div
        for (let i = 1; i <= totalFrames; i++) {
            const img = document.createElement('img');
            img.src = `/assets/wrongway_frames/frame_${i.toString().padStart(3, '0')}.png`;
            img.style.display = 'none';
            imagePreload.appendChild(img);
            images.push(img);
            img.onload = () => {
                imagesLoaded++;
                console.log(`Frame ${i} loaded`);
                if (imagesLoaded === totalFrames && loadingIndicator) {
                    loadingIndicator.style.display = 'none';
                    console.log('All frames loaded, hiding loading indicator');
                }
            };
            img.onerror = () => console.error(`Error loading frame ${i}: ${img.src}`);
        }

        // Show loading indicator
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
        }

        // Initialize canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            drawFrame(0); // Draw initial frame
            console.log(`Canvas resized: width=${canvas.width}, height=${canvas.height}`);
        };
        window.addEventListener('resize', resizeCanvas);
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

        // Draw frame on canvas
        function drawFrame(frameIndex) {
            if (images[frameIndex] && images[frameIndex].complete) {
                context.clearRect(0, 0, canvas.width, canvas.height);
                const img = images[frameIndex];
                // Calculate dimensions to fill viewport while preserving aspect ratio
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
        let lastFrameIndex = -1;

        const updateFrame = () => {
            const scrollY = window.scrollY;
            // Show/hide canvas based on scroll position
            if (scrollY >= secondPageTop && scrollY < fifthPageTop) {
                canvasWrapper.style.display = 'block';
                console.log(`Canvas wrapper display: block`);
            } else {
                canvasWrapper.style.display = 'none';
                console.log(`Canvas wrapper display: none`);
            }

            const scrollPosition = Math.max(0, scrollY - secondPageTop);
            const progress = Math.min(Math.max(scrollPosition / animationDuration, 0), 1);
            const frameIndex = Math.floor(progress * (totalFrames - 1));
            if (frameIndex !== lastFrameIndex) {
                drawFrame(frameIndex);
                lastFrameIndex = frameIndex;
            }
            console.log(`ScrollY: ${scrollY}, SecondPageTop: ${secondPageTop}, ScrollPosition: ${scrollPosition}, Progress: ${progress}, FrameIndex: ${frameIndex}`);
            requestAnimationFrame(updateFrame);
        };

        // Start animation loop
        requestAnimationFrame(updateFrame);

        // Attach scroll listeners
        console.log('Attaching scroll listeners');
        window.addEventListener('scroll', () => {
            lastScrollY = window.scrollY;
        });
        document.addEventListener('touchmove', () => {
            lastScrollY = window.scrollY;
        });

        // Initial frame and aspect ratio
        images[0].onload = () => {
            aspectRatio = images[0].width / images[0].height;
            drawFrame(0);
            console.log('Initial frame loaded, aspect ratio:', aspectRatio);
        };
    } else {
        console.warn('Animation skipped: Canvas, canvasWrapper, or scrollContainer missing, or not on wrongway.html');
    }
});
