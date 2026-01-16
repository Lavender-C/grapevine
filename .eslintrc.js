module.exports = {
    root: true,
    parser: '@typescript-eslin/parser',
    extends: [
        'eslint:recommended',
        'pluging:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-native/all',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
        'prettier',
    ],
    plugins: ['react', 'react-native', '@typescript-eslint', 'unused-imports'],
    env: {
        'react-native/react-native': true,
        es6: true,
        node: true,
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
    rules: {
        'unused-imports/no-unused-imports': 'error',
        'react-native/no-raw-text': 'off',
    },
};