# The end

Hi developer, you're reaching the end of this workshop.

I'm sorry I don't have enough time for more tests.

As you can see in the previous tests, writing a transformer is not difficult,
but you must be careful to cover all cases or the transformation result will be wrong.

Do you have any cool ideas? Try it! But remember,

⚠⚠⚠ If you are creating a new "dialect" of JavaScript using this technique, please be very, very deliberate. ⚠⚠⚠

Here is some production-ready I wrote before. Happy coding, Goodbye!

## List of transformers I wrote

### [react-refresh/typescript](https://github.com/facebook/react/pull/19914/)

React Refresh is a modern solution to the React Component HMR.

It requires a transformer applied to the source code to gather some information.

Now there is only a babel version provided by react-refresh officially, I wrote a TypeScript version.

### [@magic-works/commonjs-import.meta](https://github.com/Jack-Works/commonjs-import.meta)

Use `import.meta.url` in CommonJS.

### [@magic-works/ttypescript-browser-like-import-transformer](https://github.com/Jack-Works/ttypescript-browser-like-import-transformer)

Turn your code from

```ts
import * as React from 'react'
```

Into

```ts
const React = _import(globalThis['React'], [], 'react', 'globalThis.React', false)
import { _import } from 'https://cdn.jsdelivr.net/npm/@magic-works/ttypescript-browser-like-import-transformer@2.3.0/es/ttsclib.min.js'
```
