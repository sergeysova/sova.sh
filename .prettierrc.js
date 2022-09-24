module.exports = {
  useTabs: false,
  tabWidth: 2,
  singleQuote: true,
  trailingComma: 'all',
  semi: true,
  arrowParens: 'always',
  bracketSpacing: false,
  printWidth: 100,
  endOfLine: 'lf',
  plugins: [require.resolve('prettier-plugin-astro')],
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
        printWidth: 66,
      },
    },
    {
      files: '*.mdx',
      options: {
        printWidth: 66,
      },
    },
  ],
};
