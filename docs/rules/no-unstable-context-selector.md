# no-unstable-context-selector

This rule effects failures when [`useContextSelector`](https://github.com/dai-shi/use-context-selector) is passed a function that an unstable value - i.e. a value that is guaranteed to be different with each call.

## Rule details

Examples of **incorrect** code for this rule:

```js
const values = useContextSelector(context, ({ a, b, c }) => [a, b, c]);
```

```js
const slice = useContextSelector(context, ({ a, b, c }) => ({ a, b, c }));
```

Examples of **correct** code for this rule:

```js
const a = useContextSelector(context, ({ a }) => a);
const b = useContextSelector(context, ({ b }) => b);
const c = useContextSelector(context, ({ c }) => c);
const slice = useMemo(() => ({ a, b, c }), [a, b, c]);
```

## Further reading

-   [`useContextSelector`](https://github.com/dai-shi/use-context-selector)
-   React's experimental [Context Selectors](https://github.com/facebook/react/pull/20646) PR - [this comment](https://github.com/facebook/react/pull/20646#issuecomment-786912866), in particular.
