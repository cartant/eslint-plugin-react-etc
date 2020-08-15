# eslint-plugin-react-etc

This repo is a WIP.

Eventually, it will contain a bunch of ESLint rules - some of which will require the use of TypeScript - to highlight potential problems or poor practices in React.

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
    /* ... */
  }
};
```

# Rules

The package includes the following rules:

| Rule | Description | TS-only | Recommended |
| --- | --- | --- | --- |
| [`prefer-usememo`](https://github.com/cartant/eslint-plugin-react-etc/blob/main/source/rules/prefer-usememo.ts) | Forbids `useEffect` when `useMemo` should suffice. It's an implementation of the rule that Sophie Alpert mentioned in [this tweet](https://twitter.com/sophiebits/status/1293710971274289152). | No | TBD |
