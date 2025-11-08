<template>
  <div class="monaco-container">
    <div ref="editor" class="monaco-my-editor"></div>
    <div class="control-panel-float">
      <Panel v-model:language="currentLanguage" @change="handleLanguageChange" @format="formatMarkdown" />
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref, watch } from "vue";
import * as Monaco from "monaco-editor";
// 引入所有编辑器功能（包含查找）
import "monaco-editor/esm/vs/editor/editor.all";
import Panel from "./panel.vue";
import eventRegister from "./eventRegister.js";

const props = defineProps({
  language: {
    type: String,
    required: true,
    default: "plaintext",
  },
  modelValue: {
    type: String,
  },
});

const emit = defineEmits();

let monacoInstance;
const latestFocus = ref(0);
const isFocus = ref(false);
const model = ref(props.modelValue || "");

// SQL关键字列表（用于语法高亮）
const SQL_KEYWORDS = [];

const disposers = [];
const watchers = [];

// 编辑器与语言状态引用
const editor = ref();
const currentLanguage = ref("plaintext");

const handleLanguageChange = (modelValue) => {
  const newLanguage = modelValue;
  if (monacoInstance) {
    const editorModel = monacoInstance.getModel();
    if (editorModel) {
      // 动态切换编辑器语言
      Monaco.editor.setModelLanguage(editorModel, newLanguage);

      // 根据语言切换主题
      const theme =
        newLanguage === "template-markdown" ? "template-theme" : "vs";
      Monaco.editor.setTheme(theme);
    }
  }
};

