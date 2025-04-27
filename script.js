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
        let secondPageTop = 0;
        let videoDuration = 10; // Default video duration in seconds

        // Calculate second page offset after DOM stabilization
        requestAnimationFrame(() => {
            secondPageTop = secondPage.offsetTop;
            console.log(`Initial second page top: ${secondPageTop}, Animation duration: ${animationDuration}`);
        });

        // Video event listeners
        video.addEventListener('loadedmetadata', () => {
            videoDuration = video.duration || 10;
            video.currentTime = 0;
            video.pause();
            console.log(`Video loaded, duration: ${videoDuration}s, readyState: ${video.readyState}, paused: ${video.paused}`);
        });

        video.addEventListener('canplay', () => {
            console.log('Video can play, readyState:', video.readyState);
            video.pause();
        });

        video.addEventListener('timeupdate', () => {
            console.log(`Video time updated: ${video.currentTime}s`);
        });

        video.addEventListener('error', (e) => {
            console.error('Video error:', e, 'Source:', video.currentSrc);
        });

        // Scroll handler
        const handleScroll = () => {
            const scrollPosition = Math.max(0, window.scrollY - secondPageTop);
            const progress = Math.min(Math.max(scrollPosition / animationDuration, 0), 1);
            console.log(`ScrollY: ${window.scrollY}, ScrollPosition: ${scrollPosition}, Progress: ${progress}, ReadyState: ${video.readyState}`);
            if (!isNaN(videoDuration) && video.readyState >= 2) {
                try {
                    video.currentTime = progress * videoDuration;
                    console.log(`Video time set to: ${video.currentTime}s`);
                } catch (e) {
                    console.error('Error setting video time:', e);
                }
            } else {
                console.warn('Video not ready for scrubbing:', { readyState: video.readyState, duration: videoDuration });
            }
        };

        // Attach scroll listener
        window.addEventListener('scroll', handleScroll);

        // Force video load
        console.log('Loading video:', video.currentSrc || 'No source yet');
        video.load();
    } else {
        console.error('Video element not found');
    }
});
