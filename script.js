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

        // Log video loading status
        video.addEventListener('loadedmetadata', () => {
            videoDuration = video.duration || 10;
            video.currentTime = 0;
            console.log(`Video loaded, duration: ${videoDuration}s, readyState: ${video.readyState}`);
            video.play().catch(e => console.error('Video play failed:', e));
        });

        // Log errors
        video.addEventListener('error', (e) => {
            console.error('Video error:', e, 'Source:', video.currentSrc);
        });

        // Log when video can play
        video.addEventListener('canplay', () => {
            console.log('Video can play, readyState:', video.readyState);
        });

        // Debounced scroll handler
        let lastScroll = 0;
        const debounce = (func, wait) => {
            let timeout;
            return (...args) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => func(...args), wait);
            };
        };

        const handleScroll = debounce(() => {
            const secondPageTop = secondPage.getBoundingClientRect().top + window.scrollY;
            const scrollPosition = Math.max(0, window.scrollY - secondPageTop);
            const progress = Math.min(scrollPosition / animationDuration, 1);
            if (!isNaN(videoDuration) && video.readyState >= 2) {
                video.currentTime = progress * videoDuration;
                console.log(`Scroll progress: ${progress}, Video time: ${video.currentTime}s`);
            }
        }, 10);

        window.addEventListener('scroll', handleScroll);

        // Force video load
        video.load();
    } else {
        console.error('Video element not found');
    }
});
