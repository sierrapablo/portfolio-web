// @ts-check
import {
    defineConfig
} from "astro/config";
// import { portfolioTheme } from "./theme.mjs";

// https://astro.build/config
export default defineConfig({
    output: "static",
    site: "https://www.sierrapablo.dev",
    // trailingSlash: "always",
    /**
    markdown: {
      shikiConfig: {
        theme: portfolioTheme,
      },
    },
    */
});