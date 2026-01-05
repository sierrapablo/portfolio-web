export const prerender = false;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const endpoint = import.meta.env.CONTACT_FORM_ENDPOINT;

  if (!endpoint) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Server configuration error: Endpoint missing',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  try {
    const data = await request.json();

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Message sent successfully',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    } else {
      console.error('Webhook error:', response.statusText);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Failed to forward message.',
        }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  } catch (error) {
    console.error('API Route Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal server error.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
};
