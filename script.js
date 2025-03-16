document.addEventListener('DOMContentLoaded', function() {
    let menuButton = document.querySelector('.menu-button');
    let navigation = document.querySelector('.navigation');
    menuButton.addEventListener('click', function() {
        if (navigation.style.left === '-200px' || navigation.style.left === '') {
            navigation.style.left = '0';
        } else {
            navigation.style.left = '-200px';
        }
    });
});