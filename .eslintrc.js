module.exports = {
  parserOptions: {
    "ecmaVersion": 2018
  },
  env: {
    "browser": true,
    "es6": true
  },
  extends: 'google',
  rules: {
    "require-jsdoc": 0,
    "linebreak-style": ["error", "windows"],
    "new-cap": "off"
  },
};
