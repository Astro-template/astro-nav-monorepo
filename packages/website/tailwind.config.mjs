/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],

  theme: {
    extend: {
      // 自定义颜色
      colors: {
        primary: {
          DEFAULT: '#2937f0',
          light: '#4e5ff3',
        },
      },

      // 自定义宽度
      width: {
        sidebar: '200px',
      },

      // 自定义高度
      height: {
        nav: '60px',
      },

      // 自定义 margin
      margin: {
        sidebar: '200px',
      },

      // 自定义滚动 margin
      scrollMargin: {
        nav: '100px',
      },

      // 自定义 z-index
      zIndex: {
        100: '100',
      },
    },
  },

  plugins: [],
}
