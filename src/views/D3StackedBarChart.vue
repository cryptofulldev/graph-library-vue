<template>
  <div class="about">
    <h1>This is d3 stacked bar chart page</h1>
    <div class="stacked-bar-chart">
      <div class="stackedbarchart-container">
        <D3StackedBarChart
          :data="data"
          :bar-width="barWidth"
          :bar-gap="barGap"
          :class-id="1"
        />
        <div v-if="data.length === 0" class="loading-data">
          <v-progress-circular
            indeterminate
            color="grey lighten-1"
          ></v-progress-circular>
        </div>
      </div>
      <div class="horizontalstackedbarchart-container">
        <D3HorizontalStackedBarChart
          :data="jurisdictionData"
          :bar-width="barWidth - 30"
          :class-id="2"
        />
        <div v-if="jurisdictionData.length === 0" class="loading-data">
          <v-progress-circular
            indeterminate
            color="grey lighten-1"
          ></v-progress-circular>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import D3StackedBarChart from "../components/D3StackedBarChart/D3StackedBarChart.vue";
import D3HorizontalStackedBarChart from "../components/D3StackedBarChart/D3HorizontalStackedBarChart.vue";
import GET_DATA_PATTERN from "../assets/dumpDataForD3StackedbarChart.json";
import GET_DATA_PATTERN_JURISDICTION from "../assets/dumpDataForJurisdictionStackedChart.json";

export default {
  name: "D3-Stacked-Bar-Chart",
  components: {
    D3StackedBarChart,
    D3HorizontalStackedBarChart,
  },
  data: () => ({
    data: GET_DATA_PATTERN,
    jurisdictionData: GET_DATA_PATTERN_JURISDICTION,
    barWidth: 40,
    barGap: 10,
  }),
};
</script>

<style lang="scss" scoped>
.stacked-bar-chart {
  padding: 10px;
  width: 800px;
  height: 500px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex-wrap: nowrap;
  border: 1px solid grey;
  margin: auto;
  .stackedbarchart-container,
  .horizontalstackedbarchart-container {
    height: 48%;
    width: 100%;
    position: relative;
    .loading-data {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      position: absolute;
      top: 0;
      left: 0;
    }
  }
}
</style>
