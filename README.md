# @any-design/turnstile

A Cloudflare Turnstile wrapper in Vue 3.

_Compatible with form in `@any-design/anyui`._

## Usage

### Install

```bash
$ npm i @any-design/turnstile
```

### Import

```vue
<template>
  <turnstile siteKey="SITE_KEY"></turnstile>
</template>

<script steup lang="ts">
import Turnstile from '@any-design/turnstile';
</script>
```

### Props

This component takes the following props:

- `siteKey` (**required**, type: `String`): The site key from your Turnstile project.

- `callbackName` (type: `String`, default: `'onTurnstileLoaded'`): The global callback function name when the Turnstile JS SDK is loaded.

- `modelValue` (type: `String`, default: `''`): Use `v-model` to sync the response of the verification.

- `action` (type: `String`): The action when you verify.

- `size` (type: `String`, optional values: `'normal' | 'compact'`, default: `'normal'`): The size of the widget.

- `theme` (type: `String`, optional values: `'light' | 'dark' | 'auto'`, default: `'auto'`): The theme of the widget.

- `appearance` (type: `String`, optional values: `'always' | 'execute' | 'interaction-only'`, default: `'always'`): How the widget is shown.

- `renderOnMount` (type: `Boolean`, default: `true`): If set to false, the component will not render on mount. Instead, you need to manually call the `render` method.

- `autoReset` (type: `Boolean`, default: `true`): If set to true, the widget will automatically reset after the response expired.

- `resetInterval` (type: `Number`, default: `295000`): The interval before automatically reset. Only enabled when `autoReset` is true.

### Events

This component will emit the following events:

- `verify`: This gets triggered when the verification completes. The failure could be caused by no response or error during verification. The argument will be `{ result: boolean, response?: string }`.

- `expire`: This is emitted when the response expired.

- `error`: This is emitted when an error occurred during rendering or verifying.

- `ready`: This is emitted when the Turnstile SDK is ready and the widget is rendered.

- `update:modelValue`: This is emitted when the modelValue updates. Often used in `v-model`.

### Exposed Methods

The Turnstile component exposes two methods for you to interact with it.

- `render`: Call this method to manually render the Turnstile. It's useful when `renderOnMount` is set to false.

- `reset`: Call this method to manually reset the Turnstile, it will also reset the value of the `modelValue`.

# License

MIT
