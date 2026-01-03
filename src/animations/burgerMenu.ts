export const initBurgerMenu = () => {
  const burgerMenu = document.querySelector('.burger-menu');
  const navLinks = document.querySelector('.nav-links');

  if (burgerMenu && navLinks) {
    burgerMenu.addEventListener('click', () => {
      burgerMenu.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close menu when clicking on a link
    navLinks.addEventListener('click', (event) => {
      if ((event.target as HTMLElement).closest('a')) {
        burgerMenu.classList.remove('active');
        navLinks.classList.remove('active');
      }
    });
  }
};
