export default {
  base: "/use/",
  title: "@revfanc/use",
  description: "Vue 3 Composables",
  cleanUrls: true,
  head: [["link", { rel: "icon", href: "/use/favicon.svg" }]],
  themeConfig: {
    nav: [
      { text: "API", link: "/composables/" },
      { text: "GitHub", link: "https://github.com/revfanc/use" },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "guide",
          items: [{ text: "getting started", link: "/guide/getting-started" }],
        },
      ],
      "/composables/": [
        {
          text: "API",
          items: [{ text: "functional dialog", link: "/composables/dialog" }],
        },
      ],
    },
    footer: {
      message: "Released under the MIT License.",
      copyright:
        'Copyright © 2024-present <a href="https://github.com/revfanc" target="_blank">revfanc</a>',
    },
  },
};
