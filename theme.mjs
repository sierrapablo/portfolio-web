/**
 * @type {{ name: string; type: "dark" | "light"; colors: Record<string, string>; settings: Array<{ settings: { foreground?: string; background?: string } }>; tokenColors: Array<{ scope: string[]; settings: Record<string, string> }> }}
 */
export const portfolioTheme = {
  name: "portfolio-green",
  type: /** @type {"dark"} */ ("dark"),
  colors: {
    "editor.background": "#151F17",
    "editor.foreground": "#D4E5D6",
  },
  settings: [
    {
      settings: {
        foreground: "#D4E5D6",
        background: "#151F17",
      },
    },
  ],
  tokenColors: [
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: {
        foreground: "#9BAC9D",
        fontStyle: "italic",
      },
    },
    {
      scope: ["keyword", "storage.type", "storage.modifier"],
      settings: {
        foreground: "#E0F5E3", // accent-light (más claro)
      },
    },
    {
      scope: ["entity.name.function", "support.function"],
      settings: {
        foreground: "#B5D9BE", // muted-teal-light (más claro)
      },
    },
    {
      scope: ["string", "string.quoted"],
      settings: {
        foreground: "#E0F5E3", // celadon-light (más claro)
      },
    },
    {
      scope: ["constant.numeric", "constant.language"],
      settings: {
        foreground: "#A1CCA5", // muted-teal-dark (más claro)
      },
    },
    {
      scope: ["variable", "support.variable"],
      settings: {
        foreground: "#C5E5C8", // celadon (más claro)
      },
    },
    {
      scope: ["entity.name.type", "entity.name.class"],
      settings: {
        foreground: "#B5D9BE", // muted-teal-light (más claro)
      },
    },
    {
      scope: ["keyword.operator", "punctuation"],
      settings: {
        foreground: "#A1CCA5", // muted-teal-dark (más claro)
      },
    },
    {
      scope: ["entity.name.tag"],
      settings: {
        foreground: "#E0F5E3", // accent-light (más claro)
      },
    },
    {
      scope: ["entity.other.attribute-name"],
      settings: {
        foreground: "#C5E5C8", // celadon (más claro)
      },
    },
    {
      scope: ["support.type.property-name"],
      settings: {
        foreground: "#B5D9BE", // muted-teal-light (más claro)
      },
    },
  ],
};
