export default {
  base: "/use/",
  title: "@revfanc/use",
  description: "Vue 3 Composables",
  cleanUrls: true,
  head: [["link", { rel: "icon", href: "/use/favicon.svg" }]],
  themeConfig: {
    nav: [
      { text: "guide", link: "/guide/" },
      { text: "composables", link: "/composables/" },
      { text: "GitHub", link: "https://github.com/revfanc/use" },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "guide",
          items: [
            { text: "使用指南", link: "/guide/" },
            { text: "快速开始", link: "/guide/getting-started" },
          ],
        },
      ],
      "/composables/": [
        {
          text: "composables",
          items: [
            { text: "intro", link: "/composables/" },
            { text: "useDialog", link: "/composables/dialog" },
          ],
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
