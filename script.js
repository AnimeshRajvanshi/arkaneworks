document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.querySelector('.menu-button');
    const menuLinks = document.querySelector('.menu-links');
    const dropdowns = document.querySelectorAll('.dropdown');
    const video1 = document.querySelector('.video-1');
    const video2 = document.querySelector('.video-2');
    const cadSection = document.querySelector('.cad-section');

    // Menu toggle
    menuButton.addEventListener('click', () => {
        menuButton.classList.toggle('open');
        menuLinks.classList.toggle('open');
    });

    // Dropdown toggle for mobile
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                dropdown.classList.toggle('open');
                e.preventDefault();
            }
        });
    });

    // Video looping
    if (video1 && video2) {
        video1.addEventListener('ended', () => {
            video1.style.display = 'none';
            video2.style.display = 'block';
            video2.play();
        });
        video2.addEventListener('ended', () => {
            video2.style.display = 'none';
            video1.style.display = 'block';
            video1.play();
        });
    }

    // CAD animation on scroll
    if (cadSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.5 });
        observer.observe(cadSection);
    }
});
