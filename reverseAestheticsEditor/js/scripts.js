/*!
* Start Bootstrap - New Age v6.0.7 (https://startbootstrap.com/theme/new-age)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-new-age/blob/master/LICENSE)
*/
//
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

});

function moveDivisor(sliderId, divisorId, handleId) {
    var slider = document.getElementById(sliderId);
    var divisor = document.getElementById(divisorId);
    var handle = document.getElementById(handleId);
    handle.style.left = slider.value + "%";
    divisor.style.width = slider.value + "%";
  }
  
  window.onload = function() {
    moveDivisor('slider1', 'divisor1', 'handle1');
    moveDivisor('slider2', 'divisor2', 'handle2');
    moveDivisor('slider3', 'divisor3', 'handle3');
  };
  

  