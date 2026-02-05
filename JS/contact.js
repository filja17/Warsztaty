/* ========================================
   CONTACT.JS
   Walidacja formularza i interakcje
   ======================================== */

'use strict';

// ========================================
// FORM VALIDATION
// ========================================

class ContactForm {
    constructor() {
        this.form = null;
        this.fields = {};
        this.submitButton = null;
        this.successMessage = null;
        this.resetButton = null;
        
        this.init();
    }
    
    init() {
        this.form = document.getElementById('contactForm');
        if (!this.form) return;
        
        // Pobierz elementy
        this.submitButton = this.form.querySelector('.form-submit');
        this.successMessage = document.getElementById('contactSuccess');
        this.resetButton = document.getElementById('resetForm');
        
        // Zdefiniuj pola do walidacji
        this.fields = {
            email: {
                element: this.form.querySelector('#email'),
                validators: [
                    { test: (v) => v.trim() !== '', message: 'Email jest wymagany' },
                    { test: (v) => this.isValidEmail(v), message: 'Podaj poprawny adres email' }
                ]
            },
            message: {
                element: this.form.querySelector('#message'),
                validators: [
                    { test: (v) => v.trim() !== '', message: 'Wiadomość jest wymagana' },
                    { test: (v) => v.trim().length >= 10, message: 'Wiadomość powinna mieć minimum 10 znaków' }
                ]
            }
        };
        
        // Bind events
        this.bindEvents();
    }
    
    bindEvents() {
        // Walidacja na blur
        Object.values(this.fields).forEach(field => {
            if (!field.element) return;
            
            field.element.addEventListener('blur', () => {
                this.validateField(field);
            });
            
            // Usuń błąd podczas pisania
            field.element.addEventListener('input', () => {
                this.clearFieldError(field);
            });
        });
        
        // Submit formularza
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
        
        // Reset formularza
        if (this.resetButton) {
            this.resetButton.addEventListener('click', () => {
                this.resetForm();
            });
        }
    }
    
    // ==============================
    // WALIDACJA
    // ==============================
    
    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    validateField(field) {
        const value = field.element.value;
        const parent = field.element.closest('.form-field');
        const errorElement = parent.querySelector('.form-field__error');
        
        // Sprawdź każdy validator
        for (const validator of field.validators) {
            if (!validator.test(value)) {
                // Błąd walidacji
                parent.classList.add('form-field--error');
                parent.classList.remove('form-field--valid');
                
                if (errorElement) {
                    errorElement.textContent = validator.message;
                }
                
                return false;
            }
        }
        
        // Pole poprawne
        parent.classList.remove('form-field--error');
        parent.classList.add('form-field--valid');
        
        if (errorElement) {
            errorElement.textContent = '';
        }
        
        return true;
    }
    
    clearFieldError(field) {
        const parent = field.element.closest('.form-field');
        const errorElement = parent.querySelector('.form-field__error');
        
        parent.classList.remove('form-field--error');
        
        if (errorElement) {
            errorElement.textContent = '';
        }
    }
    
    validateAllFields() {
        let isValid = true;
        
        Object.values(this.fields).forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    // ==============================
    // SUBMIT
    // ==============================
    
    async handleSubmit() {
        // Waliduj wszystkie pola
        if (!this.validateAllFields()) {
            // Focus na pierwszym błędnym polu
            const firstError = this.form.querySelector('.form-field--error input, .form-field--error textarea');
            if (firstError) {
                firstError.focus();
            }
            return;
        }
        
        // Pokaż loading state
        this.setLoadingState(true);
        
        // Zbierz dane
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());
        
        try {
            // Symulacja wysyłki (zastąp prawdziwym API)
            await this.simulateSubmit(data);
            
            // Sukces
            this.showSuccess();
            
        } catch (error) {
            // Błąd
            console.error('Form submission error:', error);
            this.showError('Wystąpił błąd. Spróbuj ponownie później.');
            
        } finally {
            this.setLoadingState(false);
        }
    }
    
    simulateSubmit(data) {
        // Symulacja opóźnienia API
        return new Promise((resolve, reject) => {
            console.log('Form data:', data);
            
            setTimeout(() => {
                // Symulacja sukcesu (90% szans) lub błędu (10%)
                if (Math.random() > 0.1) {
                    resolve({ success: true });
                } else {
                    reject(new Error('Network error'));
                }
            }, 1500);
        });
    }
    
    setLoadingState(isLoading) {
        if (this.submitButton) {
            this.submitButton.classList.toggle('is-loading', isLoading);
            this.submitButton.disabled = isLoading;
        }
    }
    
    // ==============================
    // SUCCESS / ERROR
    // ==============================
    
    showSuccess() {
        // Ukryj formularz
        this.form.style.display = 'none';
        
        // Pokaż sukces
        if (this.successMessage) {
            this.successMessage.hidden = false;
            
            // Trigger animacji
            requestAnimationFrame(() => {
                this.successMessage.classList.add('is-visible');
            });
        }
    }
    
