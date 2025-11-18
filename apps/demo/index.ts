import { Chart, ChartEvent } from "@antv/g2";
import mockData from "./mockData";
import _ from "lodash";

const viewData = Array(10)
  .fill(1)
  .reduce((acc, cur, type) => {
    Array(80 * 1)
      .fill(1)
      .forEach((_, x) => {
        acc.push({
          CMT_GLOBAL_ASPECT: x,
          CMT_EMOTION_TYPE: type.toString(),
          CMT_ASPECT_POSITIVE_VOLUME_RATE: Math.ceil(Math.random() * 100),
        });
      });
    return acc;
  }, []);

const chart = new Chart({
  container: "container",
  autoFit: true,
});

const options = {
  type: "view",
  data: mockData.flat(),
  // insetBottom: 12,
  // paddingBottom: 24,
  children: [
    {
      type: "interval",
      encode: {
        x: "CMT_GLOBAL_ASPECT",
        y: (d) => d.CMT_ASPECT_POSITIVE_VOLUME_RATE * 100,
        series: "CMT_EMOTION_TYPE",
        color: "CMT_EMOTION_TYPE",
      },
      transform: [
        { type: "groupX", y: "sum" },
        { type: "dodgeX" }
      ],
      labels: [
        {
          text: (d) => Math.round(d.CMT_ASPECT_POSITIVE_VOLUME_RATE * 100),
          position: "top",
          offset: 6,
          transform: [
            // { type: "exceedAdjust" },
            { type: "overflowHide" },
            // { type: "overlapHide" }
          ],
        },
      ],
      axis: {
        x: { tickCount: 1, labelAutoHide: true },
        y: { title: "正面占比(%)" },
      },
      scale: {
        x: { type: "band" },
        y: { domain: [0, 100], nice: true },
      },
    },
  ],
};

chart.options(options);
chart.render();
