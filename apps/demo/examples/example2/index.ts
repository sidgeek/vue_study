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
    },
  });
  console.time('render');
  const renderStart = new Date().getTime();
  chart.render().then(() => {
    console.log('render complete', new Date().getTime() - renderStart);
    console.timeEnd('render');
  });
}
