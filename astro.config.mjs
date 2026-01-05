// @ts-check
import {
    defineConfig,
    envField
} from "astro/config";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
    output: "server",
    adapter: node({
        mode: "standalone",
    }),
    site: "https://www.sierrapablo.dev",
    env: {
        schema: {
            CONTACT_FORM_ENDPOINT: envField.string({
                context: 'server',
                access: 'secret'
            }),
        },
    },
});