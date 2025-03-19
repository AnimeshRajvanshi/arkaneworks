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

    // Show references on scroll
    if (references) {
        window.addEventListener('scroll', () => {
            const rect = references.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            if (rect.top <= windowHeight - 100) { // Trigger 100px before fully in view
                references.classList.add('visible');
            }
        });
    }
});
