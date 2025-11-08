<template>
    <span ref="inputRef" v-bind="$attrs" :contenteditable="false" class="input-slot" data-slate-node="element"
        data-slate-void="true" @click="handleClick" @mousedown.prevent>
        <div class="display-area" :class="{ 'has-value': hasValue, required: isRequired }">

            <div class="content-wrapper">
                <span v-if="!hasValue && !showPanel" class="placeholder-text"
                    :class="{ 'required-placeholder': isRequired }">
                    {{ placeholder }}
                </span>
                <div v-else class="value-display">
                    <span class="tab-label">{{ displayValue?.activeTab }}</span>
                    <span class="equals-sign">=</span>
                    <span v-for="(value, index) in displayValue?.activeValue?.[displayValue?.activeTab] || []"
                        :key="value" class="value-item">
                        <span class="value-text">{{ value }}</span>
                        <span v-if="index < displayValue?.activeValue?.[displayValue?.activeTab]?.length - 1"
                            class="comma">,</span>
                        <button v-if="allowRemove" class="remove-button" @click.stop="handleRemove(value, $event)">
                            ×
                        </button>
                    </span>
                </div>
            </div>


            <span v-if="element?.type === 'select'" class="dropdown-arrow" :class="{ 'required-arrow': isRequired }">
                ▼
            </span>
        </div>
        <slot />
    </span>

    <Teleport to="body">
        <div v-show="showPanel" ref="panelRef" class="base-panel" :style="floatingStyle" @mousedown.prevent>
            <slot name="panel-content" />
        </div>
    </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
import { useFloating, autoUpdate, offset, flip, shift } from "@floating-ui/vue";

const props = defineProps({
    placeholder: {
        type: String,
        default: "",
    },
    panelType: {
        type: String,
        required: true,
    },
    panelWidth: {
        type: Number,
        default: 300,
    },
    inputValue: {
        type: String,
        default: "",
    },
    preventInputFocus: {
        type: Boolean,
        default: false,
    },
    element: {
        type: Object,
        default: () => ({}),
    },
    displayValue: {
        type: Object,
        default: () => ({
            activeTab: "",
            activeValue: {},
        }),
    },
});

const emit = defineEmits([
    "change",
    "blur",
    "panel-open",
    "panel-close",
    "update:inputValue",
    "remove",
]);

const EVENT_BUS_KEY = "panel-event-bus";

const getEventBus = () => {
    if (!window._panelEventBus) {
        window._panelEventBus = {};
    }
    return window._panelEventBus;
};

