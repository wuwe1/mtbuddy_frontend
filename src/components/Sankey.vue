<script setup lang="ts">
import { init } from 'echarts'
import data from '../data/sankey.json'
onMounted(() => {
  const chart = init(document.getElementById('sankey')!)
  chart.hideLoading()
  chart.setOption(
    {
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
      },
      series: [
        {
          type: 'sankey',
          data: data.nodes,
          links: data.links,
          emphasis: {
            focus: 'adjacency',
          },
          lineStyle: {
            color: 'gradient',
            curveness: 0.5,
          },
        },
      ],
    },
  )
})
</script>

<template>
  <div id="sankey" w-max-200 h-600 m-auto />
</template>
