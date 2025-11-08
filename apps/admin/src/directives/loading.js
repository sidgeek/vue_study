import { createApp } from 'vue';
import LoadingComponent from '@/components/common/Loading.vue';

const loadingDirective = {
  mounted(el, binding) {
    const app = createApp(LoadingComponent);
    const instance = app.mount(document.createElement('div'));
    el.instance = instance;
    el.style.position = 'relative';

    if (binding.value) {
      append(el);
    }
  },
  updated(el, binding) {
    if (binding.value !== binding.oldValue) {
      binding.value ? append(el) : remove(el);
    }
  },
};

function append(el) {
  el.appendChild(el.instance.$el);
}

function remove(el) {
  el.removeChild(el.instance.$el);
}

export default loadingDirective;