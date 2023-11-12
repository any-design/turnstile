<template>
  <div class="turnstile" ref="containerRef" v-show="shouldShowComponent"></div>
  <div class="turnstile-placeholder" v-show="!componentRendered && placeholder" :style="placeholderStyle">
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
      <path fill="none" stroke="#888888" stroke-dasharray="15" stroke-dashoffset="15" stroke-linecap="round" stroke-width="2" d="M12 3C16.9706 3 21 7.02944 21 12">
        <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.3s" values="15;0"></animate>
        <animateTransform attributeName="transform" dur="1.5s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"></animateTransform>
      </path>
    </svg>
    <span>{{ loadingText || 'Loading Turnstile...' }}</span>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted, ref, type PropType, computed, onBeforeUnmount } from 'vue';

const TurnstileSize = {
  compact: {
    width: '130px',
    height: '120px',
  },
  normal: {
    width: '300px',
    height: '65px',
  },
};

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
  placeholder: {
    type: Boolean,
    default: true,
  },
  loadingText: {
    type: String,
    default: '',
  },
  readyDelay: {
    type: Number,
    default: 1000,
  },
});

const emit = defineEmits(['verify', 'expire', 'error', 'ready', 'unsupported', 'update:modelValue']);

const placeholderStyle = computed(() => TurnstileSize[props.size]);

const componentMounted = ref(false);
const componentRendered = ref(false);
const widgetId = ref('');

const shouldShowComponent = computed(() => {
  if (!props.placeholder) {
    return true;
  }
  return componentRendered.value;
});

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
    widgetId.value = window.turnstile?.render(containerRef.value, {
      ...turnstileOptions.value,
      callback: (response: string) => onVerify(response),
      'expired-callback': (e: any) => emit('expire', e),
      'error-callback': (e: any) => emit('error', e),
      'unsupported-callback': (e: any) => emit('unsupported', e),
    });

    const onReady = () => {
      componentRendered.value = true;
      emit('ready');
    };
    if (props.placeholder) {
      setTimeout(() => {
        onReady();
      }, props.readyDelay);
    } else {
      onReady();
    }
  } catch (error) {
    console.error('Failed to render turnstile:', error);
    throw error;
  }
};

const resetTurnstile = () => {
  if (!window.turnstile) {
    throw new Error('Turnstile is not loaded');
  }
  window.turnstile.reset(widgetId.value);
  emit('update:modelValue', '');
};

const setupCallbackMethod = () => {
  (window as any)[props.callbackName] = () => {
    if (!componentMounted.value || componentRendered.value || !props.renderOnMount) {
      return;
    }
    renderTurnstile();
  };
};

const injectScript = () => {
  // if the callback exists, overwrite it
  setupCallbackMethod();

  if (window.turnstile || document.querySelector('#turnstile-sdk')) {
    return;
  }

  const script = document.createElement('script');
  script.id = 'turnstile-sdk';
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
  componentMounted.value = true;
  if (window.turnstile && !componentRendered.value && props.renderOnMount) {
    renderTurnstile();
  }
});

onBeforeUnmount(() => {
  if (resetTimeout) clearTimeout(resetTimeout);
});
</script>

<style lang="scss">
.turnstile-placeholder {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 12px 12px 12px 20px;
  box-sizing: border-box;
  background-color: rgba(0, 0, 0, 0.08);
  user-select: none;

  svg {
    font-size: 20px;
    margin-right: 10px;
    color: #111;
  }

  span {
    font-size: 12px;
    color: #111;
  }
}
</style>