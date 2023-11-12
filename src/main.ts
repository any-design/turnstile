declare global {
  interface Window {
    turnstile?: {
      getResponse: () => Promise<string>;
      render: (
        element: string | HTMLElement,
        options: {
          sitekey: string;
          callback: Function;
          'expired-callback': Function | void;
          'error-callback': Function | void;
        },
      ) => void;
      reset: () => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

import turnstileVue from './turnstile.vue';

export default turnstileVue;
