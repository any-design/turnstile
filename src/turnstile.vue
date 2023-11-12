<template>
  <div class="turnstile" ref="containerRef"></div>
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted, ref, type PropType, computed, onBeforeUnmount } from 'vue';

const props = defineProps({
  callbackName: {
    type: String,
    default: 'onTurnstileLoaded',
  },
  siteKey: {
    type: String,
    required: true,
  },
  modelValue: {
    type: String,
    default: '',
  },
  action: {
    type: String,
  },
  size: {
    type: String as PropType<'normal' | 'compact'>,
    default: 'normal',
  },
  theme: {
    type: String as PropType<'light' | 'dark' | 'auto'>,
    default: 'auto',
  },
  appearance: {
    type: String as PropType<'always' | 'execute' | 'interaction-only'>,
    default: 'always',
  },
  renderOnMount: {
    type: Boolean,
    default: true,
  },
  autoReset: {
    type: Boolean,
    default: true,
  },
  // only enabled when autoReset is true.
  resetInterval: {
    type: Number,
    default: 295 * 1000,
  },
});

const emit = defineEmits(['verify', 'expire', 'error', 'ready', 'update:modelValue']);

let componentMounted = false;
let componentRendered = false;

const containerRef = ref<HTMLElement | undefined>();

const turnstileOptions = computed(() => ({
  size: props.size,
  theme: props.theme,
  sitekey: props.siteKey,
  action: props.action,
  appearance: props.appearance,
}));

let resetTimeout: ReturnType<typeof setTimeout> | undefined;

const onVerify = (response: string) => {
  if (!response) {
    emit('verify', { result: false, response });
    emit('update:modelValue', '');
    return;
  }
  emit('verify', { result: true, response });
  emit('update:modelValue', response);
  if (props.autoReset) {
    if (resetTimeout) {
      clearTimeout(resetTimeout);
    }
    resetTimeout = setTimeout(() => {
      resetTurnstile();
      resetTimeout = undefined;
    }, props.resetInterval);
  }
};

const renderTurnstile = () => {
  if (!window.turnstile) {
    throw new Error('Turnstile is not loaded');
  }
  if (!containerRef.value) {
    throw new Error('Turnstile container is not rendered');
  }
  try {
    window.turnstile?.render(containerRef.value, {
      ...turnstileOptions.value,
      callback: (response: string) => onVerify(response),
      'expired-callback': (e: any) => emit('expire', e),
      'error-callback': (e: any) => emit('error', e),
    });
    componentRendered = true;
    emit('ready');
  } catch (error) {
    console.error('Failed to render turnstile:', error);
    throw error;
  }
};

const resetTurnstile = () => {
  if (!window.turnstile) {
    throw new Error('Turnstile is not loaded');
  }
  window.turnstile.reset();
  emit('update:modelValue', '');
};

const setupCallbackMethod = () => {
  (window as any)[props.callbackName] = () => {
    if (!componentMounted || componentRendered || !props.renderOnMount) {
      return;
    }
    renderTurnstile();
  };
};

const injectScript = () => {
  if (window.turnstile) {
    return;
  }

  setupCallbackMethod();

  const script = document.createElement('script');
  script.src = `https://challenges.cloudflare.com/turnstile/v0/api.js?onload=${props.callbackName}`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
};

defineExpose({
  render: renderTurnstile,
  reset: resetTurnstile,
});

onBeforeMount(() => {
  injectScript();
});

onMounted(() => {
  componentMounted = true;
  if (window.turnstile && !componentRendered && props.renderOnMount) {
    renderTurnstile();
  }
});

onBeforeUnmount(() => {
  if (resetTimeout) clearTimeout(resetTimeout);
});
</script>
