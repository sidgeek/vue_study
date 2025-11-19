<template>
  <div class="g2-wrapper">
    <div ref="mount" class="g2-canvas" :style="{ height: `${height}px` }"></div>
    <div class="g2-legend-side">
      <span>数据点: {{ pointsCount }}</span>
      <span style="margin-left:8px;">标签: {{ labelsCount }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, shallowRef, watch, computed } from 'vue'
import { Chart } from '@antv/g2'

type Datum = { ts?: number; date?: string; value: number; series?: string }

const props = defineProps<{ data: Datum[]; height?: number; withLabel?: boolean; tickCount?: number; useOverflowHide?: boolean }>()
const mount = ref<HTMLDivElement | null>(null)
const chart = shallowRef<Chart | null>(null)
const height = props.height ?? 300
const pointsCount = computed(() => Array.isArray(props.data) ? props.data.length : 0)
const LABELS_PER_DATUM = 5
const labelsCount = computed(() => (props.withLabel ? pointsCount.value * LABELS_PER_DATUM : 0))

function formatTs(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function init() {
  dispose()
  if (!mount.value) return
  const c = new Chart({ container: mount.value, autoFit: true })
  c.options({
    theme: 'classic',
    axis: {
      x: { title: 'date', tickCount: props.tickCount ?? 6, labelFormatter: (v: number | string) => {
        if (typeof v === 'string') return v
        const n = typeof v === 'number' ? v : Number(v)
        return Number.isFinite(n) ? formatTs(n) : String(v ?? '')
      }},
      y: { title: 'value' }
    },
    scale: { x: { type: 'band' } },
    tooltip: { shared: false, crosshairs: true },
    interaction: { tooltip: { series: true } }
  })
  c.data(props.data)
  const xField = props.data?.length && typeof props.data[0]?.date === 'string' ? 'date' : 'ts'
  const geom = c.interval()
    .encode('x', xField)
    .encode('y','value')
    .encode('color','series')
    .encode('series','series')
    .style('columnWidthRatio', 0.6)
    .transform({ type: 'dodgeX' })
    .tooltip({ title: xField, items: [{ name: 'value', channel: 'y' }] })
  if (props.withLabel) {
    geom.label([
      {
        text: 'value',
        position: 'top',
        transform: props.useOverflowHide ? [{ type: 'overflowHide' }] : []
      },
      {
        text: 'series',
        position: 'left',
        offset: 8,
        transform: props.useOverflowHide ? [{ type: 'overflowHide' }] : []
      }
    ])
  }
  c.render()
  chart.value = c
}

function dispose() { if (chart.value) { chart.value.destroy(); chart.value = null } }

watch(() => props.data, () => { if (chart.value) chart.value.changeData(props.data) }, { deep: true })
watch(() => [props.withLabel, props.tickCount, props.useOverflowHide], () => { init() }, { deep: true })

onMounted(() => init())
onBeforeUnmount(() => dispose())
</script>

<style scoped>
.g2-wrapper { position: relative; }
.g2-canvas { width: 100%; height: 100%; }
.g2-legend-side { position: absolute; top: 8px; right: 8px; display: flex; align-items: center; font-size: 12px; color: #666; background: rgba(255,255,255,0.8); padding: 2px 6px; border-radius: 4px; }
</style>