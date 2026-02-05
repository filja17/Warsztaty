/* ========================================
   NAVIGATION.JS
   Menu mobilne, hamburger, overlay
   ======================================== */

'use strict';

class MobileNavigation {
    constructor() {
        this.nav = null;
        this.menu = null;
        this.hamburger = null;
        this.overlay = null;
        this.isOpen = false;
        this.focusableElements = [];
        
        this.init();
    }
    
    init() {
        this.nav = document.querySelector('.nav');
        this.menu = document.querySelector('.nav__menu');
        this.hamburger = document.querySelector('.nav__hamburger');
        
        if (!this.nav || !this.menu || !this.hamburger) return;
        
        // Utwórz overlay
        this.createOverlay();
        
        // Event listeners
        this.hamburger.addEventListener('click', () => this.toggle());
        
        // Zamknij menu po kliknięciu w link
        const menuLinks = this.menu.querySelectorAll('.nav__link');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (this.isOpen) {
                    this.close();
                }
            });
        });
        
        // Zamknij na Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
        
        // Zamknij przy resize (jeśli przejście na desktop)
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isOpen) {
                this.close();
            }
        });
    }
    
    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'nav-overlay';
        this.overlay.setAttribute('aria-hidden', 'true');
        document.body.appendChild(this.overlay);
        
        // Zamknij menu po kliknięciu w overlay
        this.overlay.addEventListener('click', () => this.close());
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        this.isOpen = true;
        
        // Aktualizuj klasy
        this.menu.classList.add('is-open');
        this.hamburger.classList.add('is-active');
        this.hamburger.setAttribute('aria-expanded', 'true');
        this.overlay.classList.add('is-visible');
        
        // Zablokuj scroll body
        document.body.style.overflow = 'hidden';
        
        // Animuj linki menu (staggered)
        const links = this.menu.querySelectorAll('.nav__link');
        links.forEach((link, index) => {
            link.style.transitionDelay = `${150 + index * 50}ms`;
            link.classList.add('is-visible');
        });
        
        // Focus trap
        this.trapFocus();
    }
    
    close() {
        this.isOpen = false;
        
        // Reset delays i ukryj linki
        const links = this.menu.querySelectorAll('.nav__link');
        links.forEach((link, index) => {
            link.style.transitionDelay = `${(links.length - index - 1) * 30}ms`;
            link.classList.remove('is-visible');
        });
        
        // Poczekaj na animację linków, potem zamknij menu
        setTimeout(() => {
            this.menu.classList.remove('is-open');
            this.hamburger.classList.remove('is-active');
            this.hamburger.setAttribute('aria-expanded', 'false');
            this.overlay.classList.remove('is-visible');
            
            // Odblokuj scroll
            document.body.style.overflow = '';
            
            // Reset delays
            links.forEach(link => {
                link.style.transitionDelay = '';
            });
        }, 200);
        
        // Przywróć focus
        this.hamburger.focus();
    }
    
    trapFocus() {
        // Znajdź focusable elementy w menu
        this.focusableElements = this.menu.querySelectorAll(
            'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        
        if (this.focusableElements.length === 0) return;
        
        const firstElement = this.focusableElements[0];
        const lastElement = this.focusableElements[this.focusableElements.length - 1];
        
        // Focus na pierwszym elemencie
        setTimeout(() => firstElement.focus(), 100);
        
        // Trap handler
        this.trapHandler = (e) => {
            if (e.key !== 'Tab') return;
            
            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };
        
        document.addEventListener('keydown', this.trapHandler);
    }
}


// ========================================
// ACTIVE LINK HIGHLIGHT
// ========================================

class ActiveLinkHighlight {
    constructor() {
        this.links = [];
        this.init();
    }
    
    init() {
        this.links = document.querySelectorAll('.nav__link');
        
        // Pobierz aktualną ścieżkę
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'index.html';
        
        this.links.forEach(link => {
            const href = link.getAttribute('href');
            
            // Sprawdź dopasowanie
            if (href === currentPage || 
                (currentPage === '' && href === 'index.html') ||
                (currentPage === 'index.html' && href === 'index.html')) {
                link.classList.add('nav__link--active');
            } else {
                link.classList.remove('nav__link--active');
            }
        });
    }
}


// ========================================
// INICJALIZACJA
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    const mobileNav = new MobileNavigation();
    const activeLinks = new ActiveLinkHighlight();
    
    // Expose for debugging
    window.mobileNav = mobileNav;
});