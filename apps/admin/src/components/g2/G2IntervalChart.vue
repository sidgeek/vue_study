<template>
  <div ref="mount" class="g2-canvas" :style="{ height: `${height}px` }"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { Chart } from '@antv/g2'

type Datum = { ts: number; value: number; series?: string }

const props = defineProps<{ data: Datum[]; height?: number; withLabel?: boolean; tickCount?: number; labelMode?: 'none'|'simple'|'complex' }>()

const mount = ref<HTMLDivElement | null>(null)
const chart = shallowRef<Chart | null>(null)
const height = props.height ?? 300

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
        const n = typeof v === 'number' ? v : Number(v)
        return Number.isFinite(n) ? formatTs(n) : String(v ?? '')
      } },
      y: { title: 'value' }
    },
    scale: { x: { type: 'time', nice: true } }
  })
  c.data(props.data)
  const geom = c.interval()
    .encode('x','ts')
    .encode('y','value')
    .encode('color','series')
    .encode('series','series')
    .transform({ type: 'dodgeX' })
  const showLabel = props.labelMode === 'complex' || props.withLabel === true
  if (showLabel) {
    const isComplex = props.labelMode === 'complex'
    if (isComplex) {
      geom.label({
        text: (d: any) => `${formatTs(Number(d?.ts ?? 0))}\n${String(d?.series ?? '')}: ${String(d?.value ?? '')}`,
        style: {
          fontSize: 12,
          fontWeight: 'bold',
          fill: '#333',
          background: { fill: 'rgba(255,255,255,0.85)', stroke: '#999', radius: 4, padding: [4,6], shadowBlur: 8, shadowColor: 'rgba(0,0,0,0.25)' }
        },
        position: 'top'
      })
      ;(geom as any).labelTransform?.([{ type: 'overlapDodgeY' }, { type: 'overlapDodgeX' }])
    } else {
      geom.label({ text: 'value', formatter: (text: any) => String(text ?? '') })
    }
  }
  c.render()
  chart.value = c
}

function dispose() { if (chart.value) { chart.value.destroy(); chart.value = null } }

watch(() => props.data, () => {
  if (chart.value) chart.value.changeData(props.data)
}, { deep: true })

watch(() => [props.withLabel, props.tickCount, props.labelMode], () => {
  init()
}, { deep: true })

onMounted(() => init())
onBeforeUnmount(() => dispose())
</script>

<style scoped>
.g2-canvas { width: 100%; }
</style>