const uniqueId = `panel-${props.panelType}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

const inputRef = ref();
const panelRef = ref();
const inputText = ref(props.inputValue || "");
const showPanel = ref(false);
const preventReopenPanel = ref(false);
const isRequired = ref(false);

const hasValue = computed(() => {
    return (
        (props.displayValue?.activeValue?.[props.displayValue?.activeTab] || [])
            .length > 0
    );
});

const placeholder = computed(() => props.placeholder || "");

const { x, y, strategy, update } = useFloating(inputRef, panelRef, {
    placement: "bottom-start",
    middleware: [offset(5), flip(), shift()],
});

const floatingStyle = computed(() => {
    if (!inputRef.value) return {};
    const domElement = inputRef.value;
    if (!domElement) return {};
    const width = props.panelWidth
        ? `${props.panelWidth}px`
        : `${Math.max(domElement.offsetWidth, 300)}px`;
    return {
        position: strategy.value,
        top: `${y.value ?? 0}px`,
        left: `${x.value ?? 0}px`,
        maxHeight: "calc(100vh - 320px)",
        overflowY: "auto",
        zIndex: 2001,
        width,
    };
});

watch(
    () => props.inputValue,
    (newVal) => {
        if (newVal !== undefined && newVal !== inputText.value) {
            inputText.value = newVal;
        }
    },
    { immediate: true }
);

let cleanup;
let isHandlingShowPanelChange = false;

const internalOpenPanel = () => {
    document.removeEventListener("click", handleClickOutside);
    showPanel.value = true;
    setTimeout(() => {
        document.addEventListener("click", handleClickOutside);
    }, 100);
};

watch(showPanel, async (val) => {
    if (isHandlingShowPanelChange) return;
    isHandlingShowPanelChange = true;
    try {
        if (val) {
            preventReopenPanel.value = false;
            await nextTick();
            if (inputRef.value && panelRef.value) {
                cleanup = autoUpdate(inputRef.value, panelRef.value, update);
                update();
            }
            const eventBus = getEventBus();
            if (eventBus[EVENT_BUS_KEY]) {
                const currentProcessingId = uniqueId;
                Object.keys(eventBus[EVENT_BUS_KEY]).forEach((id) => {
                    if (
                        id !== currentProcessingId &&
                        typeof eventBus[EVENT_BUS_KEY][id] === "function"
                    ) {
                        eventBus[EVENT_BUS_KEY][id](currentProcessingId);
                    }
                });
            }
            if (!props.preventInputFocus) {
                emit("panel-open");
            }
        } else {
            cleanup?.();
            emit("panel-close");
        }
    } finally {
        setTimeout(() => {
            isHandlingShowPanelChange = false;
        }, 0);
    }
});
const handleClick = (event) => {
    if (showPanel.value || preventReopenPanel.value) {
        return;
    }
    event.preventDefault();
    event.stopPropagation();
    internalOpenPanel();
    if (props.preventInputFocus) {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
        nextTick(() => {
            emit("panel-open");
        });
    }
};

const handleRemove = (value, event) => {
    event.preventDefault();
    event.stopPropagation();
    emit("remove", value);
};

let isHandlingClickOutside = false;
// 点击外部关闭面板
const handleClickOutside = (event) => {
    if (isHandlingClickOutside) return;
    if (!showPanel.value) return;
    if (!panelRef.value) return;

    const inputElement = inputRef.value;
    if (!inputElement) return;

    if (
        !panelRef.value.contains(event.target) &&
        !inputElement.contains(event.target)
    ) {
        isHandlingClickOutside = true;
        setTimeout(() => {
            showPanel.value = false;
            setTimeout(() => {
                isHandlingClickOutside = false;
            }, 0);
        }, 0);
    }
};

// 生命周期
onMounted(() => {
    document.addEventListener("click", handleClickOutside);

    // 监听其他实例的打开事件
    const eventBus = getEventBus();
    eventBus[EVENT_BUS_KEY] = eventBus[EVENT_BUS_KEY] || {};
    eventBus[EVENT_BUS_KEY][uniqueId] = (sourceId) => {
        if (sourceId !== uniqueId && showPanel.value) {
            setTimeout(() => {
                showPanel.value = false;
            }, 0);
        }
    };

    // 判断首次加载时是否需要显示必填标识
    setTimeout(() => {
        isRequired.value =
            !!(props.displayValue?.activeValue?.[props.displayValue?.activeTab] || [])
                .length || placeholder.value.indexOf("|") > 0;
        if (isRequired.value) {
            emit("change", props.displayValue?.activeValue?.[props.displayValue?.activeTab]?.join(",") || "");
        } else {
            emit("change", props.displayValue?.activeTab || "");
        }
    }, 100);
});

onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);

    // 移除事件总线上的监听器
    const eventBus = getEventBus();
    if (eventBus?.[EVENT_BUS_KEY]?.[uniqueId]) {
        delete eventBus[EVENT_BUS_KEY][uniqueId];
    }

    // 清理自动更新
    cleanup?.();
});

// 暴露方法
defineExpose({
    closePanel: (focusInput = false) => {
        showPanel.value = false;
        preventReopenPanel.value = true;

        if (focusInput) {
            setTimeout(() => {
                if (inputRef.value) {
                    if (typeof inputRef.value.focus === "function") {
                        inputRef.value.focus();
                    } else if (inputRef.value.$el && typeof inputRef.value.$el.focus === "function") {
                        inputRef.value.$el.focus();
                    }
                }
                setTimeout(() => {
                    preventReopenPanel.value = false;
                }, 300);
            });
        } else {
            preventReopenPanel.value = false
        }
    },
    openPanel: () => {
        internalOpenPanel();
    },
    isPanelOpen: () => showPanel.value,
    getInputValue: () => inputText.value,
    setInputValue: (value) => {
        inputText.value = value;
        emit("update:inputValue", value);
    },
    focus: () => {
        if (!showPanel.value) {
            internalOpenPanel();
        }
    },
    validate: () => {
        return isRequired.value
            ? (props.displayValue?.activeValue?.[props.displayValue?.activeTab] || []).length > 0
            : true;
    }
});


</script>

<style scoped>
.input-slot {
    display: inline-block;
    margin: 0 4px;
    user-select: none;
    cursor: pointer;
}

.display-area {
    border-radius: 4px;
    padding: 1px 4px;
    display: flex;
    align-items: center;
    gap: 4px;
    background-color: transparent;
    transition: background-color 0.2s ease;
}

.display-area.has-value {
    background-color: rgba(235, 242, 255, 1);
}

.display-area.required {
    background-color: rgba(235, 242, 255, 1);
}

.content-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 4px;
}

.placeholder-text {
    color: rgba(0, 0, 0, 0.42);
    font-size: 14px;
}

.required-placeholder {
    color: rgba(126, 172, 251, 1);
}

.value-display {
    display: flex;
    align-items: center;
    gap: 4px;
}

.tab-label {
    color: rgba(0, 77, 185, 1);
    font-size: 14px;
    pointer-events: none;
}

.equals-sign {
    color: rgba(0, 77, 185, 1);
    font-size: 14px;
    pointer-events: none;
}

.value-item {
    position: relative;
    display: inline-flex;
    align-items: center;
}

.value-text {
    color: rgba(0, 77, 185, 1);
    font-size: 14px;
    pointer-events: none;
}

.comma {
    color: rgba(0, 77, 185, 1);
    font-size: 14px;
    pointer-events: none;
}

.remove-button {
    position: absolute;
    right: -4px;
    top: -3px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.45);
    color: white;
    border: none;
    cursor: pointer;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all 100ms linear;
    pointer-events: none;
}

.value-item:hover .remove-button {
    pointer-events: auto;
    opacity: 1;
}

.dropdown-arrow {
    color: rgba(0, 0, 0, 0.42);
    font-size: 12px;
    transition: transform 0.2s ease;
}

.required-arrow {
    color: rgba(126, 172, 251, 1);
}

.display-area:hover .dropdown-arrow {
    transform: rotate(180deg);
}

.base-panel {
    background-color: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    max-height: 500px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    max-width: 90vw;
}
</style>

<style>
.value-item:hover .remove-button {
    pointer-events: auto !important;
    opacity: 1 !important;
}
</style>
