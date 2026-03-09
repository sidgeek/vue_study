<template>
  <div class="canvas-1px-container">
    <el-card class="mb16">
      <template #header>
        <div class="card-header">
          <span>Canvas 1px 像素问题演示</span>
        </div>
      </template>
      
      <div class="demo-grid">
        <div class="demo-item">
          <h4>1. 默认绘制 (出现模糊)</h4>
          <p class="desc">在整数坐标 (10, 10) 绘制 1px 宽度的线，线会跨越像素边界导致模糊（变成 2px 灰线）。</p>
          <canvas ref="canvasBlur" width="200" height="100" class="demo-canvas"></canvas>
        </div>

        <div class="demo-item">
          <h4>2. 0.5px 偏移修复</h4>
          <p class="desc">在 (10.5, 10.5) 绘制，使线条中心对齐像素中心，线条清晰。</p>
          <canvas ref="canvasOffset" width="200" height="100" class="demo-canvas"></canvas>
        </div>

        <div class="demo-item">
          <h4>3. 高清屏 (DPR) 适配修复</h4>
          <p class="desc">根据 devicePixelRatio 缩放画布，这是解决 Retina 屏幕模糊的通用方案。</p>
          <canvas ref="canvasDPR" width="200" height="100" class="demo-canvas"></canvas>
        </div>
      </div>

      <div class="comparison-zoom mt16">
        <h4>放大对比 (Zoomed)</h4>
        <div class="zoom-box">
          <div class="zoom-item">
            <span>模糊</span>
            <canvas ref="zoomBlur" width="100" height="100" class="zoom-canvas"></canvas>
          </div>
          <div class="zoom-item">
            <span>清晰 (0.5px)</span>
            <canvas ref="zoomClear" width="100" height="100" class="zoom-canvas"></canvas>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const canvasBlur = ref<HTMLCanvasElement | null>(null)
const canvasOffset = ref<HTMLCanvasElement | null>(null)
const canvasDPR = ref<HTMLCanvasElement | null>(null)
const zoomBlur = ref<HTMLCanvasElement | null>(null)
const zoomClear = ref<HTMLCanvasElement | null>(null)

const drawLine = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color = '#000') => {
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.stroke()
}

const drawRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color = '#000') => {
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, w, h)
}

const initBlur = () => {
  const canvas = canvasBlur.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  // 绘制在整数坐标
  drawLine(ctx, 10, 10, 190, 10)
  drawRect(ctx, 10, 30, 50, 50)
  ctx.fillText('Integer Coord (10, 10)', 70, 60)
}

const initOffset = () => {
  const canvas = canvasOffset.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  // 绘制在 0.5 坐标
  drawLine(ctx, 10.5, 10.5, 190.5, 10.5)
  drawRect(ctx, 10.5, 30.5, 50, 50)
  ctx.fillText('0.5 Offset (10.5, 10.5)', 70, 60)
}

const initDPR = () => {
  const canvas = canvasDPR.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const width = 200
  const height = 100

  // 物理像素大小
  canvas.width = width * dpr
  canvas.height = height * dpr
  // 显示大小
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  // 缩放上下文
  ctx.scale(dpr, dpr)

  drawLine(ctx, 10, 10, 190, 10)
  drawRect(ctx, 10, 30, 50, 50)
  ctx.fillText(`DPR: ${dpr} Scaled`, 70, 60)
}

const initZoom = () => {
  const zBlur = zoomBlur.value
  const zClear = zoomClear.value
  if (!zBlur || !zClear) return
  
  const ctxB = zBlur.getContext('2d')
  const ctxC = zClear.getContext('2d')
  if (!ctxB || !ctxC) return

  // 禁用图像平滑以展示像素细节
  ctxB.imageSmoothingEnabled = false
  ctxC.imageSmoothingEnabled = false

  // 模拟放大效果：绘制一个巨大的像素块
  // 模糊效果：在 (5, 5) 绘制 1px 线，在放大 10 倍的情况下
  ctxB.fillStyle = '#eee'
  ctxB.fillRect(0, 0, 100, 100)
  
  // 模拟模糊的 1px 线（实际上占据了 2 个物理像素）
  ctxB.fillStyle = 'rgba(0,0,0,0.5)' 
  ctxB.fillRect(40, 0, 20, 100) // 占据 2 个大像素宽

  // 清晰效果
  ctxC.fillStyle = '#eee'
  ctxC.fillRect(0, 0, 100, 100)
  ctxC.fillStyle = '#000'
  ctxC.fillRect(50, 0, 10, 100) // 占据 1 个大像素宽
}

onMounted(() => {
  initBlur()
  initOffset()
  initDPR()
  initZoom()
})
</script>

<style scoped>
.canvas-1px-container {
  padding: 10px;
}
.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}
.demo-item {
  border: 1px solid #eee;
  padding: 15px;
  border-radius: 8px;
}
.desc {
  font-size: 12px;
  color: #666;
  margin-bottom: 10px;
}
.demo-canvas {
  background: #f9f9f9;
  border: 1px solid #ddd;
  display: block;
}
.zoom-box {
  display: flex;
  gap: 40px;
  margin-top: 10px;
}
.zoom-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.zoom-canvas {
  width: 100px;
  height: 100px;
  border: 1px solid #333;
  image-rendering: pixelated; /* 关键：展示像素点 */
}
.mb16 { margin-bottom: 16px; }
.mt16 { margin-top: 16px; }
</style>
