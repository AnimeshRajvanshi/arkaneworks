document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.querySelector('.menu-button');
    const menuLinks = document.querySelector('.menu-links');
    const dropdowns = document.querySelectorAll('.dropdown');
    const sections = document.querySelectorAll('.page');
    const video = document.querySelector('.model-video');
    const scrollContainer = document.querySelector('.scroll-container');

    // Debug elements and dimensions
    console.log('Video element:', video ? 'Found' : 'Not found', video);
    console.log('Scroll container:', scrollContainer ? 'Found' : 'Not found', scrollContainer);
    console.log(`Viewport: innerHeight=${window.innerHeight}, clientHeight=${document.documentElement.clientHeight}, visualViewport=${window.visualViewport ? window.visualViewport.height : 'N/A'}`);
    console.log(`Document scrollHeight: ${document.body.scrollHeight}, Container scrollHeight: ${scrollContainer ? scrollContainer.scrollHeight : 'N/A'}`);

    // Raw scroll event debug
    window.addEventListener('scroll', () => {
        console.log(`Raw scroll event (window): ${window.scrollY}`);
    });

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

    // Scroll-driven video scrubbing (EnduroSat-style)
    if (video && scrollContainer) {
        const secondPage = document.querySelectorAll('.page')[1];
        const animationDuration = Math.max(4.5 * window.innerHeight, 4000); // Span pages 2-4
        let secondPageTop = 0;
        let videoDuration = 10; // Default video duration in seconds

        // Calculate second page offset
        requestAnimationFrame(() => {
            secondPageTop = secondPage.offsetTop;
            if (secondPageTop <= 0) {
                secondPageTop = secondPage.getBoundingClientRect().top + window.scrollY;
            }
            console.log(`Initial second page top: ${secondPageTop}, Animation duration: ${animationDuration}, Window innerHeight: ${window.innerHeight}`);
            console.log(`Raw offsetTop: ${secondPage.offsetTop}, getBoundingClientRect: ${secondPage.getBoundingClientRect().top}, scrollY: ${window.scrollY}`);
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
            video.currentTime = 0;
            console.log('Forced initial seek to 0s');
        });

        video.addEventListener('timeupdate', () => {
            console.log(`Video time updated: ${video.currentTime}s`);
        });

        video.addEventListener('error', (e) => {
            console.error('Video error:', e, 'Source:', video.currentSrc);
        });

        // Scroll handler with requestAnimationFrame
        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateVideoTime = () => {
            const scrollPosition = Math.max(0, window.scrollY - secondPageTop);
            const progress = Math.min(Math.max(scrollPosition / animationDuration, 0), 1);
            console.log(`ScrollY: ${window.scrollY}, SecondPageTop: ${secondPageTop}, ScrollPosition: ${scrollPosition}, Progress: ${progress}, ReadyState: ${video.readyState}, VideoSrc: ${video.currentSrc}`);
            
            if (!isNaN(videoDuration) && video.readyState >= 2) {
                try {
                    console.log(`Attempting to set currentTime: ${progress * videoDuration}`);
                    video.currentTime = progress * videoDuration;
                    console.log(`Video time set to: ${video.currentTime}s`);
                } catch (e) {
                    console.error('Error setting video time:', e);
                }
            } else {
                console.warn('Video not ready for scrubbing:', { readyState: video.readyState, duration: videoDuration });
                setTimeout(() => {
                    if (video.readyState >= 2) {
                        video.currentTime = progress * videoDuration;
                        console.log(`Retry video time set to: ${video.currentTime}s`);
                    }
                }, 100);
            }
            ticking = false;
        };

        const handleScroll = () => {
            console.log('Scroll event fired');
            lastScrollY = window.scrollY;
            if (!ticking) {
                requestAnimationFrame(updateVideoTime);
                ticking = true;
            }
        };

        // Attach scroll listener
        console.log('Attaching scroll listener');
        window.addEventListener('scroll', handleScroll);
        document.addEventListener('touchmove', handleScroll);

        // Force video load
        console.log('Loading video:', video.currentSrc || 'No source yet');
        video.load();
    } else {
        console.error('Missing elements:', { video: !!video, scrollContainer: !!scrollContainer });
    }
});
