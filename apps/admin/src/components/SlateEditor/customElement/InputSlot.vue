<template>
  <span v-bind="$attrs" :contenteditable="false">
    <input
      ref="inputRef"
      :class="['input-slot', { 'input-slot-require': isRequire }]"
      :style="{ width: inputWidth }"
      :placeholder="placeholder"
      :value="inputText"
      @input="handleInput"
      @blur="handleBlur"
      @paste.stop
    />
    <slot />
  </span>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

const props = defineProps({
  element: {
    type: Object,
    default: () => ({})
  },
  editor: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['change', 'blur'])

const inputRef = ref()
const inputText = ref('')
const isRequire = ref(false)

const placeholder = computed(() => `${props.element?.placeholder}`)

const getTextWidth = (text) => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) return 0

  // 设置字体样式
  context.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  const metrics = context.measureText(text)
  return metrics.width
}

const inputWidth = computed(() => {
  let textWidth = 0
  if (inputText.value) {
    textWidth = getTextWidth(inputText.value)
  } else {
    textWidth = getTextWidth(placeholder.value)
  }
  const padding = 8 // 左右 padding
  return `${Math.max(textWidth + padding, 60)}px` // 设置最小宽度 60px
})

const handleInput = (event) => {
  const target = event.target
  inputText.value = target.value
  emit('change', target.value)
}

const handleBlur = () => {
  emit('blur')
}

onMounted(() => {
  // 如果有默认值，设置默认值
  if (props.element?.defaultValue) {
    inputText.value = props.element.defaultValue
    isRequire.value = !!inputText.value
    emit('change', inputText.value)
  }
})

defineExpose({
  focus: () => {
    inputRef.value?.focus()
  },
  validate: () => {
    return isRequire.value ? !!inputText.value : true
  }
})
</script>

<style scoped>
.input-slot {
  display: inline-block;
  margin: 0 4px;
  padding: 2px 4px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: transparent;
  outline: none;
  font-size: 14px;
  line-height: 20px;
  color: #333;
}

.input-slot:focus {
  border-color: #4475e9;
  box-shadow: 0 0 2px rgba(68, 117, 233, 0.1);
}
.input-slot::placeholder {
  color: #999;
}

.input-slot-require {
  color: #004db9;
  background-color: #ebf2ff;
  border-color: #4475e9;
}

</style>

