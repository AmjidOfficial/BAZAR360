import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

export default [
  {
    ignores: ['dist/**/*', 'node_modules/**/*', '*.js', '*.cjs', '*.py']
  },
  firebaseRulesPlugin.configs['flat/recommended']
];
