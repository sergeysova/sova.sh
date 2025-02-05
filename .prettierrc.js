export default {
  useTabs: false,
  tabWidth: 2,
  singleQuote: true,
  trailingComma: 'all',
  semi: true,
  arrowParens: 'always',
  bracketSpacing: false,
  printWidth: 100,
  endOfLine: 'lf',
  plugins: ['prettier-plugin-astro', 'prettier-plugin-tailwindcss'],
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro',
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
      },
    },
    {
      files: '*.mdx',
      options: {
        printWidth: 80,
      },
    },
  ],
};
