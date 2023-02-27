<script setup lang="ts">
import type { EChartsType } from 'echarts'
import { init } from 'echarts'
import VueDatePicker from '@vuepic/vue-datepicker'
import data from '../data/sankey.json'

defineOptions({
  name: 'IndexPage',
})

const limit = $ref('')
const skip = $ref('')
const date = $ref([new Date('2023-01-02'), new Date('2023-01-03')])
const from = $ref('')
const to = $ref('')
let count = $ref(0)
const LATEST_TX_DATE = new Date(data.transactions[0].date * 1000).toLocaleString()
const OLDEST_TX_DATE = new Date(data.transactions[data.transactions.length - 1].date * 1000).toLocaleString()

interface LINK {
  source: string
  target: string
  value: number
  date: number
}

interface NODE {
  name: string
}

interface TransactionData {
  source: string
  target: string
  value: number
  date: number
  unit: string
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
            formatter: ({ data }: { data: TransactionData }) => {
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
const render = () => {
  const normalize = (d: Date) => {
    return d.getTime() / 1000
  }
  let txns = data.transactions.filter((tx) => {
    const [dateFrom, dateTo] = date
    return normalize(dateFrom) <= tx.date && tx.date <= normalize(dateTo)
  })
  const _from = from.trim()
  if (_from.length > 0) {
    txns = txns.filter((tx) => {
      return tx.source.toLowerCase().includes(_from.toLowerCase())
    })
  }
  const _to = to.trim()
  if (_to.length > 0) {
    txns = txns.filter((tx) => {
      return tx.target.toLowerCase().includes(_to.toLowerCase())
    })
  }

  count = txns.length
  const _skip = Number(skip) ? Number(skip) : 0
  const _limit = Number(limit) ? Number(limit) : 200
  drawSankey(chartInstance, txns.slice(_skip, _skip + _limit))
}

onMounted(() => {
  chartInstance = init(document.getElementById('sankey')!)
  chartInstance.hideLoading()
  render()
})
</script>

<template>
  <div class="flex h-screen">
    <!-- Sidebar -->
    <div class="border-r dark:border-slate-600/75 w-68 flex-shrink-0">
      <div p-2>
        <div i-carbon-basketball text-4xl inline-block />
        <p
          text-xl font-bold text-transparent font-sans
          bg-clip-text bg-gradient-to-r
          from-yellow-500 to-blue-500
        >
          Misttrack Alert Buddy
        </p>
      </div>
      <div border-t class="dark:border-slate-600/75">
        <Cell label="total txns" :value="data.transactions.length" />
        <Cell label="unique from" :value="data.unique_from.length" />
        <Cell label="unique to" :value="data.unique_to.length" />
        <Cell label="date of oldest tx" :value="OLDEST_TX_DATE" />
        <Cell label="date of latest tx" :value="LATEST_TX_DATE" />
        <Cell label="txns in range" :value="count" />
        <CellInput v-model="from" label="from" />
        <CellInput v-model="to" label="to" />
        <CellInput v-model="skip" label="skip" placeholder="0" />
        <CellInput v-model="limit" label="limit" placeholder="200" />

        <div py-2 flex justify-center>
          <VueDatePicker v-model="date" range inline :dark="isDark" />
        </div>

        <Cell label="date (from)" :value="date[0].toLocaleString()" />
        <Cell label="date (to)" :value="date[1].toLocaleString()" />

        <!-- :disabled="!isValidDate(dateFrom) || !isValidDate(dateTo)" -->
        <button
          h-8 text-sm btn block w-full rounded-none
          mt-2
          bg-blue-700 hover:bg-blue-500 active:bg-blue-300
          @click="render"
        >
          Go
        </button>
      </div>
      <Footer />
    </div>

    <!-- Content -->
    <div w-full>
      <div id="sankey" py-8 max-w-screen-md h-screen m-auto overflow-hidden />
    </div>
  </div>
</template>
