import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginVuePug from 'eslint-plugin-vue-pug'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,vue}'],
  },

  globalIgnores(['**/dist/**', '**/coverage/**', '**/node_modules/**']),

  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,

  {
    name: 'app/pug-templates',
    files: ['**/*.vue'],
    plugins: { 'vue-pug': pluginVuePug },
    languageOptions: {
      parserOptions: {
        templateTokenizer: { pug: 'vue-eslint-parser-template-tokenizer-pug' },
      },
    },
    rules: {
      'vue-pug/no-parsing-error': 'error',
      'vue-pug/no-pug-control-flow': 'error',
      'vue/component-name-in-template-casing': 'off',
      'vue/html-self-closing': 'off',
      'vue/html-end-tags': 'off',
      'vue/html-indent': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/multi-word-component-names': ['error', { ignores: ['App'] }],
    },
  },

  skipFormatting,
)
