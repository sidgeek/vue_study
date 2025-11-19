// Import stylesheets
import { Chart } from '@antv/g2';
import mockData from './mock';

export default function run() {
  const chart = new Chart({
    container: 'container',
    theme: 'classic',
    autoFit: true,
  });
  chart.interaction('tooltip', {
    position: 'auto',
  });
  chart.options({
    type: 'interval',
    data: mockData,
    encode: {
      x: '地区',
      y: 'sale',
      color: '城市',
      tooltip: ['地区', '城市', 'sale'],
    },
    legend: false, // 关闭图例，加载时间缩短
    labels: [
      {
        text: (d) => d.sale,
        position: 'top',
        offset: 6,
        transform: [
          { type: 'overflowHide' },
        ],
      },
    ],
  });
  console.time('render');
  const renderStart = new Date().getTime();
  chart.render().then(() => {
    console.log('render complete', new Date().getTime() - renderStart);
    console.timeEnd('render');
  });
}
