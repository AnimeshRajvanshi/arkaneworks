document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.querySelector('.menu-button');
    const navigation = document.querySelector('.navigation');
    const pageContainer = document.querySelector('.page-container');
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

    // Show references when references section enters viewport
    if (references) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    references.classList.add('visible');
                } else {
                    references.classList.remove('visible');
                }
            });
        }, { rootMargin: '0px 0px -100px 0px', threshold: 0.1 });
        observer.observe(references);
    }
});
