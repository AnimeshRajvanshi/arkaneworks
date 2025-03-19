document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.querySelector('.menu-button');
    const navigation = document.querySelector('.navigation');
    const pageContainer = document.querySelector('.page-container');
    const projectImage = document.querySelector('.project-image');
    const references = document.querySelector('.references');
    let isMenuOpen = false;

    // Toggle menu on hamburger/X click
    menuButton.addEventListener('click', () => {
        isMenuOpen = !isMenuOpen;
        if (isMenuOpen) {
            navigation.classList.add('open');
            pageContainer.classList.add('menu-open');
            menuButton.classList.add('open');
        } else {
            navigation.classList.remove('open');
            pageContainer.classList.remove('menu-open');
            menuButton.classList.remove('open');
        }
    });

    // Close menu on outside click
    document.addEventListener('click', (event) => {
        if (isMenuOpen && !navigation.contains(event.target) && !menuButton.contains(event.target)) {
            isMenuOpen = false;
            navigation.classList.remove('open');
            pageContainer.classList.remove('menu-open');
            menuButton.classList.remove('open');
        }
    });

    // Show references when scrolling past the project image
    if (projectImage && references) {
        const observer = new IntersectionObserver((entries) => {
            if (!entries[0].isIntersecting) {
                references.classList.add('visible');
            } else {
                references.classList.remove('visible');
            }
        }, { threshold: 0 });
        observer.observe(projectImage);
    }
});
