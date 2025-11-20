// 使用新封装的 WebComponent 的原生标签进行演示

export default function App() {
  const items = [
    { label: '准确率', value: '92%' },
    { label: '召回率', value: '88%' },
    { label: '样本数', value: 1200 },
    { label: '耗时', value: '380ms' }
  ]

  const itemsAttr = JSON.stringify(items).replace(/'/g, '&#39;')

  return (
    <div style={{ maxWidth: 800, margin: '24px auto', padding: 16 }}>
      <h2>React 自行封装并暴露的 WebComponent</h2>
      <react-analysis title="分析卡片(React)" items={JSON.stringify(items).replace(/'/g, '&#39;')}></react-analysis>

      <h2>React 使用 Admin 暴露的 WebComponent</h2>
      <analysis-result title="分析卡片" items={itemsAttr}></analysis-result>
    </div>
  )
}