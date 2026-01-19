export const prerender = false;

import type { APIRoute } from 'astro';
import client from 'prom-client';

type MetricsState = {
  registry?: client.Registry;
  counter?: client.Counter<string>;
  initialized?: boolean;
};

const metricsState = globalThis as typeof globalThis & MetricsState;

const getRegistry = () => {
  if (!metricsState.registry) {
    metricsState.registry = new client.Registry();
  }

  if (!metricsState.initialized) {
    client.collectDefaultMetrics({ register: metricsState.registry });
    metricsState.counter = new client.Counter({
      name: 'http_requests_total',
      help: 'Total number of requests served by the API metrics endpoint.',
      labelNames: ['route', 'method'],
      registers: [metricsState.registry],
    });
    metricsState.initialized = true;
  }

  return metricsState.registry;
};

export const GET: APIRoute = async () => {
  const registry = getRegistry();
  metricsState.counter?.inc({ route: '/api/metrics', method: 'GET' });

  const body = await registry.metrics();

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': registry.contentType,
    },
  });
};
