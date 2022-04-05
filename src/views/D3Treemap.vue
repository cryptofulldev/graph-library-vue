<template>
  <div class="about">
    <h1>This is treemap graph page</h1>
    <div class="treemap-graph">
      <Treemap :class-id="1" :data="data" :range-color="rangeColor" />
    </div>
  </div>
</template>
<script>
import Treemap from "../components/Treemap/Treemap.vue";
import CHART_DATA_PATTERN from "../assets/dumpDataForTreemap.json";

export default {
  name: "Treemap-Chart",
  components: {
    Treemap,
  },
  data: () => ({
    data: CHART_DATA_PATTERN,
    rangeColor: ["#97D4FA", "#74B8E3", "#5195C2", "#2E77AD", "#2A668C"],
    loading: false,
    selectedBars: [],
  }),
};
</script>

<style lang="scss" scoped>
.treemap-graph {
  display: flex;
  width: 800px;
  height: 500px;
  // border: 1px solid grey;
  margin: auto;
}
</style>
