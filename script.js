document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.querySelector('.menu-button');
    const menuLinks = document.querySelector('.menu-links');
    const dropdowns = document.querySelectorAll('.dropdown');
    const sections = document.querySelectorAll('.page');
    const video = document.querySelector('.model-video');

    // Mobile menu toggle
    menuButton.addEventListener('click', () => {
        menuButton.classList.toggle('open');
        menuLinks.classList.toggle('open');
    });

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

    // Scroll-driven video scrubbing
    if (video) {
        const secondPage = document.querySelectorAll('.page')[1];
        const animationDuration = 3 * window.innerHeight; // Span pages 2-4
        let videoDuration = 10; // Default video duration in seconds
        let secondPageTop = 0;

        // Calculate second page offset
        const updateOffsets = () => {
            secondPageTop = secondPage.getBoundingClientRect().top + window.scrollY;
            console.log(`Second page top: ${secondPageTop}, Animation duration: ${animationDuration}`);
        };
        updateOffsets();
        window.addEventListener('resize', updateOffsets);

        // Video event listeners
        video.addEventListener('loadedmetadata', () => {
            videoDuration = video.duration || 10;
            video.currentTime = 0;
            video.pause();
            console.log(`Video loaded, duration: ${videoDuration}s, readyState: ${video.readyState}, paused: ${video.paused}`);
            // Briefly play to test
            video.play().then(() => {
                setTimeout(() => video.pause(), 100);
                console.log('Video can play, paused after brief test');
            }).catch(e => console.error('Play test failed:', e));
        });

        video.addEventListener('error', (e) => {
            console.error('Video error:', e, 'Source:', video.currentSrc);
        });

        video.addEventListener('canplay', () => {
            console.log('Video can play, readyState:', video.readyState);
            video.pause();
        });

        video.addEventListener('timeupdate', () => {
            console.log(`Video time updated: ${video.currentTime}s`);
        });

        // Prevent auto-play
        video.addEventListener('play', () => {
            if (video.currentTime > 0 && !video.paused) {
                video.pause();
                console.log('Prevented unintended playback');
            }
        });

        // Scroll handler
        const handleScroll = () => {
            const scrollPosition = Math.max(0, window.scrollY - secondPageTop);
            const progress = Math.min(scrollPosition / animationDuration, 1);
            if (!isNaN(videoDuration) && video.readyState >= 2) {
                video.currentTime = progress * videoDuration;
                console.log(`ScrollY: ${window.scrollY}, ScrollPosition: ${scrollPosition}, Progress: ${progress}, Video time: ${video.currentTime}s`);
            } else {
                console.warn('Video not ready:', { readyState: video.readyState, duration: videoDuration });
                // Retry after delay
                setTimeout(() => {
                    if (video.readyState >= 2) {
                        video.currentTime = progress * videoDuration;
                    }
                }, 500);
            }
        };

        // Debounced scroll
        let lastScroll = 0;
        const debounce = (func, wait) => {
            let timeout;
            return (...args) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => func(...args), wait);
            };
        };
        window.addEventListener('scroll', debounce(handleScroll, 10));

        // Force video load
        console.log('Loading video:', video.currentSrc || 'No source yet');
        video.load();
    } else {
        console.error('Video element not found');
    }
});
