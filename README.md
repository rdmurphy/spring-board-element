# `<spring-board>` element

A custom element that makes it simple to embed [Spring '83 boards](https://github.com/robinsloan/spring-83)!

## Usage

If you are using `<spring-board>` in a client-side framework you'll likely want to install it via [npm](https://www.npmjs.com/), [Yarn](https://yarnpkg.com/) or [pnpm](https://pnpm.js.org/).

```sh
npm install spring-board-element
# or
yarn add spring-board-element
# or
pnpm install spring-board-element
```

Then in your bundle, import the element:

```js
import 'spring-board-element';
```

However, a simple `<script>` tag will also work! A UMD build is available via [unpkg.com](https://unpkg.com/) or any other CDN.

```html
<head>
  <!-- Import the element -->
  <script type="module" src="https://unpkg.com/spring-board-element"></script>
  <!-- ... the rest of your <head> -->
</head>
<body>
  <spring-board href="https://bogbody.biz/..."></spring-board>
</body>
```


## LICENSE

MIT