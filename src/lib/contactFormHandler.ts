import { sendContactForm } from '@/lib/contact';
import type { ContactFormData } from '@/types/contact';

export const initContactForm = () => {
    const form = document.querySelector('.contact-form') as HTMLFormElement;
    const statusMessage = document.getElementById('form-status') as HTMLParagraphElement;
    const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending...';
            }
            if (statusMessage) {
                statusMessage.textContent = '';
                statusMessage.className = 'form-status';
            }

            const formData = new FormData(form);
            const countryCode = formData.get('country-code') as string;
            const phoneNumber = formData.get('phone') as string;

            let fullPhone = '';
            if (phoneNumber) {
                // Remove spaces from phone number for normalization
                const cleanedPhone = phoneNumber.replace(/\s+/g, '');
                fullPhone = `${countryCode}${cleanedPhone}`;
            }

            const data: ContactFormData = {
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                subject: formData.get('subject') as string,
                message: formData.get('message') as string,
                phone: fullPhone,
                whatsapp: formData.get('whatsapp') === 'on',
            };

            const result = await sendContactForm(data);

            if (result.success) {
                if (statusMessage) {
                    statusMessage.textContent = result.message;
                    statusMessage.classList.add('success');
                }
                form.reset();
            } else {
                if (statusMessage) {
                    statusMessage.textContent = result.message;
                    statusMessage.classList.add('error');
                }
            }

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
            }
        });
    }
};
