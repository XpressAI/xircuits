import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Xircuits',
  tagline: 'Visual programming for Python',
  favicon: 'img/favicon.ico',

  future: { v4: true },

  url: 'https://xircuits.io',
  baseUrl: '/',

  onBrokenLinks: 'throw',

  i18n: { defaultLocale: 'en', locales: ['en'] },

  // Allow .xircuits JSON files to be imported
  plugins: [
    function xircuitsPlugin() {
      return {
        name: 'xircuits-json-loader',
        configureWebpack() {
          return {
            module: {
              rules: [
                {
                  test: /\.xircuits$/,
                  type: 'json',
                },
              ],
            },
          };
        },
      };
    },
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Xircuits',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Workflows',
          },
          {
            href: 'https://github.com/XpressAI/xircuits',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `Copyright © ${new Date().getFullYear()} XpressAI. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
