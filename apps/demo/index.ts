import { Chart, ChartEvent } from "@antv/g2";
import mockData from "./mockData";
import _ from "lodash";

const viewData = Array(10)
  .fill(1)
  .reduce((acc, cur, type) => {
    Array(400 * 1)
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
  data: viewData,
  children: [
    {
      type: "interval",
      encode: {
        x: "CMT_GLOBAL_ASPECT",
        y: "CMT_ASPECT_POSITIVE_VOLUME_RATE",
        // color: "CMT_EMOTION_TYPE",
      },
      labels: [
        { text: "CMT_ASPECT_POSITIVE_VOLUME_RATE", position: "top" },
      ],
      axis: {
        y: { title: "123" },
      },
      scale: {
        x: { type: "band" },
        y: { nice: true },
      },
    },
  ],
};

chart.options(options);
chart.render();
