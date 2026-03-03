import type { ContactFormData, ContactFormResponse } from '@/types/contact';

export const sendContactForm = async (data: ContactFormData): Promise<ContactFormResponse> => {
  const endpoint = import.meta.env.PUBLIC_CONTACT_FORM_ENDPOINT;

  if (!endpoint) {
    return {
      success: false,
      message: 'Missing PUBLIC_CONTACT_FORM_ENDPOINT in environment variables.',
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      return {
        success: false,
        message: 'Failed to send message.',
      };
    }

    return {
      success: true,
      message: 'Message sent successfully.',
    };
  } catch (error) {
    console.error('Error sending contact form:', error);
    return { success: false, message: 'Network error. Please check your connection.' };
  }
};
