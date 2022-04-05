<template>
  <div class="about">
    <h1>This is d3 flow chart page</h1>
    <div class="d3-flow-chart">
      <FlowChart
        :data="data"
        :class-id="1"
        :start-date="startDate"
        :end-date="endDate"
      />
    </div>
  </div>
</template>

<script>
import FlowChart from "../components/FlowChart/FlowChart.vue";
import GET_DATA_PATTERN from "../assets/dumpDataForFlowChart.json";

export default {
  name: "D3-Flow-Chart",
  components: {
    FlowChart,
  },
  data: () => ({
    data: GET_DATA_PATTERN,
    startDate: new Date("2021/2/10"),
    endDate: new Date(),
  }),
};
</script>

<style lang="scss" scoped>
.d3-flow-chart {
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
