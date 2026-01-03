// ============================================
// TELEGRAM BOT CONFIGURATION
// ============================================
const TELEGRAM_CONFIG = {
    botToken: '7690861929:AAHOVWIaKk2a4fd7_6ybxNa8pOi6BJamrow',
    chatId: '-1001113795475',
    apiUrl: 'https://api.telegram.org/bot'
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Smooth scroll to form section
 */
function scrollToForm() {
    const form = document.getElementById('form');
    if (form) {
        form.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid
 */
function validatePhone(phone) {
    const cleanPhone = phone.replace(/\s/g, '');
    const phoneRegex = /^\+380\d{9}$/;
    return phoneRegex.test(cleanPhone);
}

/**
 * Format phone number as user types
 * @param {string} value - Raw phone input
 * @returns {string} - Formatted phone number
 */
function formatPhoneNumber(value) {
    let digits = value.replace(/\D/g, '');

    // Auto-add country code
    if (!digits.startsWith('380')) {
        if (digits.startsWith('0')) {
            digits = '380' + digits.slice(1);
        } else if (!digits.startsWith('380')) {
            digits = '380' + digits;
        }
    }

    // Format: +380 XX XXX XX XX
    let formatted = '+' + digits.slice(0, 3);
    if (digits.length > 3) formatted += ' ' + digits.slice(3, 5);
    if (digits.length > 5) formatted += ' ' + digits.slice(5, 8);
    if (digits.length > 8) formatted += ' ' + digits.slice(8, 10);
    if (digits.length > 10) formatted += ' ' + digits.slice(10, 12);

    return formatted;
}

/**
 * Send message to Telegram Bot
 * @param {string} name - User name
 * @param {string} phone - User phone
 * @returns {Promise} - Fetch promise
 */
async function sendToTelegram(name, phone) {
    const message = `🐺 *НОВА ЗАЯВКА З ЛЕНДІНГУ!*\n\n👤 *Ім'я:* ${name}\n📞 *Телефон:* ${phone}\n\n⏰ Час: ${new Date().toLocaleString('uk-UA')}`;

    const url = `${TELEGRAM_CONFIG.apiUrl}${TELEGRAM_CONFIG.botToken}/sendMessage`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: TELEGRAM_CONFIG.chatId,
            text: message,
            parse_mode: 'Markdown'
        })
    });

    if (!response.ok) {
        throw new Error(`Telegram API error: ${response.status}`);
    }

    return response.json();
}

// ============================================
// FORM HANDLING
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');

    // Store original button text
    const originalButtonText = submitButton.innerHTML;

    // Phone number auto-formatting
    phoneInput.addEventListener('input', function (e) {
        e.target.value = formatPhoneNumber(e.target.value);
    });

    // Form submission handler
    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Get form values
        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();

        // Validation
        if (!name) {
            alert('❌ Будь ласка, введи своє ім\'я');
            nameInput.focus();
            return;
        }

        if (!phone) {
            alert('❌ Будь ласка, введи номер телефону');
            phoneInput.focus();
            return;
        }

        if (!validatePhone(phone)) {
            alert('❌ Будь ласка, введи коректний номер телефону у форматі +380XXXXXXXXX');
            phoneInput.focus();
            return;
        }

        // UI: Loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '⏳ Відправка...';

        try {
            // Send to Telegram
            await sendToTelegram(name, phone);

            // Success: Hide form and show success message
            contactForm.style.display = 'none';
            successMessage.classList.add('show');

            // Optional: Track conversion
            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_submission', {
                    'event_category': 'Lead',
                    'event_label': 'Contact Form'
                });
            }

            console.log('✅ Form submitted successfully:', { name, phone });

        } catch (error) {
            // Error handling
            console.error('❌ Error sending to Telegram:', error);

            alert('⚠️ Виникла помилка при відправці заявки. Будь ласка, спробуй ще раз або зателефонуй нам напряму.');

            // Reset button state
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    });
});

// ============================================
// FAQ ACCORDION
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', () => {
            // Close other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle current item
            item.classList.toggle('active');
        });
    });
});

// ============================================
// SCROLL ANIMATIONS
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe sections for fade-in animation
    const sections = document.querySelectorAll('section:not(.hero)');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
});