// Markdown内容格式化逻辑
const formatMarkdownContent = (content) => {
  const lines = content.split("\n");
  const formattedLines = [];
  let inCodeBlock = false;
  let codeBlockLang = "";

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // 检查代码块
    if (line.trim().startsWith("```")) {
      if (!inCodeBlock) {
        // 开始代码块
        inCodeBlock = true;
        codeBlockLang = line.trim().substring(3).trim();
        formattedLines.push(`\`\`\`${codeBlockLang}`);
      } else {
        // 结束代码块
        inCodeBlock = false;
        formattedLines.push("```");
      }
    } else if (inCodeBlock) {
      // 在代码块内部，保持原样
      formattedLines.push(line);
    } else {
      // 在代码块外部，进行格式化
      // 格式化标题
      if (line.trim().match(/^#{1,6}\s+/)) {
        const hashMatch = line.trim().match(/^(#{1,6})\s+(.+)$/);
        if (hashMatch) {
          const hashes = hashMatch[1];
          const title = hashMatch[2].trim();
          line = `${hashes} ${title}`;
        }
      }

      // 格式化无序列表
      if (line.trim().match(/^[-*+]\s+/)) {
        const listContent = line.trim().substring(2).trim();
        const indent = line.match(/^(.*?)\s+/)?.[1] || "";
        line = `${indent}- ${listContent}`;
      }

      // 格式化有序列表
      if (line.trim().match(/^\d+\.\s+/)) {
        const match = line.trim().match(/^(\d+)\.\s+(.+)$/);
        if (match) {
          const number = match[1];
          const listText = match[2].trim();
          const indent = line.match(/^(\s*)/)?.[1] || "";
          line = `${indent}${number}. ${listText}`;
        }
      }

      // 格式化引用
      if (line.trim().startsWith(">")) {
        const quoteContent = line.trim().substring(1).trim();
        const indent = line.match(/^(\s*)/)?.[1] || "";
        line = `${indent}> ${quoteContent}`;
      }

      formattedLines.push(line.trimEnd());
    }
  }

  // 规范化空行
  const result = formattedLines.join("\n");

  // 移除多余的连续空行（保留最多一个空行）
  return result
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\n+/, "") // 移除开头的空行
    .replace(/\n+$/, ""); // 移除结尾的空行
};

// Markdown格式化功能
const formatMarkdown = () => {
  if (!monacoInstance) return;

  const content = monacoInstance.getValue();
  const formattedContent = formatMarkdownContent(content);

  // 保存当前光标位置
  const position = monacoInstance.getPosition();

  // 更新内容
  monacoInstance.setValue(formattedContent);

  // 尝试恢复光标位置
  if (position) {
    try {
      monacoInstance.setPosition(position);
    } catch (error) {
      // 如果位置无效，设置到文档开头
      monacoInstance.setPosition({ lineNumber: 1, column: 1 });
    }
  }
};

// 注册支持模板语法的markdown语言
const registerTemplateMarkdown = () => {
  // 注册自定义的 markdown 扩展语言 ID
  const customLanguageId = "template-markdown";

  // 检查是否已经注册过，避免重复注册
  const languages = Monaco.languages.getLanguages();
  if (languages.find((lang) => lang.id === customLanguageId)) {
    return;
  }

  // 分离单词关键词和复合关键词
  const singleWordKeywords = SQL_KEYWORDS.filter(
    (keyword) => !keyword.includes(" ")
  );
  const compoundKeywords = SQL_KEYWORDS.filter(
    (keyword) => keyword.includes(" ")
  );

  // 创建关键词匹配模式 - 只有前后都是空格或行首行尾才匹配
  const singleWordPattern = new RegExp(
    `(?:^|\\s)(${singleWordKeywords.join("|")})(?=\\s|$)`,
    "i"
  );
  const compoundPattern = new RegExp(
    `\\b(${compoundKeywords
      .map((k) => k.replace(/\s+/g, "\\s+"))
      .join("|")})\\b`,
    "i"
  );

  // 注册语言，继承自 markdown
  Monaco.languages.register({
    id: customLanguageId,
  });

  // 获取原有的 markdown 语言配置并扩展
  Monaco.languages.setMonarchTokensProvider(customLanguageId, {
    // 继承所有 markdown 的配置
    defaultToken: "invalid",
    tokenPostfix: ".md",

    // HTML 实体处理
    htmlEntity: /&(#[0-9a-f]+|#?[a-z]+);/,

    // 定义状态（状态机逻辑）
    tokenizer: {
      root: [
        // 模板语法开始标记 - 进入对应的内部状态
        [
          /\{\{/, {
            token: "template-expression-delimiter",
            next: "@templateExpression"
          }
        ],
        [
          /\{%/, {
            token: "template-statement-delimiter",
            next: "@templateStatement"
          },
        ],
        // SQL 关键词（复合/单词）
        [compoundPattern, "sql-keyword"],
        [singleWordPattern, "sql-keyword"],
        // HTML 标签
        [/<(\w+)(-\w+)*/, "tag"],
        [/<\/(\w+)(-\w+)*>/, "tag"],
        // 标题
        [/^(\s{0,3})(#{1,6})(\s*)(.*)/, ["white", "keyword.title", "white", "title"],],
        // 水平线
        [/^\s*(---+|===+)\s*$/, "keyword"],
        // 无序列表
        [/^\s*([*+-])\s+/, "keyword"],
        // 有序列表
        [/^\s*(\d+\.)\s+/, "keyword"],

        // 引用
        [/^\s*(>+)(.*)/, ["comment", ""]],

        // 代码块
        [
          /^(\s*)(`{3,}|~{3,})(\s*)((?:(?!.*`).)*)((?:`)*)$/,
          ["white", "string", "white", "string", "string"],
        ],
        [/^\s*`{3,}\s*[\w-]*\s*$/, { token: "string", next: "@codeblock" }],

        // 行内代码
        [/`[^`]+`/, "variable"],

        // 链接
        [/\[([^\]]*)\]\(([^)]+)\)/, "string"],
        [/\[([^\]]*)\]\[([^\]]+)\]/, "string"],
        [/^\s*\[([^\]]+)\]:/, "string"],

        // 图片
        [/!\[([^\]]*)\]\(([^)]+)\)/, "string"],

        // 粗体
        [/\*\*([^*]+)\*\*/, "strong"],
        [/__([^_]+)__/, "strong"],

        // 斜体
        [/\*([^*]+)\*/, "emphasis"],
        [/_([^_]+)_/, "emphasis"],

        // 删除线
        [/~~([^~]+)~~/, "emphasis"],

        // URL
        [/https?:\/\/[^\s]+/, "string"],

        // HTML 实体
        ["@htmlEntity", "string"],
        // 任何其他字符
        [/./, ""],
      ],
      // 代码块状态
      codeblock: [
        [/^\s*`{3,}\s*$/, { token: "string", next: "@pop" }],
        [/.*$/, "variable.source"]
      ],

      // 模板表达式内部状态 {{}}
      templateExpression: [
        // 结束标记，返回主状态
        [/\}\}/, { token: "template-expression-delimiter", next: "@pop" }],
        // SQL_KEYWARDS - 复合关键词
        [compoundPattern, "sql-keyword"],
        // SQL_KEYWARDS - 单词关键词
        [singleWordPattern, "sql-keyword"],
        // 其他字符
        [/./, "template-expression-content"]
      ],

      // 模板语句内部状态 {%%}
      templateStatement: [
        // 结束标记，返回主状态
        [/\%\}/, { token: "template-statement-delimiter", next: "@pop" }],
        // SQL_KEYWARDS - 复合关键词
        [compoundPattern, "sql-keyword"],
        // SQL_KEYWARDS - 单词关键词
        [singleWordPattern, "sql-keyword"],
        // 其他字符
        [/.+/, "template-statement-content"]
      ],
    }
  });

  // 定义主题颜色
  Monaco.editor.defineTheme("template-theme", {
    // 主题样式（此处省略具体实现）
    base: "vs",
    inherit: true,
    rules: [
      // 模板语法分隔符颜色
      {
        token: "template-expression-delimiter",
        foreground: "ff6b35",
        fontStyle: "bold"
      },
      {
        token: "template-statement-delimiter",
        foreground: "2196f3",
        fontStyle: "bold"
      },

      // SQL 关键词颜色
      { token: "sql-keyword", foreground: "8e44ad", fontStyle: "bold" },

      // 模板内容颜色（较淡，不突出显示）
      { token: "template-expression-content", foreground: "4C4C4C" },
      { token: "template-statement-content", foreground: "4C4C4C" },

      // Markdown 标准颜色
      { token: "keyword.title", foreground: "cb4b16", fontStyle: "bold" },
      { token: "title", foreground: "268bd2", fontStyle: "bold" },
      { token: "strong", foreground: "000000", fontStyle: "bold" },
      { token: "emphasis", foreground: "000000", fontStyle: "italic" },
      { token: "variable", foreground: "d73a49", background: "f6f8fa" },
      { token: "variable.source", foreground: "24292e", background: "f6f8fa" },
      { token: "string", foreground: "032f62" },
      { token: "keyword", foreground: "d73a49" },
      { token: "comment", foreground: "6a737d" },
      { token: "tag", foreground: "22863a" },


      // 扩展的 Markdown token
      {
        "token": "strikethrough",
        "foreground": "6a737d",
        "fontStyle": "strikethrough"
      },
      {
        "token": "list",
        "foreground": "d73a49"
      },
      {
        "token": "list.number",
        "foreground": "d73a49"
      },
      {
        "token": "blockquote",
        "foreground": "6a737d",
        "fontStyle": "italic"
      },
      {
        "token": "hr",
        "foreground": "d73a49"
      },
      {
        "token": "link",
        "foreground": "0366d6"
      },
      {
        "token": "link.url",
        "foreground": "032f62"
      },
      {
        "token": "link.title",
        "foreground": "6f42c1"
      },
      {
        "token": "image",
        "foreground": "22863a"
      },
      {
        "token": "image.url",
        "foreground": "032f62"
      },
      {
        "token": "image.alt",
        "foreground": "6f42c1"
      },
      {
        "token": "code",
        "foreground": "d73a49",
        "background": "f6f8fa"
      },
      {
        "token": "code.block",
        "foreground": "24292e",
        "background": "f6f8fa"
      },
      {
        "token": "code.language",
        "foreground": "6f42c1"
      },
      {
        "token": "table",
        "foreground": "24292e"
      },
      {
        "token": "table.header",
        "foreground": "24292e"
      },
      {
        "token": "table.delimiter",
        "foreground": "d73a49",
        "fontStyle": "bold"
      },
      {
        "token": "footnote",
        "foreground": "0366d6"
      },
      {
        "token": "footnote.ref",
        "foreground": "6f42c1"
      },
      {
        "token": "escape",
        "foreground": "d73a49"
      },
      {
        "token": "html.entity",
        "foreground": "22863a"
      },
      {
        "token": "html.tag",
        "foreground": "22863a"
      },
      {
        "token": "html.attribute",
        "foreground": "6f42c1"
      },
      {
        "token": "html.value",
        "foreground": "032f62"
      }],
    colors: {}
  });
}

const initializeMonacoEditor = () => {
  if (!monacoInstance) return;

  // 为所有语言初始化事件功能
  disposers.push(...eventRegister(monacoInstance, props));

  watchers.push(
    watch(
      () => model.value,
      (value) => {
        if (value !== monacoInstance?.getValue()) {
          monacoInstance?.setValue(value || "");
        }
      }
    ),
    watch(
      () => props.modelValue,
      (value) => {
        if (value !== model.value) {
          model.value = value || "";
        }
      },
      { immediate: true }
    )
  );

  disposers.push(
    monacoInstance.onDidChangeModelContent(() => {
      const newValue = monacoInstance?.getValue() || "";
      model.value = newValue;
      emit("change");
      emit("update:modelValue", newValue); // v-model 支持
    }),
    monacoInstance.onDidFocusEditorText(() => {
      latestFocus.value = Date.now();
      isFocus.value = true;
      emit("focus");
    }),
    monacoInstance.onDidBlurEditorText(() => {
      isFocus.value = false;
      emit("blur");
    })
  );
};

onMounted(() => {
  registerTemplateMarkdown(); // 注册自定义Markdown语言（如支持模板语法的Markdown）

  // @ts-ignore（忽略TypeScript类型检查，避免报错）
  if (editor.value) {
    monacoInstance = Monaco.editor.create(editor.value, {
      value: model.value,
      language: currentLanguage.value,
      theme: currentLanguage.value === "template-markdown" ? "template-theme" : "vs",
      automaticLayout: true,
      overviewRulerBorder: false,
      contextmenu: false,
      renderLineHighlight: "none",
      fixedOverflowWidgets: true,
      wordWrap: "on",
      find: {
        addExtraSpaceOnTop: false,
      },
      scrollbar: {
        vertical: "auto",
        horizontal: "auto",
      },
      minimap: {
        enabled: false,
      },
      automaticLayout: true,
      lineNumbers: "off",
      lineHeight: 26, // 修改每行的高度为 26px
      scrollBeyondLastLine: false, // 禁止滚动到最后一行之后，去掉底部空白
      padding: {
        top: 0,
        bottom: 10, // 去掉底部内边距
      },
      // 禁用 Unicode 高亮
      unicodeHighlight: {
        ambiguousCharacters: false,
        invisibleCharacters: false,
        nonBasicASCII: false,
      },
      // 自定义只读模式提示信息为中文
      readOnlyMessage: {
        value: "只读模式无法编辑！",
      },
    });

    // 设置Monaco编辑器的其他配置
    initializeMonacoEditor();
  }
});

</script>

<style scoped>
.monaco-container {
  background-color: grey;
  border-radius: 5px;
  height: 500px;
  border: 1px solid grey;
  position: relative;
}

.monaco-my-editor {
  height: 100%;
  width: 100%;
}

.control-panel-float {
  position: absolute;
  width: 500px;
  bottom: 12px;
  /* right: 102px; */
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10;
  opacity: 0.4;
}
</style>
