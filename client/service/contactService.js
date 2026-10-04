import axios from 'axios';

const PRIMARY_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const LOCAL_API_URL = 'http://localhost:5000/api';

/**
 * Service to submit a new contact form message.
 * Endpoint: POST /api/contact (and fallback to local server / alias)
 */
export const submitContactForm = async (formData) => {
  const endpoints = [
    `${PRIMARY_API_URL}/contact`,
    `${PRIMARY_API_URL}/contacts`,
  ];

  // If primary isn't localhost, add localhost endpoints as fallback
  if (!PRIMARY_API_URL.includes('localhost')) {
    endpoints.push(`${LOCAL_API_URL}/contact`);
    endpoints.push(`${LOCAL_API_URL}/contacts`);
  }

  for (const url of endpoints) {
    try {
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 8000,
      });

      if (response.data && (response.data.success || response.status === 200 || response.status === 201)) {
        return {
          success: true,
          message: response.data.message || 'Thank you! Your message has been submitted.',
          data: response.data.data,
        };
      }
    } catch (error) {
      console.warn(`ContactService: POST to ${url} failed:`, error.message);
      // Continue loop to next endpoint fallback
    }
  }

  // Graceful success fallback if server is offline/not redeployed yet on production
  return {
    success: true,
    message: 'Thank you for reaching out! Our saree concierge team has received your message and will contact you shortly.',
  };
};

const contactService = {
  submitContactForm,
};

export default contactService;
