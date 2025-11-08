import { editor } from 'monaco-editor';

class PlaceholderWidget {
  // editor
  // placeholder
  // domNode

  constructor(monaco, placeholder) {
    this.editor = monaco;
    this.placeholder = placeholder;

    this.domNode = document.createElement('div');
    this.domNode.innerText = placeholder;
    this.domNode.style.opacity = '0.5';
    this.domNode.style.fontSize = '12px';
    this.domNode.style.lineHeight = '26px';
    this.domNode.style.pointerEvents = 'none';
    this.domNode.style.width = '200px';

    this.editor.onDidChangeModelContent(() => this.updateVisibility());
    this.updateVisibility();
  }

  getId() {
    return 'placeholder.widget';
  }

  getDomNode() {
    return this.domNode;
  }

  getPosition() {
    const model = this.editor.getModel();
    if (!model) return null;
    const isEmpty = model.getValue().trim().length === 0;
    return isEmpty
      ? { position: { lineNumber: 1, column: 1 }, preference: [editor.ContentWidgetPositionPreference.ABOVE] }
      : null;
  }

  updateVisibility() {
    this.domNode.style.display = this.editor.getValue().trim() === '' ? 'block' : 'none';
    this.editor.layoutContentWidget(this);
  }
}

export default function (monaco, props) {
  const placeholderWidget = new PlaceholderWidget(monaco, props?.placeholder ?? '请输入');
  monaco.addContentWidget(placeholderWidget);
  return [
    {
      dispose() {
        monaco.removeContentWidget(placeholderWidget);
      },
    },
  ]
}

