console.log('This site was generated by Hugo.');

document.addEventListener('DOMContentLoaded', function() {
    // Handle popup click outside
    const popup = document.querySelector('.popup-overlay');
    if (popup) {
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.classList.remove('active');
            }
        });
    }
});
