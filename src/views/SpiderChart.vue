<template>
  <div class="about">
    <h1>This is spider chart page</h1>
    <div class="spider-chart">
      <SpiderChart class="chart" :d="data" />
    </div>
  </div>
</template>
<script>
import SpiderChart from "../components/SpiderChart/SpiderChart.vue";
import CHART_DATA_PATTERN from "../assets/dumpDataForSpiderChart.json";

export default {
  name: "Spider-Chart",
  components: {
    SpiderChart,
  },
  data: () => ({
    data: CHART_DATA_PATTERN,
    loading: false,
    selectedBars: [],
  }),
};
</script>

<style lang="scss" scoped>
.spider-chart {
  display: flex;
  width: 800px;
  height: 500px;
  border: 1px solid grey;
  margin: auto;
}
</style>
