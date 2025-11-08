<template>
  <BasePanel
    panel-type="basic-select"
    placeholder="请选择选项"
    :panel-width="350"
    :display-value="displayValue1"
    @change="handleChange1"
    @panel-open="handlePanelOpen"
    @panel-close="handlePanelClose"
    @remove="handleRemove1"
  >
    <template #panel-content>
      <div class="panel-content">
        <div class="options-list">
          <div
            v-for="option in options"
            :key="option.value"
            class="option-item"
            :class="{ selected: isSelected(option.value, displayValue1) }"
            @click="toggleOption(option.value, displayValue1, 'basic-select')"
          >
            <span class="option-label">{{ option.label }}</span>
            <span
              v-if="isSelected(option.value, displayValue1)"
              class="check-mark"
            ></span>
          </div>
        </div>
      </div>
    </template>
  </BasePanel>
</template>

<script setup>
import { ref, reactive } from "vue";
import BasePanel from "./BasePanel.vue";

// 数据定义
const displayValue1 = reactive({
  activeTab: "basic",
  activeValue: {
    basic: [],
  },
});

const panelStates = reactive({
  panel1: false,
  panel2: false,
  panel3: false,
});

// 选项数据
const options = [
  { value: "option1", label: "选项1" },
  { value: "option2", label: "选项2" },
  { value: "option3", label: "选项3" },
];

// 方法定义
const isSelected = (value, displayValue) => {
  return (displayValue.activeValue[displayValue.activeTab] || []).includes(value);
};

const toggleOption = (value, displayValue, panelType) => {
  const currentValues = displayValue.activeValue[displayValue.activeTab] || [];
  const index = currentValues.indexOf(value);
  if (index > -1) {
    currentValues.splice(index, 1);
  } else {
    currentValues.push(value);
  }

  // 触发change事件
  const changeEvent = {
    basic: () => handleChange1(currentValues.join(",")),
  };
  if (changeEvent[panelType]) {
    changeEvent‌:ml-search[panelType];
  }
};

const confirmSelection = (panelType) => {
  // 这里可以添加确认逻辑
  console.log(`确认选择：${panelType}`);
};

// 事件处理
const handleChange1 = (value) => {
  console.log("面板1值变化：", value);
};

const handleRemove1 = (value) => {
  const index = displayValue1.activeValue.basic.indexOf(value);
  if (index > -1) {
    displayValue1.activeValue.basic.splice(index, 1);
  }
};

const handlePanelOpen = () => {
  panelStates.panel1 = true;
  console.log("面板打开");
};


const handlePanelClose = () => {
  panelStates.panel1 = false;
  console.log("面板关闭");
};
</script>

<style scoped>
.options-list {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 16px;
}

.option-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.option-item:hover {
  background-color: #f0f0f0;
}

.option-item.selected {
  background-color: #e6f7ff;
  color: #1890ff;
}

.option-label {
  font-size: 14px;
}

.check-mark {
  color: #52c41a;
  font-weight: bold;
}
</style>
