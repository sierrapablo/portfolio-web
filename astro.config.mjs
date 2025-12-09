// @ts-check
import { defineConfig, envField } from "astro/config";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  site: "https://www.sierrapablo.dev",
  env: {
    schema: {
      VALKEY_HOST: envField.string({ context: "server", access: "secret" }),
      VALKEY_PORT: envField.number({ context: "server", access: "secret" }),
      VALKEY_PASSWORD: envField.string({ context: "server", access: "secret" }),
    },
  },
});
