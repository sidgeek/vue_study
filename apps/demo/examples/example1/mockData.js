const mockData = [
  [
    {
      CMT_GLOBAL_ASPECT: "售后服务",
      CMT_EMOTION_TYPE: "消息正面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0.0027,
    },
    {
      CMT_GLOBAL_ASPECT: "售后服务",
      CMT_EMOTION_TYPE: "消息负面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0.0001,
    },
    {
      CMT_GLOBAL_ASPECT: "售后服务",
      CMT_EMOTION_TYPE: "消息中性情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "售后服务",
      CMT_EMOTION_TYPE: "消息混合情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "售后服务",
      CMT_EMOTION_TYPE: "未知情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "售后服务",
      CMT_EMOTION_TYPE: "消息正面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0.0027,
    },
    {
      CMT_GLOBAL_ASPECT: "售后服务",
      CMT_EMOTION_TYPE: "消息负面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0.0001,
    },
    {
      CMT_GLOBAL_ASPECT: "售后服务",
      CMT_EMOTION_TYPE: "消息中性情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "售后服务",
      CMT_EMOTION_TYPE: "消息混合情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "售后服务",
      CMT_EMOTION_TYPE: "未知情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "响应时间",
      CMT_EMOTION_TYPE: "消息正面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0.0057,
    },
    {
      CMT_GLOBAL_ASPECT: "响应时间",
      CMT_EMOTION_TYPE: "消息负面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0.0001,
    },
    {
      CMT_GLOBAL_ASPECT: "响应时间",
      CMT_EMOTION_TYPE: "消息中性情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "响应时间",
      CMT_EMOTION_TYPE: "消息混合情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "响应时间",
      CMT_EMOTION_TYPE: "未知情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "响应时间",
      CMT_EMOTION_TYPE: "消息正面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0.0057,
    },
    {
      CMT_GLOBAL_ASPECT: "响应时间",
      CMT_EMOTION_TYPE: "消息负面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0.0001,
    },
    {
      CMT_GLOBAL_ASPECT: "响应时间",
      CMT_EMOTION_TYPE: "消息中性情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "响应时间",
      CMT_EMOTION_TYPE: "消息混合情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "响应时间",
      CMT_EMOTION_TYPE: "未知情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "变焦倍数",
      CMT_EMOTION_TYPE: "消息正面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "变焦倍数",
      CMT_EMOTION_TYPE: "消息负面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "变焦倍数",
      CMT_EMOTION_TYPE: "消息中性情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "变焦倍数",
      CMT_EMOTION_TYPE: "消息混合情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "变焦倍数",
      CMT_EMOTION_TYPE: "未知情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "变焦倍数",
      CMT_EMOTION_TYPE: "消息正面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "变焦倍数",
      CMT_EMOTION_TYPE: "消息负面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "变焦倍数",
      CMT_EMOTION_TYPE: "消息中性情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "变焦倍数",
      CMT_EMOTION_TYPE: "消息混合情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "变焦倍数",
      CMT_EMOTION_TYPE: "未知情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "发货速度",
      CMT_EMOTION_TYPE: "消息正面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0.0416,
    },
    {
      CMT_GLOBAL_ASPECT: "发货速度",
      CMT_EMOTION_TYPE: "消息负面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0.0005,
    },
    {
      CMT_GLOBAL_ASPECT: "发货速度",
      CMT_EMOTION_TYPE: "消息中性情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "发货速度",
      CMT_EMOTION_TYPE: "消息混合情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "发货速度",
      CMT_EMOTION_TYPE: "未知情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "发货速度",
      CMT_EMOTION_TYPE: "消息正面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0.0416,
    },
    {
      CMT_GLOBAL_ASPECT: "发货速度",
      CMT_EMOTION_TYPE: "消息负面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0.0005,
    },
    {
      CMT_GLOBAL_ASPECT: "发货速度",
      CMT_EMOTION_TYPE: "消息中性情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "发货速度",
      CMT_EMOTION_TYPE: "消息混合情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "发货速度",
      CMT_EMOTION_TYPE: "未知情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "发票开具",
      CMT_EMOTION_TYPE: "消息正面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0.0001,
    },
    {
      CMT_GLOBAL_ASPECT: "发票开具",
      CMT_EMOTION_TYPE: "消息负面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "发票开具",
      CMT_EMOTION_TYPE: "消息中性情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "发票开具",
      CMT_EMOTION_TYPE: "消息混合情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "发票开具",
      CMT_EMOTION_TYPE: "未知情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "发票开具",
      CMT_EMOTION_TYPE: "消息正面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0.0001,
    },
    {
      CMT_GLOBAL_ASPECT: "发票开具",
      CMT_EMOTION_TYPE: "消息负面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "发票开具",
      CMT_EMOTION_TYPE: "消息中性情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "发票开具",
      CMT_EMOTION_TYPE: "消息混合情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "发票开具",
      CMT_EMOTION_TYPE: "未知情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "发热",
      CMT_EMOTION_TYPE: "消息正面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0.0015,
    },
    {
      CMT_GLOBAL_ASPECT: "发热",
      CMT_EMOTION_TYPE: "消息负面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "发热",
      CMT_EMOTION_TYPE: "消息中性情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "发热",
      CMT_EMOTION_TYPE: "消息混合情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "发热",
      CMT_EMOTION_TYPE: "未知情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "发热",
      CMT_EMOTION_TYPE: "消息正面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0.0015,
    },
    {
      CMT_GLOBAL_ASPECT: "发热",
      CMT_EMOTION_TYPE: "消息负面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "发热",
      CMT_EMOTION_TYPE: "消息中性情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "发热",
      CMT_EMOTION_TYPE: "消息混合情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "发热",
      CMT_EMOTION_TYPE: "未知情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "双屏",
      CMT_EMOTION_TYPE: "消息正面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0.0001,
    },
    {
      CMT_GLOBAL_ASPECT: "双屏",
      CMT_EMOTION_TYPE: "消息负面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "双屏",
      CMT_EMOTION_TYPE: "消息中性情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "双屏",
      CMT_EMOTION_TYPE: "消息混合情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "双屏",
      CMT_EMOTION_TYPE: "未知情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "双屏",
      CMT_EMOTION_TYPE: "消息正面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0.0001,
    },
    {
      CMT_GLOBAL_ASPECT: "双屏",
      CMT_EMOTION_TYPE: "消息负面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "双屏",
      CMT_EMOTION_TYPE: "消息中性情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "双屏",
      CMT_EMOTION_TYPE: "消息混合情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "双屏",
      CMT_EMOTION_TYPE: "未知情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "升起摄像头",
      CMT_EMOTION_TYPE: "消息正面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "升起摄像头",
      CMT_EMOTION_TYPE: "消息负面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "升起摄像头",
      CMT_EMOTION_TYPE: "消息中性情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "升起摄像头",
      CMT_EMOTION_TYPE: "消息混合情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "升起摄像头",
      CMT_EMOTION_TYPE: "未知情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "升起摄像头",
      CMT_EMOTION_TYPE: "消息正面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "升起摄像头",
      CMT_EMOTION_TYPE: "消息负面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "升起摄像头",
      CMT_EMOTION_TYPE: "消息中性情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "升起摄像头",
      CMT_EMOTION_TYPE: "消息混合情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "升起摄像头",
      CMT_EMOTION_TYPE: "未知情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "升级后",
      CMT_EMOTION_TYPE: "消息正面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0.0002,
    },
    {
      CMT_GLOBAL_ASPECT: "升级后",
      CMT_EMOTION_TYPE: "消息负面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "升级后",
      CMT_EMOTION_TYPE: "消息中性情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "升级后",
      CMT_EMOTION_TYPE: "消息混合情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "升级后",
      CMT_EMOTION_TYPE: "未知情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "升级后",
      CMT_EMOTION_TYPE: "消息正面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0.0002,
    },
    {
      CMT_GLOBAL_ASPECT: "升级后",
      CMT_EMOTION_TYPE: "消息负面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "升级后",
      CMT_EMOTION_TYPE: "消息中性情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "升级后",
      CMT_EMOTION_TYPE: "消息混合情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "升级后",
      CMT_EMOTION_TYPE: "未知情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "包装质量",
      CMT_EMOTION_TYPE: "消息正面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0.0579,
    },
    {
      CMT_GLOBAL_ASPECT: "包装质量",
      CMT_EMOTION_TYPE: "消息负面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0.0011,
    },
    {
      CMT_GLOBAL_ASPECT: "包装质量",
      CMT_EMOTION_TYPE: "消息中性情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "包装质量",
      CMT_EMOTION_TYPE: "消息混合情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "包装质量",
      CMT_EMOTION_TYPE: "未知情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "包装质量",
      CMT_EMOTION_TYPE: "消息正面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0.0579,
    },
    {
      CMT_GLOBAL_ASPECT: "包装质量",
      CMT_EMOTION_TYPE: "消息负面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0.0011,
    },
    {
      CMT_GLOBAL_ASPECT: "包装质量",
      CMT_EMOTION_TYPE: "消息中性情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "包装质量",
      CMT_EMOTION_TYPE: "消息混合情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "包装质量",
      CMT_EMOTION_TYPE: "未知情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "包装设计",
      CMT_EMOTION_TYPE: "消息正面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0.0101,
    },
    {
      CMT_GLOBAL_ASPECT: "包装设计",
      CMT_EMOTION_TYPE: "消息负面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0.0003,
    },
    {
      CMT_GLOBAL_ASPECT: "包装设计",
      CMT_EMOTION_TYPE: "消息中性情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "包装设计",
      CMT_EMOTION_TYPE: "消息混合情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "包装设计",
      CMT_EMOTION_TYPE: "未知情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "包装设计",
      CMT_EMOTION_TYPE: "消息正面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0.0101,
    },
    {
      CMT_GLOBAL_ASPECT: "包装设计",
      CMT_EMOTION_TYPE: "消息负面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0.0003,
    },
    {
      CMT_GLOBAL_ASPECT: "包装设计",
      CMT_EMOTION_TYPE: "消息中性情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "包装设计",
      CMT_EMOTION_TYPE: "消息混合情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "包装设计",
      CMT_EMOTION_TYPE: "未知情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "包装材质",
      CMT_EMOTION_TYPE: "消息正面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0.0007,
    },
    {
      CMT_GLOBAL_ASPECT: "包装材质",
      CMT_EMOTION_TYPE: "消息负面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "包装材质",
      CMT_EMOTION_TYPE: "消息中性情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "包装材质",
      CMT_EMOTION_TYPE: "消息混合情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "包装材质",
      CMT_EMOTION_TYPE: "未知情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "包装材质",
      CMT_EMOTION_TYPE: "消息正面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0.0007,
    },
    {
      CMT_GLOBAL_ASPECT: "包装材质",
      CMT_EMOTION_TYPE: "消息负面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "包装材质",
      CMT_EMOTION_TYPE: "消息中性情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "包装材质",
      CMT_EMOTION_TYPE: "消息混合情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "包装材质",
      CMT_EMOTION_TYPE: "未知情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "其他",
      CMT_EMOTION_TYPE: "消息正面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0.0003,
    },
    {
      CMT_GLOBAL_ASPECT: "其他",
      CMT_EMOTION_TYPE: "消息负面情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "其他",
      CMT_EMOTION_TYPE: "消息中性情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "其他",
      CMT_EMOTION_TYPE: "消息混合情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
    {
      CMT_GLOBAL_ASPECT: "其他",
      CMT_EMOTION_TYPE: "未知情感",
      CMT_ASPECT_POSITIVE_VOLUME_RATE: 0,
    },
  ],
];

export default mockData;