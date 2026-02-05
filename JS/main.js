/* ========================================
   MAIN.JS
   Efekty scroll, animacje, intersection observer
   ======================================== */

'use strict';

// ========================================
// KONFIGURACJA GLOBALNA
// ========================================

const CONFIG = {
    // Scroll reveal
    revealThreshold: 0.15,
    revealRootMargin: '0px 0px -50px 0px',
    
    // Parallax
    parallaxStrength: 0.3,
    
    // Blur effect
    blurMax: 8,
    blurStart: 0.7, // Kiedy zaczyna się blur (0.7 = 70% widoczności)
    
    // Animacje
    staggerDelay: 100, // ms między elementami
};


// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Debounce – ogranicza częstotliwość wywołań funkcji
 */
function debounce(func, wait = 10) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle – wywołuje funkcję max raz na X ms
 */
function throttle(func, limit = 16) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Mapowanie wartości z jednego zakresu na drugi
 */
function mapRange(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Clamp – ogranicza wartość do zakresu
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}


// ========================================
// SCROLL REVEAL – Animacje przy wejściu w viewport
// ========================================

class ScrollReveal {
    constructor() {
        this.elements = [];
        this.observer = null;
        this.init();
    }
    
    init() {
        // Znajdź wszystkie elementy do animacji
        this.elements = document.querySelectorAll('[data-reveal]');
        
        if (this.elements.length === 0) return;
        
        // Utwórz Intersection Observer
        this.observer = new IntersectionObserver(
            this.handleIntersection.bind(this),
            {
                threshold: CONFIG.revealThreshold,
                rootMargin: CONFIG.revealRootMargin
            }
        );
        
        // Obserwuj elementy
        this.elements.forEach((el, index) => {
            // Dodaj początkowy stan
            el.classList.add('reveal-hidden');
            
            // Ustaw delay dla staggered animations
            if (el.dataset.revealDelay) {
                el.style.transitionDelay = `${el.dataset.revealDelay}ms`;
            } else if (el.closest('[data-reveal-stagger]')) {
                const siblings = [...el.parentElement.children];
                const idx = siblings.indexOf(el);
                el.style.transitionDelay = `${idx * CONFIG.staggerDelay}ms`;
            }
            
            this.observer.observe(el);
        });
    }
    
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Element wszedł w viewport
                entry.target.classList.add('reveal-visible');
                entry.target.classList.remove('reveal-hidden');
                
                // Przestań obserwować (animacja tylko raz)
                if (!entry.target.dataset.revealRepeat) {
                    this.observer.unobserve(entry.target);
                }
            } else if (entry.target.dataset.revealRepeat) {
                // Powtarzanie animacji przy wyjściu
                entry.target.classList.remove('reveal-visible');
                entry.target.classList.add('reveal-hidden');
            }
        });
    }
    
    // Metoda do ręcznego dodania elementu
    observe(element) {
        element.classList.add('reveal-hidden');
        this.observer.observe(element);
    }
    
    // Cleanup
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}


// ========================================
// WORKSHOP CARDS – Zaawansowane efekty scroll
// ========================================

class WorkshopCardsEffect {
    constructor() {
        this.cards = [];
        this.isEnabled = true;
        this.init();
    }
    
    init() {
        this.cards = document.querySelectorAll('.workshop-card');
        
        if (this.cards.length === 0) return;
        
        // Sprawdź prefers-reduced-motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.isEnabled = false;
            return;
        }
        
        // Intersection Observer dla efektów
        this.observer = new IntersectionObserver(
            this.handleIntersection.bind(this),
            {
                threshold: this.generateThresholds(20),
                rootMargin: '0px'
            }
        );
        
        this.cards.forEach(card => {
            this.observer.observe(card);
        });
        
