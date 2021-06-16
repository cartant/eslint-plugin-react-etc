# eslint-plugin-react-etc

[![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/cartant/eslint-plugin-react-etc/blob/master/LICENSE)
[![NPM version](https://img.shields.io/npm/v/eslint-plugin-react-etc.svg)](https://www.npmjs.com/package/eslint-plugin-react-etc)
[![Downloads](http://img.shields.io/npm/dm/eslint-plugin-react-etc.svg)](https://npmjs.org/package/eslint-plugin-react-etc)
[![Build status](https://img.shields.io/circleci/build/github/cartant/eslint-plugin-react-etc?token=20f3b6ffe059060341ce06b96fe1e94a94e145ab)](https://app.circleci.com/pipelines/github/cartant)
[![dependency status](https://img.shields.io/david/cartant/eslint-plugin-react-etc.svg)](https://david-dm.org/cartant/eslint-plugin-react-etc)
[![devDependency Status](https://img.shields.io/david/dev/cartant/eslint-plugin-react-etc.svg)](https://david-dm.org/cartant/eslint-plugin-react-etc#info=devDependencies)
[![peerDependency Status](https://img.shields.io/david/peer/cartant/eslint-plugin-react-etc.svg)](https://david-dm.org/cartant/eslint-plugin-react-etc#info=peerDependencies)

This package will eventually contain a bunch of ESLint rules - some of which will require the use of TypeScript - to highlight potential problems or poor practices in React. As a starting point, there is a single rule - `prefer-usememo` - but you can expect more rules to be added in future releases, as I have a bunch of ideas that I want to explore.

Some of the rules will be rather opinionated and won't be included in the `recommended` configuration. Developers can decide for themselves whether they want to enable opinionated rules.

# Install

Install the package using npm:

```
npm install eslint-plugin-react-etc --save-dev
```

Some of the rules in this package require the ESLint TypeScript parser (indicated in the table below). If you intend to use those rules, install the parser using npm:

```
npm install @typescript-eslint/parser --save-dev
```

And then configure the `parser` and the `parserOptions` for ESLint. Here, I use a `.eslintrc.js` file for the configuration:

```js
const { join } = require("path");
module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    project: join(__dirname, "./tsconfig.json"),
    sourceType: "module"
  },
  plugins: ["react-etc"],
  extends: [],
  rules: {
    "react-etc/prefer-usememo": "error"
  }
};
```

Or, using the `recommended` configuration:

```js
const { join } = require("path");
module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2019,
    project: join(__dirname, "./tsconfig.json"),
    sourceType: "module"
  },
  extends: ["plugin:react-etc/recommended"],
};
```

# Rules

The package includes the following rules:

| Rule | Description | TS-only | Recommended |
| --- | --- | --- | --- |
| [`prefer-usememo`](https://github.com/cartant/eslint-plugin-react-etc/blob/main/docs/rules/prefer-usememo.md) | Forbids `useEffect` when `useMemo` should suffice. It's an implementation of the rule that Sophie Alpert mentioned in [this tweet](https://twitter.com/sophiebits/status/1293710971274289152). | No | Yes |
| [`no-unstable-context-selector`](https://github.com/cartant/eslint-plugin-react-etc/blob/main/docs/rules/no-unstable-context-selector.md) | Forbids passing functions that return unstable values to [`useContextSelector`](https://github.com/dai-shi/use-context-selector). | No | Yes |
