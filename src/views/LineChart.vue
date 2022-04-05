<template>
  <div class="about">
    <h1>This is line chart page</h1>
    <div class="line-chart">
      <LineChart
        :data="data"
        :historicIdx="-1"
        color="#28678A"
        class="main-chart"
        :line-chart-node-distance="75"
      />
    </div>
  </div>
</template>
<script>
import LineChart from "../components/LineChart/LineChart.vue";
import LINE_CHART_DATA_PATTERN from "../assets/dumpDataForLineChart.json";

export default {
  name: "Line-Chart",
  components: {
    LineChart,
  },
  data: () => ({
    data: LINE_CHART_DATA_PATTERN,
  }),
};
</script>

<style lang="scss" scoped>
.line-chart {
  display: flex;
  width: 800px;
  height: 500px;
  border: 1px solid grey;
  padding: 10px;
  margin: auto;
}
</style>
