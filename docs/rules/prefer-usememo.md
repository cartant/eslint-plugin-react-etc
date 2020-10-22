# prefer-usememo

This rule effects failures when `useEffect` is used in scenarios better suited to `useMemo`.

## Rule details

Examples of **incorrect** code for this rule:

```js
const [processedData, setProcessedData] = useState();
useEffect(() => {
  let processed = /* do something with data */;
  setProcessedData(processed);
}, [data]);
```

Examples of **correct** code for this rule:

```js
const processedData = useMemo(() => {
  let processed = /* do something with data */;
  return processed;
}, [data]);
```

## Further reading

- Sophie Alpert's [tweet](https://twitter.com/sophiebits/status/1293710971274289152)