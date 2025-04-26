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
        const animationDuration = 2 * window.innerHeight; // Span pages 2-4
        const videoDuration = 10; // Video duration in seconds

        window.addEventListener('scroll', () => {
            const rect = secondPage.getBoundingClientRect();
            const scrollPosition = -rect.top; // Distance scrolled past second page
            const progress = Math.min(Math.max(scrollPosition / animationDuration, 0), 1);
            video.currentTime = progress * videoDuration;
        });

        // Ensure video is ready
        video.addEventListener('loadedmetadata', () => {
            video.currentTime = 0; // Start at beginning
        });
    }
});
