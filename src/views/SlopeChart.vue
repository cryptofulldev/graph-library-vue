<template>
  <div class="about">
    <h1>This is d3 slope chart page</h1>
    <div class="slope-chart">
      <SlopeChart :data="data" :class-id="1" />
    </div>
  </div>
</template>

<script>
import SlopeChart from "../components/SlopeChart/SlopeChart.vue";
import GET_DATA_PATTERN from "../assets/dumpDataForSlope.json";

export default {
  name: "Slope-Chart",
  components: {
    SlopeChart,
  },
  data: () => ({
    data: GET_DATA_PATTERN,
    barWidth: 70,
    barGap: 10,
  }),
};
</script>

<style lang="scss" scoped>
.slope-chart {
  display: flex;
  width: 800px;
  height: 500px;
  border: 1px solid grey;
  margin: auto;
  flex-direction: column;
  @media screen and (max-width: 590px) {
    width: 100%;
  }
}
</style>