        // Parallax na scroll
        this.bindScrollEvents();
    }
    
    // Generuje tablicę progów dla płynnych animacji
    generateThresholds(steps) {
        return Array.from({ length: steps + 1 }, (_, i) => i / steps);
    }
    
    handleIntersection(entries) {
        entries.forEach(entry => {
            const card = entry.target;
            const ratio = entry.intersectionRatio;
            
            // Efekt fade-in/out
            this.applyFadeEffect(card, ratio);
            
            // Efekt blur przy wychodzeniu z viewport
            this.applyBlurEffect(card, ratio);
        });
    }
    
    applyFadeEffect(card, ratio) {
        const content = card.querySelector('.workshop-card__content');
        if (!content) return;
        
        // Opacity zależna od widoczności
        const opacity = clamp(mapRange(ratio, 0.1, 0.5, 0, 1), 0, 1);
        
        // Nie nadpisuj hover state
        if (!card.matches(':hover')) {
            // card.style.opacity = 0.3 + (opacity * 0.7);
        }
    }
    
    applyBlurEffect(card, ratio) {
        const image = card.querySelector('.workshop-card__image');
        if (!image) return;
        
        // Blur gdy element wychodzi z viewport
        if (ratio < CONFIG.blurStart) {
            const blurAmount = mapRange(ratio, 0, CONFIG.blurStart, CONFIG.blurMax, 0);
            image.style.filter = `blur(${clamp(blurAmount, 0, CONFIG.blurMax)}px)`;
        } else {
            image.style.filter = 'blur(0px)';
        }
    }
    
    bindScrollEvents() {
        // Parallax effect na zdjęciach
        window.addEventListener('scroll', throttle(() => {
            if (!this.isEnabled) return;
            
            this.cards.forEach(card => {
                this.applyParallax(card);
            });
        }, 16));
    }
    
    applyParallax(card) {
        const image = card.querySelector('.workshop-card__image');
        if (!image) return;
        
        const rect = card.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Sprawdź czy element jest w viewport
        if (rect.top > windowHeight || rect.bottom < 0) return;
        
        // Oblicz pozycję względem środka ekranu
        const cardCenter = rect.top + rect.height / 2;
        const screenCenter = windowHeight / 2;
        const distance = cardCenter - screenCenter;
        
        // Parallax offset
        const parallaxOffset = distance * CONFIG.parallaxStrength * -0.1;
        
        image.style.transform = `scale(1.1) translateY(${parallaxOffset}px)`;
    }
    
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}


// ========================================
// HERO PARALLAX
// ========================================

class HeroParallax {
    constructor() {
        this.hero = null;
        this.content = null;
        this.scrollIndicator = null;
        this.init();
    }
    
    init() {
        this.hero = document.querySelector('.hero');
        if (!this.hero) return;
        
        this.content = this.hero.querySelector('.hero__content');
        this.scrollIndicator = this.hero.querySelector('.hero__scroll-indicator');
        
        // Sprawdź prefers-reduced-motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        
        window.addEventListener('scroll', throttle(() => {
            this.update();
        }, 16));
    }
    
    update() {
        const scrollY = window.scrollY;
        const heroHeight = this.hero.offsetHeight;
        
        // Tylko animuj gdy hero jest widoczny
        if (scrollY > heroHeight) return;
        
        const progress = scrollY / heroHeight;
        
        // Content – parallax + fade out
        if (this.content) {
            const translateY = scrollY * 0.4;
            const opacity = 1 - progress * 1.5;
            
            this.content.style.transform = `translateY(${translateY}px)`;
            this.content.style.opacity = clamp(opacity, 0, 1);
        }
        
        // Scroll indicator – fade out szybciej
        if (this.scrollIndicator) {
            const opacity = 1 - progress * 3;
            this.scrollIndicator.style.opacity = clamp(opacity, 0, 1);
        }
    }
}


// ========================================
// SMOOTH SCROLL DO SEKCJI
// ========================================

class SmoothScroll {
    constructor() {
        this.init();
    }
    
    init() {
        // Znajdź wszystkie linki z hash
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Pomiń puste hash
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (!target) return;
                
                e.preventDefault();
                this.scrollTo(target);
            });
        });
    }
    
    scrollTo(target, offset = 0) {
        const navHeight = document.querySelector('.nav')?.offsetHeight || 0;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = targetPosition - navHeight - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}


// ========================================
// CURSOR CUSTOM (opcjonalny efekt luxury)
// ========================================

class CustomCursor {
    constructor() {
        this.cursor = null;
        this.cursorDot = null;
        this.isEnabled = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.cursorX = 0;
        this.cursorY = 0;
        
        // Włącz tylko na desktop
        if (window.matchMedia('(pointer: fine)').matches) {
            this.init();
        }
    }
    
