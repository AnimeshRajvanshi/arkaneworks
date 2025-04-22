document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.querySelector('.menu-button');
    const menuLinks = document.querySelector('.menu-links');
    const dropdowns = document.querySelectorAll('.dropdown');
    const sections = document.querySelectorAll('.page');

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

    // Fade-in and fade-out animation on scroll
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const content = entry.target.querySelector('.content');
            if (entry.isIntersecting) {
                content.classList.add('visible');
            } else {
                content.classList.remove('visible');
            }
        });
    }, { 
        threshold: [0.1, 0.3, 0.5, 0.7, 0.9],
        rootMargin: '0px'
    });

    sections.forEach(section => observer.observe(section));
});
