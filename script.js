document.addEventListener('DOMContentLoaded', () => {

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Improved header scroll behavior for mobile and desktop
    const header = document.querySelector('header');
    const headerHeight = header.offsetHeight;
    let lastScrollTop = 0;
    let scrollTimer = null;
    const scrollThreshold = 10; // Minimum scroll distance before action
    
    // Prevent horizontal scrolling on mobile
    document.body.addEventListener('touchmove', function(e) {
        if (e.touches.length > 1) {
            e.preventDefault(); // Prevent pinch zoom causing horizontal scroll
        }
    }, { passive: false });
    
    // Fix for iOS 100vh issue
    function setVhProperty() {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    // Set the property on page load
    setVhProperty();
    
    // Update the property on resize
    window.addEventListener('resize', () => {
        setVhProperty();
        adjustForMobile();
    });
    
    // Handle scroll with debouncing for better mobile performance
    window.addEventListener('scroll', function() {
        if (scrollTimer !== null) {
            clearTimeout(scrollTimer);
        }
        
        scrollTimer = setTimeout(function() {
            handleHeaderScroll();
        }, 10); // Short delay to avoid performance issues
    });
    
    // Touch-specific events for better mobile response
    let touchStartY = 0;
    
    window.addEventListener('touchstart', function(e) {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    window.addEventListener('touchmove', function(e) {
        if (!touchStartY) {
            return;
        }
        
        const touchY = e.touches[0].clientY;
        const diff = touchStartY - touchY;
        
        // If significant vertical movement detected
        if (Math.abs(diff) > 30) {
            if (diff > 0) {
                // Scrolling down
                header.classList.add('header-hidden');
            } else {
                // Scrolling up
                header.classList.remove('header-hidden');
            }
        }
    }, { passive: true });
    
    function handleHeaderScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (Math.abs(scrollTop - lastScrollTop) < scrollThreshold) {
            return; // Ignore small movements
        }

        // Check scroll direction
        if (scrollTop > lastScrollTop && scrollTop > headerHeight * 2) {
            // Scrolling down & not at the top
            header.classList.add('header-hidden');
        } else if (scrollTop < lastScrollTop || scrollTop < headerHeight) {
            // Scrolling up or at the top
            header.classList.remove('header-hidden');
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        
        // Reveal elements on scroll
        revealElementsOnScroll();
    }

    // Email Subscription Form Handling with improved mobile validation
    const subscribeForm = document.getElementById('subscribe-form');
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = document.getElementById('email');
            const email = emailInput.value;

            if (validateEmail(email)) {
                // Show success message instead of alert for better mobile experience
                showFormMessage('Thank you for subscribing! We\'ll notify you at launch.', 'success');
                emailInput.value = ''; // Clear the input
                emailInput.blur(); // Hide keyboard on mobile
            } else {
                // Show error message instead of alert
                showFormMessage('Please enter a valid email address.', 'error');
            }
        });
        
        // Auto-focus/blur for better mobile experience
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('focus', function() {
                // Scroll to make sure form is visible when keyboard appears
                setTimeout(() => {
                    window.scrollTo({
                        top: emailInput.getBoundingClientRect().top + window.pageYOffset - 150,
                        behavior: 'smooth'
                    });
                }, 300);
            });
        }
    }

    function validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    // Show form message with custom styling
    function showFormMessage(message, type) {
        // Remove any existing message
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageElement = document.createElement('div');
        messageElement.className = `form-message ${type}`;
        messageElement.textContent = message;
        
        // Insert after the form
        subscribeForm.insertAdjacentElement('afterend', messageElement);
        
        // Auto remove message after 4 seconds
        setTimeout(() => {
            messageElement.classList.add('fade-out');
            setTimeout(() => messageElement.remove(), 500);
        }, 4000);
    }

    // On-scroll reveal animations - optimized for mobile
    const revealElements = document.querySelectorAll('.highlight-item, .gallery-item');

    const revealObserverOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // 10% of the item is visible
    };

    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Stop observing once visible
            }
        });
    };

    const revealObserver = new IntersectionObserver(revealCallback, revealObserverOptions);

    function revealElementsOnScroll() {
        revealElements.forEach(el => {
            // Check if element is in viewport without Intersection Observer for initial load or fallback
            // This is somewhat redundant if IO is working, but good as a simple check
            const elementTop = el.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            if (elementTop < windowHeight * 0.85) { // Reveal if 85% of element is in view from top
                if (!el.classList.contains('is-visible')) { // Add class if not already added by IO
                     el.classList.add('is-visible');
                }
            }
            // If IntersectionObserver is supported, it will handle adding the class more efficiently
            if ('IntersectionObserver' in window) {
                 revealObserver.observe(el);
            }
        });
    }
    
    // Initial check for reveals in case elements are already in view on load
    revealElementsOnScroll();
    
    function adjustForMobile() {
        const isMobile = window.innerWidth < 768;
        
        // Handle email form layout on smaller screens
        if (window.innerWidth <= 480) {
            if (subscribeForm) {
                subscribeForm.classList.add('mobile-layout');
            }
        } else {
            if (subscribeForm) {
                subscribeForm.classList.remove('mobile-layout');
            }
        }
        
        // Adjust for mobile devices
        if (isMobile) {
            document.body.classList.add('is-mobile');
        } else {
            document.body.classList.remove('is-mobile');
        }
    }
    
    // Run mobile adjustments on load
    adjustForMobile();
    
    // Mobile optimizations
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
        // Optimize background images loading
        const deferredImages = document.querySelectorAll('[data-bg]');
        deferredImages.forEach(img => {
            // Load background images when needed
            if (img.dataset.bg) {
                img.style.backgroundImage = `url(${img.dataset.bg})`;
            }
        });
        
        // Add touch feedback on mobile
        document.querySelectorAll('a, button').forEach(element => {
            element.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            });
            element.addEventListener('touchend', function() {
                this.classList.remove('touch-active');
            });
        });
    }
}); 
