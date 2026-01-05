import type { ContactFormData, ContactFormResponse } from '@/types/contact';

export const sendContactForm = async (data: ContactFormData): Promise<ContactFormResponse> => {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending contact form:', error);
    return { success: false, message: 'Network error. Please check your connection.' };
  }
};
