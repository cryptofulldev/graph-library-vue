<template>
  <div
    ref="stackedChartRef"
    class="stacked-bar-chart-body"
    :class="`stacked-bar-horizontal-chart-body-${classId}`"
  >
    <svg class="stacked-bar-chart" :width="width" :height="height">
      <g :transform="`translate(${margin.left}, 10)`">
        <text
          :x="0"
          :y="`${10}`"
          font-size="20"
          font-weight="900"
          fill="#c2c2c2"
          style="position: absolute"
        >
          Country overview
        </text>
      </g>
      <g :transform="`translate(${margin.left}, ${margin.top + 10})`">
        <g class="stacked-bars" fill="none">
          <g v-for="(bar, index) in sortedData" :key="index">
            <line
              :x2="width - margin.left - margin.right"
              :transform="`translate(0, ${y(index) - barGap / 2 + 10})`"
              stroke="#c2c2c2"
              stroke-width="1"
              fill="none"
            ></line>
            <g :transform="`translate(0, 0)`" fill="none">
              <text
                :x="0"
                :y="`${y(index) + barWidth / 2 + 15}`"
                :font-size="textSize"
                font-weight="400"
                fill="#c2c2c2"
              >
                {{ areaText(bar.name) }}
              </text>
              <rect
                class="bar-rect"
                fill="#F2F2F2"
                :x="x(bar.total + bar.processed) + textWidth"
                :y="y(index)"
                :width="Math.abs(x(0) - x(bar.total))"
                :height="y.bandwidth()"
                rx="5"
              ></rect>
              <rect
                class="bar-rect"
                fill="#2A8A75"
                :x="x(bar.processed) + textWidth + 10"
                :y="y(index)"
                :width="Math.abs(x(0) - x(bar.processed))"
                :height="y.bandwidth()"
                rx="5"
              ></rect>
              <text
                :x="x(0) + textWidth + 25"
                :y="`${y(index) + barWidth / 2 + 15}`"
                :font-size="textSize"
                font-weight="900"
                fill="#c2c2c2"
              >
                {{ bar.total }}
              </text>
              <text
                :x="x(0) + textWidth + 50"
                :y="`${y(index) + barWidth / 2 + 15}`"
                :font-size="textSize"
                font-weight="900"
                fill="#c2c2c2"
              >
                |
              </text>
              <text
                :x="x(0) + textWidth + 60"
                :y="`${y(index) + barWidth / 2 + 15}`"
                :font-size="textSize"
                font-weight="900"
                fill="#2A8A75"
              >
                {{ bar.processed }}
              </text>
            </g>
          </g>
          <line
            :x2="width - margin.left - margin.right"
            :transform="`translate(0, ${
              sortedData.length * (barWidth + barGap) - barGap / 2 + 5
            })`"
            stroke="#c2c2c2"
            stroke-width="1"
            fill="none"
          ></line>
        </g>
      </g>
    </svg>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "D3HorizontalStackedBarChart",
  props: {
    data: { default: () => [], type: Array },
    barWidth: { default: 60, type: Number },
    classId: { default: 0, type: Number },
    margin: {
      default: () => ({
        top: 20,
        right: 10,
        bottom: 35,
        left: 10,
      }),
      type: Object,
    },
  },
  data: () => ({
    initialWidth: 0,
    initialHeight: 0,
    barGap: 30,
    sortedData: () => [],
  }),
  computed: {
    width() {
      return this.initialWidth;
    },
    height() {
      return (
        (this.barWidth + this.barGap) * this.data.length +
        this.margin.top +
        this.margin.bottom +
        this.barGap
      );
    },
    maxValue() {
      return d3.max(this.data, function (d) {
        return d.total + d.processed + 5;
      });
    },
    x() {
      return d3
        .scaleLinear()
        .range([
          ((this.width - this.margin.left - this.margin.right) * 3) / 5 + 30,
          0,
        ])
        .domain([0, this.maxValue]);
    },
    y() {
      return d3
        .scaleBand()
        .range([(this.barWidth + this.barGap) * this.data.length, 0])
        .domain(
          this.data.map(function (d, index) {
            return index;
          })
        )
        .padding(0.2);
    },
    textWidth() {
      return (this.width - this.margin.left - this.margin.right) / 5;
    },
    textSize() {
      return this.initialWidth < 960 ? 14 : 18;
    },
    showTextLength() {
      return this.initialWidth < 960 ? 7 : 9;
    },
  },
  watch: {
    data: {
      handler() {
        const dataCopy = [...this.data];
        dataCopy.sort((a, b) => {
          return d3.ascending(a.total + a.processed, b.total + b.processed);
        });
        this.sortedData = [...dataCopy];
      },
      immediate: true,
      deep: true,
    },
  },
  mounted() {
    this.onResize();
    window.addEventListener("resize", this.resizeFetch);
  },
  methods: {
    areaText(d) {
      return d.length > 13 ? `${d.substr(0, 13)}...` : d;
    },
    onResize() {
      if (
        this.$refs.stackedChartRef &&
        this.$refs.stackedChartRef.clientWidth > 0
      ) {
        this.initialWidth = this.$refs.stackedChartRef.clientWidth;
        this.initialHeight = this.$refs.stackedChartRef.clientHeight;
      }
    },
    resizeFetch() {
      this.onResize();
    },
  },
};
</script>

<style lang="scss" scoped>
.stacked-bar-chart-body {
  width: 100%;
  height: 100%;
  position: relative;
  overflow-x: auto;
  overflow-y: auto;
  padding-top: 20px;
}
</style>
