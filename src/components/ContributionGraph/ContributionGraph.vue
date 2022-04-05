<template>
  <!-- <div ref="lineChartRef" @resize="onResize"> -->
  <div class="contribution-graph">
    <calendar-heatmap
      :end-date="endDate"
      :range-color="rangeColor"
      :values="values"
      :max="max"
      :tool-tip="isTooltip"
    />
  </div>
</template>
<script>
import { CalendarHeatmap } from "vue-calendar-heatmap";

export default {
  name: "ContributionGraph",
  components: {
    CalendarHeatmap,
  },
  props: {
    endDate: { default: new Date() },
    values: { default: () => [] },
    rangeColor: { default: () => [] },
    isTooltip: { default: false },
  },
  data() {
    return {
      max: 20,
    };
  },
};
</script>

<style lang="scss" scoped>
.contribution-graph {
  width: 100%;
  height: 50%;
}
</style>
