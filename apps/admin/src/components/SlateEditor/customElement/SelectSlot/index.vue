<template>
  <component
    :is="currentComponent"
    ref="componentRef"
    v-bind="$attrs"
    :element="element"
    :editor="editor"
    @change="handleChange"
  />
</template>

<script setup>
import { computed, ref, markRaw, defineEmits, watch } from "vue";
// import InputSlot from "../InputSlot.vue";
import SimpleSlot from "./Select.vue";

const props = defineProps({
  element: {
    type: Object,
    default: () => ({}),
  },
  editor: {
    type: Object,
    default: () => ({}),
  },
});

watch(
  props,
  () => {
    console.log(">>> selectSlot props", props);
  },
  { immediate: true }
);

const emit = defineEmits();

const componentRef = ref(null);
const firstType = ref("date");

const placeholder = computed(() => `${props.element?.placeholder}`);
const sourceFields = computed(() => placeholder.value.split("|")); // 底纹词列表

const currentValue = ref("");

// 使用计算属性动态决定使用哪个组件
const currentComponent = computed(() => 
  // markRaw(firstType.value === "date" ? InputSlot : InputSlot)
  markRaw(SimpleSlot)
);

const handleChange = (value) => {
  currentValue.value = value;
  emit("change", value);
  // emit('change', `${sourceFields.value[0]}=${value}`)
};

// 手动暴露 focus 方法，确保始终可用
defineExpose({
  focus: () => {
    componentRef.value?.focus?.();
  },
  validate: () => componentRef.value?.validate?.(),
  getData: () => {
    return {
      key: sourceFields.value[0],
      value: currentValue.value,
    };
  },
});

</script>
