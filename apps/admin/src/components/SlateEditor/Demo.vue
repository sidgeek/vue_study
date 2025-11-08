<template>
  <div class="demo-container">
    <h2>Slate编辑器挖空填词功能演示</h2>
    
    <div class="demo-section">
      <h3>基础用法</h3>
      <p>
        在下面的编辑器中，你可以看到挖空填词的效果。使用 [placeholder] 格式来创建输入插槽。
      </p>
      
      <SlateEditor 
        ref="editorRef"
        :initial-value="initialValue"
        placeholder="请输入内容，使用 [占位符] 格式创建输入框"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      
      <div class="editor-actions">
        <button @click="setTemplate1">设置模板1</button>
        <button @click="setTemplate2">设置模板2</button>
        <button @click="clearEditor">清空编辑器</button>
        <button @click="getCurrentValue">获取当前值</button>
      </div>
    </div>
    
    <div class="demo-section">
      <h3>当前编辑器内容</h3>
      <div class="content-display">
        <pre>{{ currentValue }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { SlateEditor } from "./index.js";

const editorRef = ref();
const currentValue = ref("");
const initialValue = ref(
  "我的名字是 ${时间范围}，今年 [年龄] 岁，住在 [城市]。"
);

const handleChange = (value) => {
  currentValue.value = value;
  console.log("编辑器内容变化：", value);
};

const handleFocus = () => {
  console.log("编辑器获得焦点");
};

const handleBlur = () => {
  console.log("编辑器失去焦点");
};

const setTemplate1 = () => {
  const template = "我的名字是[姓名]，今年[年龄]岁，住在[城市]。";
  editorRef.value?.initEditor(template);
};

const setTemplate2 = () => {
  const template = "这是一款[产品名称]，价格是[价格]元，适合[目标用户]使用。";
  editorRef.value?.initEditor(template);
};

const clearEditor = () => {
  editorRef.value?.initEditor("");
};

const getCurrentValue = () => {
  const value = editorRef.value?.getInputValue();
  alert(`当前编辑器内容：${value}`);
};
</script>

<style scoped>
.demo-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.demo-container h2 {
  color: #333;
  margin-bottom: 30px;
  text-align: center;
}

.demo-container h3 {
  color: #555;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
}

.demo-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.editor-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.editor-actions button {
  padding: 8px 16px;
  background: #4475e9;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.editor-actions button:hover {
  background: #3a6bd1;
}

.editor-actions button:active {
  background: #2f5bb8;
}

.content-display {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  min-height: 60px;
}

.content-display pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  color: #333;
  font-family: monospace;
}

ul {
  margin: 0;
  padding-left: 20px;
  margin-bottom: 8px;
  line-height: 1.5;
}

code {
  background: #fefefe;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
  color: #d63384;
}

.template-examples {
  display: grid;
  gap: 15px;
}

.template-item {
  background: #fff;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.template-item code {
  display: block;
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  margin-top: 8px;
  color: #333;
  font-size: 14px;
}
</style>
