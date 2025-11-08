<template>
  <div class="slate-editor-wrap">
    <div
      :class="[
        'slate-editor-content',
        {
          active: isFocus,
        },
      ]"
    >
      <Slate :editor="editor" :render-element="renderElement">
        <Editable
          ref="editorRef"
          :key="editorKey"
          class="input-area"
          :placeholder="placeholder"
          :read-only="readOnly"
          @keydown="handleKeyDown"
          @focus="handleFocus"
          @blur="handleBlur"
          @compositionstart="isComposing = true"
          @compositionend="isComposing = false"
          @paste="handlePaste"
        />
      </Slate>
    </div>
  </div>
</template>

<script setup>
import { Slate, Editable, useInheritRef } from "slate-vue3";
import { createEditor, Transforms, Editor } from "slate-vue3/core";
import { withDOM } from "slate-vue3/dom";
import { withHistory } from "slate-vue3/history";
import { ref, computed, watch, nextTick, h, onMounted } from "vue";
import { transformInputText, InputSlot, SelectSlot } from "./index";

const props = defineProps({
  placeholder: {
    type: String,
    required: true,
    default: "请输入内容",
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
  initialValue: {
    type: String,
    default: "",
  },
  editorKey: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["focus", "blur", "change"]);

// 自定义元素处理
const withCustomElements = (editor) => {
  const { isInline, isVoid, markableVoid } = editor;
  editor.isInline = (element) =>
    element.type === "input" ? true : isInline(element);
  editor.isVoid = (element) =>
    element.type === "input" ? true : isVoid(element);
  editor.markableVoid = (element) =>
    element.type === "input" || markableVoid(element);
  return editor;
};

// 编辑器状态
const editor = ref(withHistory(withCustomElements(withDOM(createEditor()))));
const editorRef = ref();
const isComposing = ref(false);
const isFocus = ref(false);

// 输入框相关
const inputSlotRefs = ref(new Map());
const inputSlotValues = ref(new Map());

// 输入框内容组合
const inputValue = computed(() => {
  const children = editor.value?.children;
  if (!children) return "";
  const firstParagraph = children[0];
  if (!firstParagraph) return "";
  const inputNodeList = firstParagraph.children;
  if (!inputNodeList) return "";
  let result = "";
  inputNodeList.forEach((node, index) => {
    if (node.type === "input") {
      result += inputSlotValues.value.get(index) || node.placeholder || "";
    } else if (node.text) {
      result += node.text;
    }
  });
  return result;
});

// 初始化编辑器
const initEditor = (inputText, _isFocus = true) => {
  if (!inputText) {
    editor.value.children = [
      {
        type: "paragraph",
        children: [{ text: "" }],
      },
    ];
    return;
  }
  // 有值的情况下，转换编辑器的内容（识别插槽区域）
  editor.value.children = transformInputText(inputText, () => false);
  nextTick(() => {
    if (!_isFocus) return;
    // 先聚焦编辑器
    editorRef.value?.$el.focus();
    // 设置选区到末尾
    Transforms.select(editor.value, Editor.end(editor.value, []));
    // 如果有input插槽，则聚焦第一个
    const firstInputIndex = editor.value?.children?.[0]?.children?.findIndex(
      (node) => node.type === "input"
    );
    if (firstInputIndex !== -1) {
      inputSlotRefs.value.get(firstInputIndex)?.focus();
    } else if (_isFocus) {
      // 如果没有input插槽且需要聚焦，则聚焦到编辑器末尾（这里假设focusToEnd是一个自定义函数，实际可能需要调整）
      // 由于原代码中focusToEnd未定义，这里暂时使用类似逻辑或可移除
      // 示例调整：再次确保选区在末尾
      Transforms.select(editor.value, Editor.end(editor.value, []));
    }
  });
};

// 输入框自定义元素渲染
const renderElement = (elProps) => {
  const { attributes, children, element } = elProps;
  const curInputIndex = editor.value.children[0].children.findIndex(
    (node) => node === element
  );
  const commonParams = {
    ...useInheritRef(attributes),
    ref: (el) => {
      inputSlotRefs.value.set(curInputIndex, el);
    },
    element,
    onChange: (value) => {
      inputSlotValues.value.set(curInputIndex, value);
      emit("change", inputValue.value);
    },
  };
  switch (element.type) {
    // 嵌套输入插槽
    case "input":
      return h(InputSlot, commonParams, () => children);
    case "select":
      return h(SelectSlot, commonParams, () => children);
    default:
      return h("paragraph", attributes, children);
  }
};

// 事件处理（这里原代码未完整展示事件处理函数，如handleKeyDown等，可根据实际需求补充）
// 事件处理
const handleKeyDown = (e) => {
  if (e.key === "Enter" &&!e.shiftKey) {
    e.preventDefault();
    // 可以在这里处理发送逻辑
  } else if ((e.code === "Space" || e.key === "") && isComposing.value) {
    e.preventDefault();
  }
};

const handleFocus = () => {
  isFocus.value = true;
  emit("focus");
};

const handleBlur = () => {
  isFocus.value = false;
  emit("blur");
};

const handlePaste = (event) => {
  event.preventDefault();
  const text = event.clipboardData?.getData("text/plain") || "";
  Transforms.insertText(editor.value, text);
};

// 聚焦到末尾
const focusToEnd = (element) => {
  if (!element) {
    element = editorRef.value?.$el;
  }
  // 如果元素不是可编辑的，则不进行聚焦
  if (!element.getAttribute("contenteditable")) {
    return;
  }
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(element);
  range.collapse(false); // 设置为false将光标移动到末尾
  sel?.removeAllRanges();
  sel?.addRange(range);
  element.focus(); // 确保元素获得焦点
};

// 监听初始值变化
watch(
  () => props.initialValue,
  (newVal) => {
    if (newVal!== undefined) {
      initEditor(newVal || "", false);
    }
  },
  { immediate: true }
);

// 暴露方法给父组件
defineExpose({
  inputValue,
  editorRef,
  inputSlotRefs,
  initEditor,
  focus: (end = true) => {
    nextTick(() => {
      if (end) {
        focusToEnd(editorRef.value?.$el);
      } else {
        editorRef.value?.$el.focus();
      }
    });
  },
  getInputValue: () => inputValue.value,
});

</script>

<style scoped>
.slate-editor-wrap {
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

.slate-editor-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 120px;
  padding: 12px;
  box-sizing: border-box;
  border-radius: 8px;
  outline: 1px solid #e5e5e5;
  background-color: #fff;
}

.slate-editor-content.active {
  outline: 1px solid #4475e9;
}

.input-area {
  flex: 1;
  height: 68px;
  outline: none;
  overflow-y: auto;
  color: #333;
  font-size: 14px;
  line-height: 20px;
}

.input-area :deep([data-slate-placeholder="true"]) {
  max-height: 68px;
}
</style>

