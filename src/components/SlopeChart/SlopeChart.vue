<template>
  <div
    ref="slopeChartRef"
    class="slope-chart-body"
    :class="`slope-chart-body-${classId}`"
  >
    <svg
      ref="slopeChartSVGRef"
      class="slope-chart-container"
      :width="width"
      :height="Math.abs(height - margin.top)"
    >
      <g :transform="`translate(0, 0)`">
        <g class="slope-start-axis" fill="none">
          <text
            :x="x(0) + 5"
            :y="margin.top + 18"
            font-size="18"
            font-weight="300"
            fill="#c2c2c2"
          >
            100%
          </text>
          <line
            :x1="x(0)"
            :x2="x(0)"
            :y1="margin.top"
            :y2="height - margin.top - margin.bottom"
            stroke="#c2c2c2"
            stroke-width="2"
            fill="none"
          ></line>
          <text
            :x="x(0) + 5"
            :y="height - margin.top - margin.bottom"
            font-size="18"
            font-weight="300"
            fill="#c2c2c2"
          >
            0%
          </text>
          <text
            :x="x(0)"
            :y="height - margin.top - margin.bottom + 20"
            font-size="18"
            font-weight="300"
            fill="#c2c2c2"
          >
            Period 1
          </text>
        </g>
        <g class="slope-lines" fill="none">
          <g v-for="(item, index) in data" :key="index">
            <g :transform="`translate(0, 0)`" fill="none">
              <line
                :x1="x(0)"
                :x2="x(1)"
                :y1="y(item.start)"
                :y2="y(item.end)"
                :stroke="color(item.end - item.start)"
                stroke-width="7"
                rx="7"
                fill="none"
                @mouseover="(evt) => showTooltip(evt, item)"
                @mouseleave="hideTooltip()"
              ></line>
            </g>
          </g>
        </g>
        <g class="slope-end-axis" fill="none">
          <text
            :x="x(1) - 5"
            :y="margin.top + 18"
            font-size="18"
            font-weight="300"
            fill="#c2c2c2"
            style="text-anchor: end"
          >
            100%
          </text>
          <line
            :x1="x(1)"
            :x2="x(1)"
            :y1="margin.top"
            :y2="height - margin.top - margin.bottom"
            stroke="#c2c2c2"
            stroke-width="2"
            fill="none"
          ></line>
          <text
            :x="x(1) - 5"
            :y="height - margin.top - margin.bottom"
            font-size="18"
            font-weight="300"
            fill="#c2c2c2"
            style="text-anchor: end"
          >
            0%
          </text>
          <text
            :x="x(1)"
            :y="height - margin.top - margin.bottom + 20"
            font-size="18"
            font-weight="300"
            fill="#c2c2c2"
            style="text-anchor: end"
          >
            Period 2
          </text>
        </g>
      </g>
    </svg>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "SlopeChart",
  props: {
    data: { default: () => [], type: Array },
    classId: { default: 0, type: Number },
    margin: {
      default: () => ({
        top: 20,
        right: 30,
        bottom: 35,
        left: 30,
      }),
      type: Object,
    },
  },
  data: () => ({
    initialWidth: 0,
    initialHeight: 0,
    rangeColorForPositive: ["#7EDBB0", "#4FC1A6", "#2A8A75", "#145F4F"],
    rangeColorForNegative: ["#7CC0F1", "#478EC2", "#2E77AD", "#1C669D"],
  }),
  computed: {
    width() {
      return this.initialWidth;
    },
    height() {
      return this.initialHeight;
    },
    x() {
      return d3
        .scalePoint()
        .range([this.margin.left, this.width - this.margin.right])
        .domain(d3.range(2));
    },
    y() {
      return d3
        .scaleLinear()
        .range([this.height - this.margin.bottom, this.margin.top])
        .domain([0, 1]);
    },
    maxValue() {
      if (this.data.length === 0) {
        return 0;
      }
      return d3.max(this.data, function (d) {
        return d.end - d.start;
      });
    },
    minValue() {
      if (this.data.length === 0) {
        return 0;
      }
      return d3.min(this.data, function (d) {
        return d.end - d.start;
      });
    },
    colorForPositive() {
      return d3
        .scaleLinear()
        .domain(d3.ticks(0, this.maxValue, 4))
        .range(this.rangeColorForPositive);
    },
    colorForNegative() {
      return d3
        .scaleLinear()
        .domain(d3.ticks(this.minValue, 0, 4))
        .range(this.rangeColorForNegative);
    },
    numberFormat() {
      return d3.format("+,.1%");
    },
    numberFormatUnsigned() {
      return d3.format(",.1%");
    },
  },
  mounted() {
    this.onResize();
  },
  methods: {
    color(val) {
      if (val > 0) {
        return this.colorForPositive(val);
      } else {
        return this.colorForNegative(val);
      }
    },
    showTooltip(e, d) {
      if (this.$refs.slopeChartSVGRef) {
        let topPosition = 0;
        let leftPosition = 0;
        if (e.layerY < 100) {
          topPosition = e.layerY + 20;
        } else {
          topPosition = e.layerY - 100;
        }
        if (e.layerX < 250) {
          leftPosition = e.layerX + 20;
        } else if (
          e.layerX >
          this.width - this.margin.left - this.margin.right - 250
        ) {
          leftPosition = e.layerX - 250;
        } else {
          leftPosition = e.layerX - 100;
        }
        this.$refs.slopeChartSVGRef.insertAdjacentHTML(
          "afterend",
          `<div class='slope-chart-tooltip' style='width: 220px; top: ${topPosition}px; left: ${leftPosition}px' >${this.tooltipHTML(
            d
          )}</div>`
        );
      }
    },
    hideTooltip() {
      console.log("[hidetooltip]");
      // this.$refs.slopeChartSVGRef.removeChild(this.tooltipElement);
      document.querySelector(".slope-chart-tooltip").remove();
    },
    tooltipHTML(d) {
      return `<div class="slope-chart-tooltip-title">
        <span>${d.name}</span>
      </div>
      <div class="slope-chart-tooltip-value">
        <span class="start-value" style="color: #145F4F">${this.numberFormatUnsigned(
          d.start
        )}</span>
        <span class="diff-value" style="color: #4FC1A6" >${this.numberFormat(
          d.end - d.start
        )}</span>
        <span class="end-value" style="color: #7EDBB0" >${this.numberFormatUnsigned(
          d.end
        )}</span>
      </div>
      `;
    },
    onResize() {
      if (
        this.$refs.slopeChartRef &&
        this.$refs.slopeChartRef.clientWidth > 0
      ) {
        this.initialWidth = this.$refs.slopeChartRef.clientWidth;
        this.initialHeight = this.$refs.slopeChartRef.clientHeight;
      }
    },
    resizeFetch() {
      this.onResize();
    },
  },
};
</script>

<style lang="scss">
.slope-chart-body {
  width: 100%;
  height: 100%;
  position: relative;
  overflow-x: auto;
  overflow-y: auto;
  display: flex;
  justify-content: center;
}
.slope-chart-tooltip {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding: 15px;
  background: #fff;
  box-shadow: 0px 0px 11px 3px rgba($color: #aaa9a9, $alpha: 0.8);
  border-radius: 5px;
  gap: 5px;
  -webkit-animation: 0.3s ease 0s normal forwards 1 fadein;
  animation: 0.3s ease 0s normal forwards 1 fadein;
  .slope-chart-tooltip-title {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 5px;
    text-align: left;
  }
  .slope-chart-tooltip-value {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 900;
    margin-top: 5px;
  }
}

@keyframes fadein {
  0% {
    opacity: 0;
  }
  66% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@-webkit-keyframes fadein {
  0% {
    opacity: 0;
  }
  66% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
