export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  whatsapp: boolean;
}

export interface ContactFormResponse {
  success: boolean;
  message: string;
}