    init() {
        // Utwórz elementy kursora
        this.cursor = document.createElement('div');
        this.cursor.className = 'custom-cursor';
        
        this.cursorDot = document.createElement('div');
        this.cursorDot.className = 'custom-cursor__dot';
        
        document.body.appendChild(this.cursor);
        document.body.appendChild(this.cursorDot);
        
        this.isEnabled = true;
        
        // Event listeners
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        // Hover states
        const interactiveElements = document.querySelectorAll('a, button, .workshop-card__link');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => this.cursor.classList.add('is-hovering'));
            el.addEventListener('mouseleave', () => this.cursor.classList.remove('is-hovering'));
        });
        
        // Start animation loop
        this.animate();
        
        // Pokaż po chwili
        setTimeout(() => {
            this.cursor.classList.add('is-visible');
            this.cursorDot.classList.add('is-visible');
        }, 100);
    }
    
    animate() {
        if (!this.isEnabled) return;
        
        // Smooth follow (lerp)
        const ease = 0.15;
        this.cursorX += (this.mouseX - this.cursorX) * ease;
        this.cursorY += (this.mouseY - this.cursorY) * ease;
        
        // Aplikuj pozycję
        this.cursor.style.transform = `translate(${this.cursorX}px, ${this.cursorY}px)`;
        this.cursorDot.style.transform = `translate(${this.mouseX}px, ${this.mouseY}px)`;
        
        requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        this.isEnabled = false;
        this.cursor?.remove();
        this.cursorDot?.remove();
    }
}


// ========================================
// PAGE LOADER / TRANSITION
// ========================================

class PageLoader {
    constructor() {
        this.loader = null;
        this.init();
    }
    
    init() {
        // Utwórz loader overlay
        this.loader = document.createElement('div');
        this.loader.className = 'page-loader';
        this.loader.innerHTML = `
            <div class="page-loader__content">
                <div class="page-loader__line"></div>
            </div>
        `;
        document.body.appendChild(this.loader);
        
        // Ukryj po załadowaniu strony
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.hide();
            }, 300);
        });
        
        // Obsłuż przejścia między stronami
        this.bindPageTransitions();
    }
    
    bindPageTransitions() {
        const internalLinks = document.querySelectorAll('a[href]:not([href^="#"]):not([href^="mailto"]):not([href^="tel"]):not([target="_blank"])');
        
        internalLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Sprawdź czy to link wewnętrzny
                if (href.startsWith('http') && !href.includes(window.location.hostname)) {
                    return; // Link zewnętrzny – nie blokuj
                }
                
                e.preventDefault();
                this.show();
                
                setTimeout(() => {
                    window.location.href = href;
                }, 600);
            });
        });
    }
    
    show() {
        this.loader.classList.add('is-visible');
        document.body.classList.add('is-transitioning');
    }
    
    hide() {
        this.loader.classList.add('is-loaded');
        document.body.classList.add('is-loaded');
        
        setTimeout(() => {
            this.loader.classList.remove('is-visible', 'is-loaded');
            document.body.classList.remove('is-transitioning');
        }, 800);
    }
}


// ========================================
// NAVBAR SCROLL BEHAVIOR
// ========================================

class NavbarScroll {
    constructor() {
        this.nav = null;
        this.lastScrollY = 0;
        this.isHidden = false;
        this.scrollThreshold = 100;
        this.init();
    }
    
    init() {
        this.nav = document.querySelector('.nav');
        if (!this.nav) return;
        
        window.addEventListener('scroll', throttle(() => {
            this.update();
        }, 100));
    }
    
    update() {
        const currentScrollY = window.scrollY;
        
        // Dodaj klasę gdy strona jest przewinięta
        if (currentScrollY > 50) {
            this.nav.classList.add('nav--scrolled');
        } else {
            this.nav.classList.remove('nav--scrolled');
        }
        
        // Ukryj/pokaż przy scrollowaniu (opcjonalne)
        // if (currentScrollY > this.scrollThreshold) {
        //     if (currentScrollY > this.lastScrollY && !this.isHidden) {
        //         this.nav.classList.add('nav--hidden');
        //         this.isHidden = true;
        //     } else if (currentScrollY < this.lastScrollY && this.isHidden) {
        //         this.nav.classList.remove('nav--hidden');
        //         this.isHidden = false;
        //     }
        // }
        
        this.lastScrollY = currentScrollY;
    }
}