    showError(message) {
        // Utwórz element błędu
        const errorBanner = document.createElement('div');
        errorBanner.className = 'form-error-banner';
        errorBanner.innerHTML = `
            <p>${message}</p>
            <button type="button" class="form-error-banner__close" aria-label="Zamknij">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
        `;
        
        // Dodaj przed formularzem
        this.form.parentNode.insertBefore(errorBanner, this.form);
        
        // Animuj wejście
        requestAnimationFrame(() => {
            errorBanner.classList.add('is-visible');
        });
        
        // Zamknij po kliknięciu
        errorBanner.querySelector('.form-error-banner__close').addEventListener('click', () => {
            errorBanner.classList.remove('is-visible');
            setTimeout(() => errorBanner.remove(), 300);
        });
        
        // Auto-ukryj po 5s
        setTimeout(() => {
            if (errorBanner.parentNode) {
                errorBanner.classList.remove('is-visible');
                setTimeout(() => errorBanner.remove(), 300);
            }
        }, 5000);
    }
    
    // ==============================
    // RESET
    // ==============================
    
    resetForm() {
        // Ukryj sukces
        if (this.successMessage) {
            this.successMessage.classList.remove('is-visible');
            
            setTimeout(() => {
                this.successMessage.hidden = true;
                
                // Pokaż formularz
                this.form.style.display = '';
                
                // Reset formularza
                this.form.reset();
                
                // Usuń stany walidacji
                this.form.querySelectorAll('.form-field').forEach(field => {
                    field.classList.remove('form-field--error', 'form-field--valid');
                });
                
                // Focus na pierwszym polu
                const firstInput = this.form.querySelector('input, textarea');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 300);
        }
    }
}


// ========================================
// INPUT LABEL ANIMATION
// (opcjonalne – label przesuwa się w górę)
// ========================================

class FloatingLabels {
    constructor() {
        this.init();
    }
    
    init() {
        const fields = document.querySelectorAll('.form-field__input, .form-field__textarea');
        
        fields.forEach(field => {
            // Sprawdź czy pole ma wartość na starcie
            this.checkValue(field);
            
            // Aktualizuj przy zmianie
            field.addEventListener('input', () => this.checkValue(field));
            field.addEventListener('blur', () => this.checkValue(field));
        });
    }
    
    checkValue(field) {
        const parent = field.closest('.form-field');
        
        if (field.value.trim() !== '') {
            parent.classList.add('has-value');
        } else {
            parent.classList.remove('has-value');
        }
    }
}


// ========================================
// AUTORESIZE TEXTAREA
// ========================================

class AutoResizeTextarea {
    constructor() {
        this.init();
    }
    
    init() {
        const textareas = document.querySelectorAll('.form-field__textarea');
        
        textareas.forEach(textarea => {
            // Ustaw początkową wysokość
            this.resize(textarea);
            
            // Resize przy pisaniu
            textarea.addEventListener('input', () => this.resize(textarea));
        });
    }
    
    resize(textarea) {
        // Reset height
        textarea.style.height = 'auto';
        
        // Ustaw na scrollHeight
        const minHeight = 150; // min-height z CSS
        const newHeight = Math.max(textarea.scrollHeight, minHeight);
        
        textarea.style.height = newHeight + 'px';
    }
}


// ========================================
// URL PARAMETER HANDLING
// (wypełnienie pola subject z URL)
// ========================================

class URLParameterHandler {
    constructor() {
        this.init();
    }
    
    init() {
        const params = new URLSearchParams(window.location.search);
        const workshop = params.get('workshop');
        
        if (workshop) {
            // Ustaw temat na "Rezerwacja warsztatu"
            const subjectSelect = document.getElementById('subject');
            if (subjectSelect) {
                subjectSelect.value = 'rezerwacja';
            }
            
            // Dodaj informację do wiadomości
            const messageField = document.getElementById('message');
            if (messageField && !messageField.value) {
                const workshopName = this.formatWorkshopName(workshop);
                messageField.value = `Chciałbym/Chciałabym zarezerwować miejsce na warsztat: ${workshopName}\n\n`;
                messageField.focus();
            }
        }
    }
    
    formatWorkshopName(slug) {
        // Zamień slug na czytelną nazwę
        const names = {
            'ceramika': 'Ceramika',
            'fotografia': 'Fotografia',
            'malarstwo': 'Malarstwo',
            'tkactwo': 'Tkactwo',
            'kaligrafia': 'Kaligrafia',
            'introligatorstwo': 'Introligatorstwo'
        };
        
        return names[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);
    }
}


// ========================================
// INICJALIZACJA
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    
    // Formularz kontaktowy
    const contactForm = new ContactForm();
    
    // Floating labels (opcjonalne)
    // const floatingLabels = new FloatingLabels();
    
    // Auto-resize textarea
    const autoResize = new AutoResizeTextarea();
    
    // URL parameters
    const urlParams = new URLParameterHandler();
    
    console.log('📧 Contact page initialized');
});