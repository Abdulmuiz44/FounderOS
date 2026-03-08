import next from 'eslint-config-next';

export default [
  {
    ignores: ['.next/**/*', 'node_modules/**/*', 'dist/**/*']
  },
  ...next,
  {
    rules: {
      'no-console': 'warn',
      'react/no-unescaped-entities': 'warn',
      '@next/next/no-img-element': 'warn',
      '@next/next/no-html-link-for-pages': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'no-use-before-define': 'warn',
      'import/no-anonymous-default-export': 'off'
    }
  }
];
