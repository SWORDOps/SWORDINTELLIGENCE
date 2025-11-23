// SWORD Intelligence - Client-side JavaScript

(function () {
    'use strict';

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add intersection observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card, .stat-card').forEach(el => {
        observer.observe(el);
    });

    console.log('%c🗡️ SWORD Intelligence', 'color: #00ff88; font-size: 24px; font-weight: bold;');
    console.log('%cPost-Quantum Encrypted Platform', 'color: #00ff88; font-size: 14px;');
    console.log('%cBuilt with ASP.NET Core 8.0 + F# Cryptography', 'color: #a0a0a0; font-size: 12px;');

})();
