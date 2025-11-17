<template>
  <div ref="mount" class="g2-canvas" :style="{ height: `${height}px` }"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { Chart } from '@antv/g2'

type Datum = { ts: number; value: number; series?: string }

const props = defineProps<{ data: Datum[]; height?: number; withLabel?: boolean; tickCount?: number; labelMode?: 'none'|'simple'|'complex'; labelStep?: number }>()

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
    scale: { x: { type: 'time', nice: true } },
    tooltip: { shared: true, title: (d: any) => {
      const t = (Array.isArray(d) ? d[0]?.ts : d?.ts) ?? 0
      return formatTs(Number(t))
    } }
  })
  const withIndex = props.data.map((d, i) => ({ ...d, __idx: i }))
  c.data(withIndex)
  const geom = c.line()
    .encode('x','ts')
    .encode('y','value')
    .encode('color','series')
    .encode('series','series')
  const showLabel = props.labelMode === 'complex' || props.withLabel === true
  const step = props.labelStep ?? 1
  if (showLabel && step <= 1) {
    const isComplex = props.labelMode === 'complex'
    if (isComplex) {
      geom.label({
        text: (d: any) => {
          const t = Number(d?.ts ?? 0)
          const dt = new Date(t)
          const y = dt.getFullYear()
          const m = String(dt.getMonth()+1).padStart(2,'0')
          const dd = String(dt.getDate()).padStart(2,'0')
          const h = String(dt.getHours()).padStart(2,'0')
          const dow = ['日','一','二','三','四','五','六'][dt.getDay()]
          const q = Math.floor(dt.getMonth()/3) + 1
          const v = Number(d?.value ?? 0)
          const cat = v >= 80 ? '高' : v >= 50 ? '中' : '低'
          const pct = `${Math.round(v)}%`
          const series = String(d?.series ?? '')
          return `${y}-${m}-${dd} ${h}:00 周${dow} Q${q}\n${series}: ${v}\n${cat} · ${pct}`
        },
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
  if (showLabel && step > 1) {
    const isComplex = props.labelMode === 'complex'
    if (isComplex) {
      geom.label({
        text: (d: any) => {
          const idx = Number(d?.__idx ?? -1)
          if (idx < 0 || idx % step !== 0) return ''
          const t = Number(d?.ts ?? 0)
          const dt = new Date(t)
          const y = dt.getFullYear()
          const m = String(dt.getMonth()+1).padStart(2,'0')
          const dd = String(dt.getDate()).padStart(2,'0')
          const h = String(dt.getHours()).padStart(2,'0')
          const dow = ['日','一','二','三','四','五','六'][dt.getDay()]
          const q = Math.floor(dt.getMonth()/3) + 1
          const v = Number(d?.value ?? 0)
          const cat = v >= 80 ? '高' : v >= 50 ? '中' : '低'
          const pct = `${Math.round(v)}%`
          const series = String(d?.series ?? '')
          return `${y}-${m}-${dd} ${h}:00 周${dow} Q${q}\n${series}: ${v}\n${cat} · ${pct}`
        },
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
      geom.label({
        text: 'value',
        formatter: (text: any, d: any) => ((Number(d?.__idx ?? -1) % step) === 0 ? String(text ?? '') : '')
      })
    }
  }
  c.render()
  chart.value = c
}

function dispose() { if (chart.value) { chart.value.destroy(); chart.value = null } }

watch(() => props.data, () => {
  if (chart.value) {
    const withIndex2 = props.data.map((d, i) => ({ ...d, __idx: i }))
    chart.value.changeData(withIndex2)
  }
}, { deep: true })

watch(() => [props.withLabel, props.tickCount, props.labelMode, props.labelStep], () => {
  init()
}, { deep: true })

onMounted(() => init())
onBeforeUnmount(() => dispose())
</script>

<style scoped>
.g2-canvas { width: 100%; }
</style>