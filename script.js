document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.querySelector('.menu-button');
    const navigation = document.querySelector('.navigation');
    const pageContainer = document.querySelector('.page-container');
    let isMenuOpen = false;

    menuButton.addEventListener('click', () => {
        isMenuOpen = !isMenuOpen;
        if (isMenuOpen) {
            navigation.style.left = '0';
            pageContainer.classList.add('menu-open');
        } else {
            navigation.style.left = '-200px';
            pageContainer.classList.remove('menu-open');
        }
    });
});
