<template>
  <div class="analysis-page">
    <el-row :gutter="16">
      <el-col :span="12">
        <AnalysisWidget :title="title" :items="items" @action="handleAction" />
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">SDK 挂载示例</div>
          </template>
          <div ref="sdkMount" class="sdk-mount"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
  <el-alert class="mt16" type="success" :title="message" show-icon v-if="message" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { AnalysisWidget } from '@/components/analysis'
import { createAnalysisSDK } from '@/components/analysis'

const title = '分析卡片'
const items = [
  { label: '准确率', value: '92%' },
  { label: '召回率', value: '88%' },
  { label: '样本数', value: 1200 },
  { label: '耗时', value: '380ms' }
]

const message = ref('')
function handleAction(p: { source: string }) { message.value = `组件触发: ${p.source}` }

const sdkMount = ref<HTMLDivElement | null>(null)
onMounted(() => {
  const sdk = createAnalysisSDK()
  const mountEl = sdkMount.value as HTMLDivElement
  const inst = sdk.mount(mountEl, { title: 'SDK 卡片', items })
  sdk.on('action', (p) => { message.value = `SDK触发: ${p.source}` })
  ;(mountEl as any).__sdk = { inst, sdk }
})
</script>

<style scoped>
.analysis-page { padding: 0 }
.card-header { font-weight: 600 }
.sdk-mount { min-height: 160px }
.mt16 { margin-top: 16px }
</style>