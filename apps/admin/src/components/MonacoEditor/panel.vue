<template>
  <div class="container">
    <Select
      v-model:value="currentLanguage"
      style="width: 200px"
      :options="languageOptions"
      block
    ></Select>
    <Button @click="emit('format')">格式化</Button>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Select, Button } from "ant-design-vue";

const props = defineProps({
  language: {
    type: String,
    required: true,
    default: "plaintext",
  },
});

const emit = defineEmits();

const currentLanguage = computed({
  get: () => props.language,
  set: (val) => {
    emit("update:language", val);
    emit("change", val);
  },
});

const languageOptions = [
  { label: "纯文本", value: "plaintext" },
  { label: "JSON", value: "json" },
  { label: "Markdown", value: "template-markdown" },
];
</script>