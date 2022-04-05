<template>
  <div class="about">
    <h1>This is contribution graph page</h1>
    <div class="date-picker">
      <datepicker
        v-model="selectedDate"
        :format="format"
        placeholder="end date"
      ></datepicker>
    </div>
    <div class="contribution-graph-container">
      <ContributionGraph
        :values="data"
        :range-color="rangeColor"
        :end-date="endDate"
        :is-tooltip="isTooltip"
      />
      <D3ContributionGraph
        :values="data"
        :range-color="rangeColor"
        :end-date="endDate"
        :is-tooltip="isTooltip"
      />
    </div>
  </div>
</template>
<script>
import Datepicker from "vuejs-datepicker";
import ContributionGraph from "../components/ContributionGraph/ContributionGraph.vue";
import D3ContributionGraph from "../components/ContributionGraph/D3ContributionGraph.vue";
import GRAPH_DATA_PATTERN from "../assets/dumpDataForContributionGraph.json";

export default {
  name: "Contribution-Graph",
  components: {
    Datepicker,
    ContributionGraph,
    D3ContributionGraph,
  },
  data: () => ({
    data: GRAPH_DATA_PATTERN,
    rangeColor: ["#ebedf0", "#7EDBB0", "#4FC1A6", "#2A8A75", "#145F4F"],
    selectedDate: null,
    endDate: new Date(),
    isTooltip: true,
    format: "yyyy-MM-dd",
  }),
  watch: {
    selectedDate: {
      handler() {
        if (this.selectedDate !== null) {
          this.endDate = this.selectedDate;
        }
      },
      deep: true,
      immediate: true,
    },
  },
};
</script>

<style lang="scss" scoped>
.contribution-graph-container {
  display: flex;
  width: 800px;
  height: 500px;
  border: 1px solid grey;
  margin: auto;
  flex-direction: column;
  justify-content: space-around;
  padding: 20px;
}
.date-picker {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 20px;
}
</style>
