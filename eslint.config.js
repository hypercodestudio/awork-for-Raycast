const react = require('eslint-plugin-react')
const globals = require('globals')
const tsParser = require('@typescript-eslint/parser')

module.exports = [
  {
    ...react.configs.flat.recommended,
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    plugins: {
      react
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.node
      }
    },
    rules: {
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error'
    }
  }
]
