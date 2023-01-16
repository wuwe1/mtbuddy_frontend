<script setup lang="ts">
import type { EChartsType } from 'echarts'
import { init } from 'echarts'
import data from '../data/sankey.json'
const TOTAL_TXNS = data.transactions.length

defineOptions({
  name: 'IndexPage',
})

const dateFrom = $ref('2023-01-02')
const dateTo = $ref('2023-01-03')
const limit = $ref(200)
let count = $ref(0)

const isValidDate = (d: string) => {
  return /\d{2}.\d{2}.\d{2}/.test(d)
}

interface LINK {
  source: string
  target: string
  value: number
  date: number
}

interface NODE {
  name: string
}

const getNodes = (links: LINK[]): NODE[] => {
  return links
    .map(l => [l.source, l.target])
    .reduce(
      (acc, cur) => {
        return [...acc, ...cur]
      }, [],
    ).filter(
      (val, idx, arr) => arr.indexOf(val) === idx,
    ).map((name) => { return { name } })
}

const drawSankey = (chart: EChartsType, links: LINK[]) => {
  const nodes = getNodes(links)
  chart.setOption(
    {
      title: { show: false },
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
      },
      series: [
        {
          type: 'sankey',
          data: nodes,
          links,
          top: 0,
          bottom: 0,
          layoutIterations: 0,
          tooltip: {
            formatter: ({ data }) => {
              const { source, target, value, date, unit } = data
              return `${(new Date(date * 1000)).toLocaleString()} <br /> ${source} -> ${target} <br /> ${value} ${unit}`
            },
          },
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
}

let chartInstance: EChartsType
const timestamp = (d: string) => {
  return (new Date(d)).getTime() / 1000
}
const render = () => {
  const txns = data.transactions.filter((tx) => {
    return timestamp(dateFrom) <= tx.date && tx.date <= timestamp(dateTo)
  })

  count = txns.length

  drawSankey(chartInstance, txns.slice(0, limit))
}

onMounted(() => {
  chartInstance = init(document.getElementById('sankey')!)
  chartInstance.hideLoading()
  render()
})
</script>

<template>
  <div>
    <div i-carbon-basketball text-4xl inline-block />
    <p>
      Misttrack Alert Buddy
    </p>

    <span text-blue-500>
      total txns: {{ TOTAL_TXNS }}
    </span>
    <span> | </span>
    <span text-blue-500>total txns in range: {{ count }}</span>
    <br>

    <TheInput
      v-model="dateFrom"
      placeholder="2023/01/01 (from)"
      autocomplete="false"
    />

    <span m-2>-</span>

    <TheInput
      v-model="dateTo"
      placeholder="2023/01/02 (to)"
      autocomplete="false"
    />

    <span m-2 />

    <TheInput
      v-model="limit"
      placeholder="limit"
      autocomplete="false"
    />

    <button
      class="m-4 h-8 text-sm btn"
      bg-blue-700 hover:bg-blue-500 active:bg-blue-300
      :disabled="!isValidDate(dateFrom) || !isValidDate(dateTo)"
      @click="render"
    >
      Go
    </button>
    <div id="sankey" w-max-200 h-600 m-auto />
  </div>
</template>
