/**
 * 将包含插槽标记的文本转换为Slate编辑器节点
 * @param inputText 包含插槽标记的文本，支持[placeholder]格式
 * @returns Slate编辑器节点数组
 */
export function transformInputText(inputText, isSpecialInput) {
    // 匹配模式：[] 或 ${}
    const combinedRegex = /(\[.*?\]|\${.*?})/g;
    const bracketRegex = /^\[(.*?)\]$/;
    const curlyRegex = /^\${(.*?)}$/;

    let lastIndex = 0; // 记录上一次匹配结束的位置
    const children = []; // 存储所有节点

    // 查找所有匹配项
    const matches = inputText.match(combinedRegex) || [];
    const matchPositions = [];

    // 记录每个匹配的位置
    let tempInput = inputText;
    matches.forEach(match => {
        const index = tempInput.indexOf(match);
        if (index !== -1) {
            matchPositions.push({
                match,
                index: inputText.length - tempInput.length + index,
                length: match.length,
            });
            // 替换已找到的匹配，以便找到下一个相同的匹配
            tempInput = tempInput.substring(0, index) + ''.padStart(match.length, ' ') + tempInput.substring(index + match.length);
        }
    });

    // 按位置排序匹配结果
    matchPositions.sort((a, b) => a.index - b.index);

    // 若开头是插槽，补一个空文本（需要带空格，否则Slate会自动将自定义元素换行）
    if (matchPositions.length > 0 && matchPositions[0].index === 0) {
        children.push({ text: ' ' });
    }

    // 处理所有匹配项
    matchPositions.forEach(position => {
        // 如果当前匹配位置和上一次结束位置之间有文本，就把这段文本作为普通文本节点
        if (position.index > lastIndex) {
            children.push({ text: inputText.slice(lastIndex, position.index) });
        }

        const matchText = position.match;
        let type = 'input';
        let placeholder = '';
        let isSelectInput = false;

        // 判断是[]还是${}格式
        if (bracketRegex.test(matchText)) {
            // [] 格式
            const bracketMatch = matchText.match(bracketRegex);
            placeholder = bracketMatch ? bracketMatch[1] : '';
            isSelectInput = isSpecialInput?.(placeholder);
            type = isSelectInput ? 'select' : 'input';
        } else if (curlyRegex.test(matchText)) {
            // ${} 格式
            const curlyMatch = matchText.match(curlyRegex);
            placeholder = curlyMatch ? curlyMatch[1] : '';
            type = 'select';
        }

        // 添加输入插槽节点
        children.push({
            type,
            children: [{ text: '' }],
            placeholder,
            isSelectInput,
        });

        // 更新 lastIndex 为当前匹配结束的位置
        lastIndex = position.index + position.length;
    });

    if (lastIndex === inputText.length) {
        // 尾部是插槽，补一个空文本
        children.push({ text: ' ' });
    } else if (lastIndex < inputText.length) {
        // 如果最后一个匹配项后面还有文本，就把剩余文本作为普通文本节点
        children.push({ text: inputText.slice(lastIndex) });
    }

    // 返回编辑器的内容
    return [
        {
            type: 'paragraph',
            children,
        },
    ];
}

/**
 * 从Slate编辑器节点中提取最终的文本内容
 * @param children Slate编辑器子节点
 * @param inputSlotValues 输入插槽的值映射
 * @returns 最终的文本内容
 */
export function extractTextFromSlate(children, inputSlotValues) {
    if (!children || children.length === 0) return '';

    let result = '';
    children.forEach((node, index) => {
        if (node.type === 'input') {
            result += inputSlotValues.get(index) || node.placeholder || '';
        } else if (node.text) {
            result += node.text;
        }
    });

    return result;
}