// ========================================
// INICJALIZACJA
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎨 Initializing workshop website...');
    
    // Core features
    const scrollReveal = new ScrollReveal();
    const workshopCards = new WorkshopCardsEffect();
    const heroParallax = new HeroParallax();
    const smoothScroll = new SmoothScroll();
    const navbarScroll = new NavbarScroll();
    const pageLoader = new PageLoader();
    
    // Image loading (dla podstrony warsztatu)
    const imageLoader = new ImageLoader();
    
    // ...rest of code
    // Optional: Custom cursor (można wyłączyć)
    // const customCursor = new CustomCursor();
    
    // Expose to window for debugging
    window.workshopApp = {
        scrollReveal,
        workshopCards,
        heroParallax,
        pageLoader
    };
    
    console.log('✅ All modules initialized');
});


// ========================================
// PRELOAD KRYTYCZNYCH ZASOBÓW
// ========================================

// Preload pierwszego zdjęcia warsztatu
(function preloadFirstImage() {
    const firstCard = document.querySelector('.workshop-card__image');
    if (firstCard && firstCard.dataset.src) {
        const img = new Image();
        img.src = firstCard.dataset.src;
    }
})();
/* ========================================
   IMAGE LAZY LOADING Z FADE-IN
   ======================================== */

class ImageLoader {
    constructor() {
        this.images = [];
        this.init();
    }
    
    init() {
        // Znajdź wszystkie obrazy w gallery
        this.images = document.querySelectorAll('.gallery-figure img, .workshop-hero__image');
        
        if (this.images.length === 0) return;
        
        // Intersection Observer dla lazy loading
        this.observer = new IntersectionObserver(
            this.handleIntersection.bind(this),
            {
                rootMargin: '100px 0px',
                threshold: 0.01
            }
        );
        
        this.images.forEach(img => {
            // Jeśli obrazek już załadowany (cached)
            if (img.complete && img.naturalHeight !== 0) {
                img.classList.add('is-loaded');
            } else {
                // Obserwuj obrazek
                this.observer.observe(img);
                
                // Listener na załadowanie
                img.addEventListener('load', () => {
                    img.classList.add('is-loaded');
                });
                
                // Error handling
                img.addEventListener('error', () => {
                    img.classList.add('is-error');
                    console.warn('Failed to load image:', img.src);
                });
            }
        });
    }
    
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                // Jeśli ma data-src, użyj go (true lazy loading)
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
                
                // Przestań obserwować
                this.observer.unobserve(img);
            }
        });
    }
}


// Dodaj do inicjalizacji (w DOMContentLoaded):
// const imageLoader = new ImageLoader();
class FloatingWordsBlur {
    constructor() {
        this.words = [];
        this.section = null;
        this.init();
    }
    
    init() {
        this.section = document.querySelector('.about-gallery');
        this.words = document.querySelectorAll('.floating-word');
        
        if (!this.section || this.words.length === 0) return;
        
        // Nasłuchuj scroll
        window.addEventListener('scroll', () => {
            this.update();
        }, { passive: true });
        
        // Początkowa aktualizacja
        this.update();
    }
    
    update() {
        const sectionRect = this.section.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Sprawdź czy sekcja jest w viewport
        if (sectionRect.top > windowHeight || sectionRect.bottom < 0) {
            // Poza viewport – wszystko rozmazane
            this.words.forEach(word => word.classList.remove('is-visible'));
            return;
        }
        
        this.words.forEach(word => {
            const wordRect = word.getBoundingClientRect();
            const wordCenter = wordRect.top + wordRect.height / 2;
            
            // "Strefa ostrości" – środek ekranu ± 200px
            const focusZoneTop = windowHeight * 0.3;
            const focusZoneBottom = windowHeight * 0.7;
            
            if (wordCenter > focusZoneTop && wordCenter < focusZoneBottom) {
                word.classList.add('is-visible');
            } else {
                word.classList.remove('is-visible');
            }
        });
    }
}

// Dodaj do inicjalizacji:
document.addEventListener('DOMContentLoaded', () => {
    // ... istniejący kod ...
    
    // Floating words blur effect
    const floatingWords = new FloatingWordsBlur();
});