/* ========================================
   PRICING.JS
   Interaktywność dla strony cennika
   ======================================== */

'use strict';

// ========================================
// FAQ ACCORDION – Płynne animacje
// ========================================

class FAQAccordion {
    constructor() {
        this.items = [];
        this.init();
    }
    
    init() {
        this.items = document.querySelectorAll('.faq-item');
        
        if (this.items.length === 0) return;
        
        this.items.forEach(item => {
            const summary = item.querySelector('summary');
            const answer = item.querySelector('.faq-item__answer');
            
            if (!summary || !answer) return;
            
            // Customowa obsługa toggle dla płynniejszej animacji
            summary.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggle(item, answer);
            });
            
            // Keyboard support
            summary.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggle(item, answer);
                }
            });
        });
    }
    
    toggle(item, answer) {
        const isOpen = item.hasAttribute('open');
        
        if (isOpen) {
            this.close(item, answer);
        } else {
            // Zamknij inne otwarte (opcjonalnie – accordion behavior)
            // this.closeAll();
            this.open(item, answer);
        }
    }
    
    open(item, answer) {
        // Ustaw open przed animacją
        item.setAttribute('open', '');
        
        // Animuj wysokość
        const height = answer.scrollHeight;
        answer.style.maxHeight = '0px';
        answer.style.opacity = '0';
        
        // Force reflow
        answer.offsetHeight;
        
        // Animuj
        answer.style.transition = 'max-height 0.4s ease, opacity 0.3s ease';
        answer.style.maxHeight = height + 'px';
        answer.style.opacity = '1';
        
        // Cleanup po animacji
        answer.addEventListener('transitionend', function handler() {
            answer.style.maxHeight = '';
            answer.style.transition = '';
            answer.removeEventListener('transitionend', handler);
        });
    }
    
    close(item, answer) {
        // Animuj zamknięcie
        const height = answer.scrollHeight;
        answer.style.maxHeight = height + 'px';
        answer.style.opacity = '1';
        
        // Force reflow
        answer.offsetHeight;
        
        answer.style.transition = 'max-height 0.3s ease, opacity 0.2s ease';
        answer.style.maxHeight = '0px';
        answer.style.opacity = '0';
        
        // Usuń open po animacji
        answer.addEventListener('transitionend', function handler() {
            item.removeAttribute('open');
            answer.style.maxHeight = '';
            answer.style.opacity = '';
            answer.style.transition = '';
            answer.removeEventListener('transitionend', handler);
        });
    }
    
    closeAll() {
        this.items.forEach(item => {
            if (item.hasAttribute('open')) {
                const answer = item.querySelector('.faq-item__answer');
                this.close(item, answer);
            }
        });
    }
}


// ========================================
// PRICING CARDS – Hover interaction
// ========================================

class PricingCardsHover {
    constructor() {
        this.cards = [];
        this.init();
    }
    
    init() {
        this.cards = document.querySelectorAll('.pricing-card');
        
        if (this.cards.length === 0) return;
        
        // Sprawdź czy urządzenie obsługuje hover
        if (!window.matchMedia('(hover: hover)').matches) return;
        
        this.cards.forEach(card => {
            const link = card.querySelector('.pricing-card__link');
            if (!link) return;
            
            // Mouse move effect (subtelny parallax)
            link.addEventListener('mousemove', (e) => {
                this.handleMouseMove(e, card);
            });
            
            link.addEventListener('mouseleave', () => {
                this.handleMouseLeave(card);
            });
        });
    }
    
    handleMouseMove(e, card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const deltaX = (x - centerX) / centerX;
        const deltaY = (y - centerY) / centerY;
        
        // Subtelny efekt 3D
        const title = card.querySelector('.pricing-card__title');
        if (title) {
            title.style.transform = `translateX(${10 + deltaX * 3}px)`;
        }
    }
    
    handleMouseLeave(card) {
        const title = card.querySelector('.pricing-card__title');
        if (title) {
            title.style.transform = '';
        }
    }
}


// ========================================
// EXTRAS CARDS – Staggered reveal
// ========================================

class ExtrasCardsReveal {
    constructor() {
        this.container = null;
        this.cards = [];
        this.init();
    }
    
    init() {
        this.container = document.querySelector('.pricing-extras__grid');
        if (!this.container) return;
        
        this.cards = this.container.querySelectorAll('.extras-card');
        
        // Intersection Observer
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.revealCards();
                        observer.disconnect();
                    }
                });
            },
            { threshold: 0.2 }
        );
        
        observer.observe(this.container);
    }
    
    revealCards() {
        this.cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('is-visible');
            }, index * 150);
        });
    }
}


// ========================================
// SCROLL PROGRESS INDICATOR (opcjonalny)
// ========================================

class ScrollProgress {
    constructor() {
        this.progressBar = null;
        this.init();
    }
    
    init() {
        // Utwórz progress bar
        this.progressBar = document.createElement('div');
        this.progressBar.className = 'scroll-progress';
        document.body.appendChild(this.progressBar);
        
        // Aktualizuj na scroll
        window.addEventListener('scroll', () => {
            this.update();
        }, { passive: true });
    }
    
    update() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        
        this.progressBar.style.transform = `scaleX(${progress / 100})`;
    }
}


// ========================================
// INICJALIZACJA
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    
    // FAQ Accordion
    const faqAccordion = new FAQAccordion();
    
    // Pricing cards hover
    const pricingHover = new PricingCardsHover();
    
    // Extras cards reveal
    const extrasReveal = new ExtrasCardsReveal();
    
    // Scroll progress (opcjonalny – odkomentuj jeśli chcesz)
    // const scrollProgress = new ScrollProgress();
    
    console.log('💰 Pricing page initialized');
});