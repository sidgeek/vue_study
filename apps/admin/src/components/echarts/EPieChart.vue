<template>
  <div ref="root" class="echart" :style="{ height: `${height}px` }"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { UniversalTransition } from 'echarts/features'

echarts.use([PieChart, TitleComponent, TooltipComponent, LegendComponent, CanvasRenderer, UniversalTransition])

type PieItem = { name: string; value: number }
const props = defineProps<{ title?: string; data: PieItem[]; dark?: boolean; height?: number }>()
const emit = defineEmits<{ (e: 'click', payload: any): void }>()

const root = ref<HTMLDivElement | null>(null)
const chart = shallowRef<echarts.EChartsType | null>(null)
const h = props.height ?? 320
const height = ref(h)

function init() {
  dispose()
  if (!root.value) return
  chart.value = echarts.init(root.value, props.dark ? 'dark' : undefined)
  setOption()
  bindEvents()
}

function dispose() {
  if (chart.value) { chart.value.dispose(); chart.value = null }
}

function setOption() {
  if (!chart.value) return
  chart.value.setOption({
    title: { text: props.title || '' },
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      { type: 'pie', radius: '60%', data: props.data, emphasis: { itemStyle: { shadowBlur: 6, shadowOffsetX: 0 } } }
    ]
  })
}

function bindEvents() {
  if (!chart.value) return
  chart.value.on('click', (p: any) => emit('click', p))
}

function resize() { if (chart.value) chart.value.resize() }

watch(() => props.data, () => setOption(), { deep: true })
watch(() => props.dark, () => init())

onMounted(() => { init(); window.addEventListener('resize', resize) })
onBeforeUnmount(() => { window.removeEventListener('resize', resize); dispose() })
</script>

<style scoped>
.echart { width: 100%; }
</style>