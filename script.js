const PHONE_PATTERN = /^380\d{9}$/;

function normalizePhone(value) {
    return value.replace(/\D/g, '');
}

function validatePhone(value) {
    return PHONE_PATTERN.test(normalizePhone(value));
}

function formatPhoneNumber(value) {
    let digits = normalizePhone(value);

    if (!digits) return '';

    if (digits.startsWith('0')) {
        digits = `38${digits}`;
    } else if (!digits.startsWith('380')) {
        digits = `380${digits}`;
    }

    digits = digits.slice(0, 12);

    const parts = [
        digits.slice(0, 3),
        digits.slice(3, 5),
        digits.slice(5, 8),
        digits.slice(8, 10),
        digits.slice(10, 12)
    ].filter(Boolean);

    return `+${parts.join(' ')}`;
}

function setFieldError(input, errorElement, message) {
    input.classList.toggle('is-invalid', Boolean(message));
    input.setAttribute('aria-invalid', String(Boolean(message)));
    errorElement.textContent = message;
}

document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('header');
    const contactForm = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');
    const formStatus = document.getElementById('formStatus');
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const nameError = document.getElementById('nameError');
    const phoneError = document.getElementById('phoneError');
    const submitButton = contactForm?.querySelector('button[type="submit"]');
    const submitLabel = submitButton?.querySelector('span');

    const updateHeader = () => {
        header?.classList.toggle('is-scrolled', window.scrollY > 24);
    };

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    const revealElements = document.querySelectorAll('.reveal');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const heroVideo = document.querySelector('.hero-video');
    const heroVideoSource = heroVideo?.querySelector('source[data-src]');

    if (!reduceMotion && heroVideo && heroVideoSource) {
        heroVideoSource.src = heroVideoSource.dataset.src;
        heroVideo.load();
        heroVideo.play().catch(() => {
            // The poster remains visible if the browser blocks autoplay.
        });
    } else {
        heroVideo?.removeAttribute('autoplay');
        heroVideo?.pause();
    }

    if (reduceMotion || !('IntersectionObserver' in window)) {
        revealElements.forEach((element) => element.classList.add('is-visible'));
    } else {
        const observer = new IntersectionObserver((entries, currentObserver) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    currentObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -8% 0px'
        });

        revealElements.forEach((element) => observer.observe(element));
    }

    const faqItems = [...document.querySelectorAll('.faq-item')];
    faqItems.forEach((item) => {
        item.addEventListener('toggle', () => {
            if (!item.open) return;

            faqItems.forEach((otherItem) => {
                if (otherItem !== item) otherItem.removeAttribute('open');
            });
        });
    });

    if (!contactForm || !submitButton || !submitLabel || !nameInput || !phoneInput) return;

    phoneInput.addEventListener('input', (event) => {
        event.target.value = formatPhoneNumber(event.target.value);
        setFieldError(phoneInput, phoneError, '');
        formStatus.textContent = '';
        formStatus.classList.remove('is-error');
    });

    nameInput.addEventListener('input', () => {
        setFieldError(nameInput, nameError, '');
        formStatus.textContent = '';
        formStatus.classList.remove('is-error');
    });

    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        let firstInvalidField = null;

        setFieldError(nameInput, nameError, '');
        setFieldError(phoneInput, phoneError, '');
        formStatus.textContent = '';
        formStatus.classList.remove('is-error');

        if (name.length < 2) {
            setFieldError(nameInput, nameError, 'Введи ім’я — щонайменше 2 символи.');
            firstInvalidField = nameInput;
        }

        if (!validatePhone(phone)) {
            setFieldError(phoneInput, phoneError, 'Перевір номер: потрібно 9 цифр після +380.');
            firstInvalidField ??= phoneInput;
        }

        if (firstInvalidField) {
            firstInvalidField.focus();
            return;
        }

        submitButton.disabled = true;
        submitLabel.textContent = 'Відправляємо…';

        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, phone })
            });

            let result = {};
            try {
                result = await response.json();
            } catch {
                result = {};
            }

            if (!response.ok) {
                throw new Error(result.message || 'Не вдалося відправити заявку');
            }

            contactForm.reset();
            contactForm.hidden = true;
            successMessage.classList.add('show');
            successMessage.focus?.();

            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_submission', {
                    event_category: 'Lead',
                    event_label: 'Contact Form'
                });
            }
        } catch (error) {
            console.error('Помилка надсилання форми:', error);
            formStatus.textContent = 'Не вдалося відправити заявку. Спробуй ще раз або зателефонуй нам.';
            formStatus.classList.add('is-error');
        } finally {
            submitButton.disabled = false;
            submitLabel.textContent = 'Записатися на тренування';
        }
    });
});
