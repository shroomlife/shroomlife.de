module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
    browser: true,
    serviceworker: true,
    jquery: true,
    lazyload: true
  },
  extends: 'standard',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018
  },
  rules: {
  }
}
