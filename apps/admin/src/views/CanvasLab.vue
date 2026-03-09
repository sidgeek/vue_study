<template>
  <div class="canvas-lab-page">
    <div class="header mb16">
      <h2>{{ $t('canvas.title') }}</h2>
      <p class="subtitle">这里展示了 Canvas 开发中常见的一些坑和技巧</p>
    </div>
    
    <Canvas1px />
    
    <el-card class="mt16">
      <template #header>
        <div class="card-header">
          <span>原理总结</span>
        </div>
      </template>
      <div class="theory-content">
        <p><strong>为什么会出现 1px 模糊问题？</strong></p>
        <p>
          Canvas 的坐标系统是以像素的<strong>中心</strong>为基准的。
          当你绘制在整数坐标 (10, 10) 且线宽为 1px 时，Canvas 实际上是从 9.5 到 10.5 绘制。
          由于物理屏幕无法在 0.5 像素上发光，它会使用插值（抗锯齿）在 9 和 10 两个像素上分别显示 50% 亮度的颜色，
          最终看起来就是一条 2px 宽的灰色线。
        </p>
        <p><strong>解决方案：</strong></p>
        <ul>
          <li><strong>0.5 偏移：</strong> 将绘制坐标设为 <code>x + 0.5</code>，使 1px 的宽度正好落在像素格子内。</li>
          <li><strong>DPR 适配：</strong> 将 Canvas 画布大小扩大 <code>devicePixelRatio</code> 倍，再通过 CSS 缩小回原大小，
            并调用 <code>ctx.scale(dpr, dpr)</code>，这能从根本上解决高清屏下的模糊问题。</li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import Canvas1px from '@/components/Canvas1px.vue'
</script>

<style scoped>
.canvas-lab-page {
  max-width: 1200px;
  margin: 0 auto;
}
.header {
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}
.subtitle {
  color: #888;
  font-size: 14px;
}
.theory-content {
  line-height: 1.6;
  font-size: 14px;
}
.mt16 { margin-top: 16px; }
.mb16 { margin-bottom: 16px; }
</style>
