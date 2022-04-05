<template>
  <div class="about">
    <h1>This is line chart page</h1>
    <div class="bar-chart">
      <BarChart
        class="chart"
        :data-set="data"
        :showXLabel="true"
        :margin-left="20"
        :margin-top="40"
        :tick-count="10"
        :bar-padding="0.5"
        :loading="loading"
        :selected-bars="selectedBars"
        @click-bar="onClickBar"
      />
    </div>
  </div>
</template>
<script>
import BarChart from "../components/BarChart/BarChart.vue";
import CHART_DATA_PATTERN from "../assets/dumpDataForChart.json";

export default {
  name: "Line-Chart",
  components: {
    BarChart,
  },
  data: () => ({
    data: CHART_DATA_PATTERN,
    loading: false,
    selectedBars: [],
  }),
  methods: {
    onClickBar() {
      this.$emit("click-bar");
    },
  },
};
</script>

<style lang="scss" scoped>
.bar-chart {
  display: flex;
  width: 800px;
  height: 500px;
  border: 1px solid grey;
  margin: auto;
}
</style>
