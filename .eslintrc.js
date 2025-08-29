module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
    rules: {
        'no-unused-vars': 'warn',
        'no-console': 'warn',
        'react/prop-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
    },
};
