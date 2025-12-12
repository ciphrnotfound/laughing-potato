// Flat ESLint config for ESLint v9 and Next.js 16
// See: https://nextjs.org/docs/app/building-your-application/configuring/eslint
import nextConfig from 'eslint-config-next';

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
  ...nextConfig,
  {
    name: 'bothive:ignores',
    ignores: [
      'node_modules/**',
      '.next/**',
      'dist/**',
      'out/**',
      'coverage/**',
      '**/*.min.*',
      'packages/**/dist/**',
    ],
  },
  {
    name: 'bothive:overrides',
    rules: {
      // Relax some strict rules that commonly fail in existing codebases.
      'react/no-unescaped-entities': 'off',
      '@next/next/no-img-element': 'off',
    },
  },
];

export default config;
