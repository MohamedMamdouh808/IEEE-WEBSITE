// Mobile menu functionality
const hamburger = document.querySelector('.hamburger');
const navContainer = document.querySelector('.nav-container');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navContainer.classList.toggle('active');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('nav')) {
        navContainer.classList.remove('active');
        hamburger.classList.remove('open');
    }
});

// Close menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navContainer.classList.remove('active');
        hamburger.classList.remove('open');
    });
});

// Sticky navbar on scroll
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.main-head');
    if (window.scrollY > 50) {
        nav.classList.add('slidedown');
    } else {
        nav.classList.remove('slidedown');
    }
});
// Navbar scroll effect - remove blurry background from nav-container
window.addEventListener('scroll', function() {
    const navContainer = document.querySelector('.nav-container');
    if (window.scrollY > 100) {
      navContainer.classList.add('scrolled');
    } else {
      navContainer.classList.remove('scrolled');
    }
});

// Theme toggle functionality
const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn, .theme-toggle-mobile');
const body = document.body;

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
body.classList.toggle('dark-mode', currentTheme === 'dark');

// Update button icons based on current theme
function updateThemeIcons() {
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
        const lightIcon = btn.querySelector('.light-icon');
        const darkIcon = btn.querySelector('.dark-icon');
        
        if (body.classList.contains('dark-mode')) {
            lightIcon.style.display = 'none';
            darkIcon.style.display = 'block';
        } else {
            lightIcon.style.display = 'block';
            darkIcon.style.display = 'none';
        }
    });
}

// Initialize icon states
updateThemeIcons();

// Theme toggle click handler for both buttons
themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        
        // Save theme preference to localStorage
        const newTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        
        // Update button icons
        updateThemeIcons();
        
        // Trigger wave animation update for theme change
        const waveCanvas = document.getElementById('waveCanvas');
        if (waveCanvas) {
            // Dispatch a custom event to notify the wave animation
            const themeChangeEvent = new CustomEvent('themeChange', {
                detail: { theme: newTheme }
            });
            window.dispatchEvent(themeChangeEvent);
        }
    });
});

// Reveal-on-scroll for left border components
window.addEventListener('DOMContentLoaded', () => {
  const lineSections = document.querySelectorAll('.with-left-line');
  if (!('IntersectionObserver' in window) || lineSections.length === 0) return;

  const lineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        lineObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.35, rootMargin: '0px 0px -40px 0px' });

  lineSections.forEach(el => lineObserver.observe(el));
});

// Generic reveal observer for single elements
window.addEventListener('DOMContentLoaded', () => {
  const singles = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && singles.length) {
    const singleObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          singleObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25, rootMargin: '0px 0px -60px 0px' });
    singles.forEach(el => singleObserver.observe(el));
  }
});

// Reveal observer for staggered groups
window.addEventListener('DOMContentLoaded', () => {
  const groups = document.querySelectorAll('.reveal-group');
  if (!('IntersectionObserver' in window) || groups.length === 0) return;

  const groupObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const group = entry.target;
        group.classList.add('revealed');
        const items = group.querySelectorAll('.reveal-item');
        items.forEach((item, idx) => {
          item.style.transitionDelay = `${Math.min(60 * idx, 360)}ms`;
          // Force reflow to apply delay before adding state
          void item.offsetWidth;
          item.classList.add('revealed');
        });
        groupObserver.unobserve(group);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -80px 0px' });

  groups.forEach(g => groupObserver.observe(g));
});