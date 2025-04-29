document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.querySelector('.menu-button');
    const menuLinks = document.querySelector('.menu-links');
    const dropdowns = document.querySelectorAll('.dropdown');
    const sections = document.querySelectorAll('.page');
    const canvas = document.querySelector('.model-canvas');
    const scrollContainer = document.querySelector('.scroll-container');

    // Debug elements and dimensions
    console.log('Canvas element:', canvas ? 'Found' : 'Not found', canvas);
    console.log('Scroll container:', scrollContainer ? 'Found' : 'Not found', scrollContainer);
    console.log(`Viewport: innerHeight=${window.innerHeight}, clientHeight=${document.documentElement.clientHeight}, visualViewport=${window.visualViewport ? window.visualViewport.height : 'N/A'}`);
    console.log(`Document scrollHeight: ${document.body.scrollHeight}, Container scrollHeight: ${scrollContainer ? scrollContainer.scrollHeight : 'N/A'}`);

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

    // Scroll-driven image sequence animation
    if (canvas && scrollContainer && window.location.pathname.includes('wrongway.html')) {
        const context = canvas.getContext('2d', { willReadFrequently: true }); // Safari compatibility
        const secondPage = document.querySelectorAll('.page')[1];
        const totalFrames = 120; // 120 frames at 12 FPS
        const animationDuration = Math.max(4.5 * window.innerHeight, 4500); // Span ~3 pages
        const images = [];

        // Preload images
        for (let i = 1; i <= totalFrames; i++) {
            const img = new Image();
            img.src = `/assets/wrongway_frames/frame_${i.toString().padStart(3, '0')}.png`;
            images.push(img);
        }

        // Initialize canvas size
        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            drawFrame(0); // Draw initial frame
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Calculate second page offset
        let secondPageTop = secondPage.getBoundingClientRect().top + window.scrollY;
        console.log(`Initial second page top: ${secondPageTop}, Animation duration: ${animationDuration}, Window innerHeight: ${window.innerHeight}`);

        // Update secondPageTop on resize
        window.addEventListener('resize', () => {
            secondPageTop = secondPage.getBoundingClientRect().top + window.scrollY;
            console.log(`Updated second page top: ${secondPageTop}`);
        });

        // Draw frame on canvas
        function drawFrame(frameIndex) {
            if (images[frameIndex] && images[frameIndex].complete) {
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
                console.log(`Drawing frame: ${frameIndex}`);
            } else {
                console.warn(`Frame ${frameIndex} not loaded`);
            }
        }

        // Scroll handler
        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateFrame = () => {
            const scrollPosition = Math.max(0, window.scrollY - secondPageTop);
            const progress = Math.min(Math.max(scrollPosition / animationDuration, 0), 1);
            const frameIndex = Math.floor(progress * (totalFrames - 1));
            console.log(`ScrollY: ${window.scrollY}, SecondPageTop: ${secondPageTop}, ScrollPosition: ${scrollPosition}, Progress: ${progress}, FrameIndex: ${frameIndex}`);
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
        document.addEventListener('touchstart', handleScroll); // Additional mobile support

        // Initial frame
        images[0].onload = () => {
            drawFrame(0);
            console.log('Initial frame loaded');
        };

        // Debug image loading
        images.forEach((img, index) => {
            img.onload = () => console.log(`Frame ${index + 1} loaded`);
            img.onerror = () => console.error(`Error loading frame ${index + 1}: ${img.src}`);
        });
    } else {
        console.warn('Animation skipped: Canvas or scrollContainer missing, or not on wrongway.html');
    }
});
