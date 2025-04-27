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
        const fourthPage = document.querySelectorAll('.page')[3];
        let secondPageTop = 0;
        let animationDuration = 0;
        let videoDuration = 10; // Default video duration in seconds

        // Calculate page offsets and duration
        const updateOffsets = () => {
            secondPageTop = secondPage.getBoundingClientRect().top + window.scrollY;
            const fourthPageBottom = fourthPage.getBoundingClientRect().bottom + window.scrollY;
            animationDuration = fourthPageBottom - secondPageTop; // Span pages 2-4
            console.log(`Second page top: ${secondPageTop}, Animation duration: ${animationDuration}`);
        };

        // Initial offset calculation
        updateOffsets();

        // Recalculate on resize
        window.addEventListener('resize', updateOffsets);

        // Ensure video is loaded and paused
        video.addEventListener('loadedmetadata', () => {
            videoDuration = video.duration || 10;
            video.currentTime = 0;
            video.pause();
            console.log(`Video loaded, duration: ${videoDuration}s, readyState: ${video.readyState}`);
        });

        // Log errors
        video.addEventListener('error', (e) => {
            console.error('Video error:', e, 'Source:', video.currentSrc);
        });

        // Log when video can play
        video.addEventListener('canplay', () => {
            console.log('Video can play, readyState:', video.readyState);
            video.pause(); // Ensure no automatic playback
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
            const scrollPosition = Math.max(0, window.scrollY - secondPageTop);
            const progress = Math.min(scrollPosition / animationDuration, 1);
            if (!isNaN(videoDuration) && video.readyState >= 2) {
                video.currentTime = progress * videoDuration;
                console.log(`ScrollY: ${window.scrollY}, Progress: ${progress}, Video time: ${video.currentTime}s`);
            } else {
                console.warn('Video not ready or invalid duration:', video.readyState, videoDuration);
            }
        }, 10);

        window.addEventListener('scroll', handleScroll);

        // Force video load
        video.load();
    } else {
        console.error('Video element not found');
    }
});
