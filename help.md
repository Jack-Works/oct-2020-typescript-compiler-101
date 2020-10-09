# Help

This tool is used to test if your transformer works expectedly.

1. All tests are in the `./tests` folder.

2. Each exercise has its folder, for example, `./tests/0 HelloWorld`

3. Transformer should be named as `code.ts`, any other `.tsx?` files are treated as tests.

4. Signature of `code.ts` should match:

```ts
export default function (): ts.TransformerFactory<SourceFile>
```

For example

```text
./tests/a/code.ts <- the transformer file
./tests/a/case1.ts <- the test file
./tests/a/case1.js <- the baseline (expected result, may not exist for every test)
./tests/a/case1-local.js <- your transformer outputs
```

## Available options

`-h`, `--help`: show this help file.

`-w`: Write `*-local.js` to `*.js` as new baselines.

`-t=match`: Only run tests that have `match` in it. (Does not support RegExp).
