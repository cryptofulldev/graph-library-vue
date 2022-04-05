<template>
  <div class="bar-chart-container">
    <div ref="barChartRef" v-resize @resize="onResize" class="bar-chart-rect">
      <div
        v-if="loading"
        class="d-flex justify-center align-center"
        :style="`width: 100%; height: ${height + marginTop}px;`"
      >
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
      </div>
      <svg
        v-if="!loading"
        class="barchart"
        :width="width"
        :height="height + marginTop"
      >
        <defs>
          <linearGradient id="grad_hover" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0" stop-color="#0087e0" stop-opacity="0.29" />
            <stop offset="1" stop-color="#008ce8" stop-opacity="0.071" />
          </linearGradient>
        </defs>
        <defs>
          <linearGradient
            id="grad"
            x1="0.5"
            x2="0.5"
            y2="1"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0" stop-color="#9d9d9d" stop-opacity="0.29" />
            <stop offset="0.061" stop-color="#9e9e9e" stop-opacity="0.275" />
            <stop offset="1" stop-color="#afafaf" stop-opacity="0.02" />
          </linearGradient>
        </defs>
        <g :transform="`translate(0, ${marginTop / 2})`">
          <g
            v-if="showXLabel"
            class="x-axis"
            fill="none"
            :transform="`translate(0, ${height})`"
            style="color: #888"
          >
            <g
              class="tick"
              opacity="1"
              font-size="10"
              font-family="sans-serif"
              text-anchor="middle"
              v-for="(bar, index) in bars"
              :key="index"
              :transform="`translate(${bar.x + bar.width / 2}, -10)`"
            >
              <text
                :fill="overIndex === index ? xLabelHoverColor : xLabelColor"
                y="0"
                dy="0.71em"
              >
                {{ bar.xLabel }}
              </text>
            </g>
          </g>
          <g class="y-axis" fill="none" :transform="`translate(0, 0)`">
            <g
              class="tick"
              opacity="1"
              font-size="10"
              font-family="sans-serif"
              text-anchor="end"
              v-for="(tick, index) in yTicks"
              :key="index"
              :transform="`translate(0, ${y(tick) + 0.5})`"
            >
              <line stroke="#EBE9E9" :x2="width"></line>
            </g>
            <text
              fill="#d3d3d3"
              font-size="20"
              font-family="OpenSans-Light, Open Sans"
              font-weight="300"
              :y="-2"
              dy="-0.2em"
            >
              {{ maxY }}%
            </text>
          </g>
          <g class="bars" fill="none">
            <g v-for="(bar, index) in bars" :key="index">
              <rect
                :fill="getRectFill(bar.xLabel, index)"
                :height="bar.height"
                :width="bar.width"
                :x="bar.x"
                :y="bar.y"
                class="bar-chart-rect"
                @click="onClickBar(bar)"
                @mouseover="onOverBar(index)"
                @mouseout="onOutBar(index)"
              ></rect>
              <line
                class="top-line"
                :x2="bar.width - 5"
                :transform="`translate(${bar.x + 2.5}  ${bar.y})`"
                fill="none"
                :stroke="getTopLineColor(bar.xLabel, index)"
                stroke-linecap="round"
                stroke-width="5"
              />
              <line
                v-if="showBarValue(bar.xLabel, index)"
                :x2="valueRemarkWidth"
                :transform="`translate(${
                  bar.x + bar.width / 2 - valueRemarkWidth / 2
                } ${bar.y})
                `"
                fill="none"
                :stroke="getTopLineColor(bar.xLabel, index)"
                stroke-linecap="round"
                stroke-width="15"
              />
              <g
                v-if="showBarValue(bar.xLabel, index)"
                class="tick"
                opacity="1"
                font-size="10"
                font-family="sans-serif"
                text-anchor="middle"
                :transform="`translate(${bar.x + bar.width / 2}, 0)`"
              >
                <text
                  fill="#fff"
                  font-size="12"
                  font-family="OpenSans-Light, Open Sans"
                  font-weight="300"
                  :y="bar.y + 4"
                >
                  {{ bar.value }}%
                </text>
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  </div>
</template>

<script>
import { scaleLinear, scaleBand } from "d3-scale";
export default {
  name: "BarChart",
  props: {
    loading: { default: false },
    maxHight: { default: 400 },
    dataSet: { default: () => [] },
    marginLeft: { default: 20 },
    marginTop: { default: 40 },
    tickCount: { default: 10 },
    barPadding: { default: 0.3 },
    showXLabel: { default: false },
    selectedBars: { default: () => [] },
    barChartPaddingInner: { default: 0.1 },
    barChartPaddingOuter: { default: 0.2 },
    barChartBarMiniWidth: { default: 75 },
    barChartTopValueRemarkWidth: { default: 28 },
    chartContainerAspectRatio: { default: 2 },
  },
  data() {
    return {
      rectColor: "url(#grad)",
      rectHoverColor: "url(#grad_hover)",
      valueRemarkWidth: this.barChartTopValueRemarkWidth,
      barTopHoverColor: "#0187e0",
      barTopColor: "#A8A8A8",
      xLabelColor: "#888888",
      xLabelHoverColor: "#0062A3",
      overIndex: -1,
      tags: [],
      tagPlus: false,
      initialWidth: 0,
    };
  },
  computed: {
    height() {
      const expHeight = this.getChartContainerHeight(this.initialWidth);
      return this.maxHight > expHeight ? expHeight : this.maxHight;
    },
    yTicks() {
      return this.y.ticks(this.tickCount);
    },
    x() {
      return scaleBand()
        .range([0, this.width])
        .paddingInner(this.barChartPaddingInner) //padding between individual bars
        .paddingOuter(this.barChartPaddingInner) //padding between bars and axis
        .domain(this.dataSet.map((e) => e.label));
    },
    y() {
      return scaleLinear().range([this.height, 0]).domain([0, this.maxY]);
    },
    maxY() {
      const maxValue = Math.max.apply(
        Math,
        this.dataSet.map(function (o) {
          return o.value;
        })
      );
      return maxValue;
    },
    bars() {
      const bars = this.dataSet.map((d) => {
        return {
          xLabel: d.label,
          value: d.value,
          x: this.x(d.label),
          y: this.y(d.value),
          width: this.x.bandwidth(),
          height: this.height - this.y(d.value),
        };
      });
      return bars;
    },
    width() {
      const miniWidth = this.getBarChartContainerWidth(this.dataSet.length);
      return this.initialWidth > miniWidth ? this.initialWidth : miniWidth;
    },
  },
  methods: {
    getBarChartContainerWidth(len) {
      const totalWidth =
        len * this.barChartBarMiniWidth + // sum of bar width
        this.barChartPaddingInner * (len - 1) * this.barChartBarMiniWidth + // sum of inner padding
        2 * this.barChartPaddingOuter +
        this.barChartBarMiniWidth; // sum of outer padding

      return totalWidth;
    },
    getChartContainerHeight(width, ratio = this.chartContainerAspectRatio) {
      return width / ratio;
    },
    onClickBar(bar) {
      this.overIndex = -1;
      this.$emit("click-bar", bar.xLabel);
    },
    onOverBar(index) {
      this.overIndex = index;
    },
    onOutBar() {
      this.overIndex = -1;
    },
    getRectFill(label, index) {
      return this.selectedBars.includes(label) || this.overIndex === index
        ? this.rectHoverColor
        : this.rectColor;
    },
    getTopLineColor(label, index) {
      return this.selectedBars.includes(label) || this.overIndex === index
        ? this.barTopHoverColor
        : this.barTopColor;
    },
    showBarValue(label, index) {
      return this.selectedBars.includes(label) || this.overIndex === index;
    },
    onResize() {
      if (this.$refs.barChartRef) {
        this.initialWidth = this.$refs.barChartRef.clientWidth || 0;
      }
    },
    onResize1() {
      console.log("[onResize1]");
    },
  },
};
</script>

<style lang="scss" scoped>
.bar-chart-container {
  width: 100%;
  overflow-x: auto;
}
.bar-chart-rect {
  cursor: pointer;
  padding: 10px;
}
</style>
