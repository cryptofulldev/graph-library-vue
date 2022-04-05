<template>
  <div class="staked-bar-chart-content">
    <div class="max-value-text">{{ maxTotalValue }}</div>
    <div
      ref="stackedChartRef"
      class="stacked-bar-chart-body"
      :class="`stacked-bar-chart-body-${classId}`"
    >
      <svg class="stacked-bar-chart" :width="width" :height="height">
        <g :transform="`translate(0, 0)`">
          <g class="stacked-bars" fill="none">
            <g v-for="(bar, index) in data" :key="index">
              <g
                :transform="`translate(0, 0)`"
                fill="none"
                @mouseover="(e) => mouseover(e, bar)"
                @mouseleave="mouseleave"
              >
                <rect
                  class="bar-rect"
                  fill="#F0F0F0"
                  :x="x(index)"
                  :y="y(bar.total + bar.processed) - 10"
                  :width="x.bandwidth()"
                  :height="Math.abs(y(0) - y(bar.processed))"
                  rx="5"
                ></rect>
                <rect
                  class="bar-rect"
                  fill="#2A8A75"
                  :x="x(index)"
                  :y="y(bar.total)"
                  :width="x.bandwidth()"
                  :height="Math.abs(y(0) - y(bar.total))"
                  rx="5"
                ></rect>
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  </div>
</template>

<script>
import * as d3 from "d3";
import moment from "moment";

export default {
  name: "D3StackedBarChart",
  props: {
    data: { default: () => [], type: Array },
    barWidth: { default: 60, type: Number },
    barGap: { default: 10, type: Number },
    classId: { default: 0, type: Number },
    margin: {
      default: () => ({
        top: 20,
        right: 30,
        bottom: 15,
        left: 30,
      }),
      type: Object,
    },
  },
  data: () => ({
    initialWidth: 0,
    initialHeight: 0,
    tooltip: null,
  }),
  computed: {
    width() {
      return (this.barWidth + this.barGap) * this.data.length;
      // return this.initialWidth - this.margin.left - this.margin.right;
    },
    height() {
      return Math.abs(
        this.initialHeight - this.margin.top - this.margin.bottom
      );
    },
    maxValue() {
      return d3.max(this.data, function (d) {
        return d.total + d.processed + 5;
      });
    },
    maxTotalValue() {
      return d3.max(this.data, function (d) {
        return d.total;
      });
    },
    x() {
      return d3
        .scaleBand()
        .range([0, (this.barWidth + this.barGap) * this.data.length])
        .domain(this.data.map((d, i) => i))
        .padding(0.2);
    },
    y() {
      return d3
        .scaleLinear()
        .range([this.height, 35])
        .domain([0, this.maxValue]);
    },
  },
  watch: {
    data: {
      handler() {
        this.onResize();
        this.drawChart();
      },
      deep: true,
    },
  },
  mounted() {
    this.onResize();
    this.drawChart(this.data);
    window.addEventListener("resize", this.resizeFetch);
  },
  methods: {
    async drawChart(data) {
      const bodyClass = `.stacked-bar-chart-body-${this.classId}`;
      const barWidth = this.barWidth + this.barGap;

      if (d3.select(bodyClass)._groups[0][0] !== null) {
        d3.select(bodyClass)._groups[0][0].scrollLeft = data.length * barWidth;
      }
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
    mouseover(e, d) {
      const bodyClass = `.stacked-bar-chart-body-${this.classId}`;
      const HEIGHT = this.height;
      const leftStandard = d3.select(bodyClass).node().scrollLeft;
      const barWidth = this.barWidth + this.barGap;
      this.tooltip = d3
        .select(bodyClass)
        .append("div")
        .attr("class", "stacked-bar-tooltip")
        .html(this.tooltipHTMLForDates(d))
        .style("width", "220px")
        .style("font-size", "12px")
        .style("top", function () {
          return HEIGHT / 4 + "px";
        })
        .style("left", function () {
          let tooltipX = 0;
          const parentWidth = d3.select(bodyClass).node().offsetWidth;
          console.log(
            "[client x]",
            e.clientX,
            leftStandard,
            parentWidth,
            e.layerX
          );
          if (e.layerX - leftStandard < 200) {
            tooltipX = 10 + leftStandard;
          } else if (parentWidth + leftStandard - e.layerX < 230) {
            tooltipX = parentWidth + leftStandard - 270;
          } else {
            // tooltipX = e.layerX - 100;
            tooltipX = e.layerX - barWidth / 2 - 100;
          }
          return tooltipX + "px";
        });
    },
    mouseleave() {
      if (this.tooltip !== null) {
        this.tooltip.remove();
        this.tooltip = null;
      }
    },
    tooltipHTMLForDates(d) {
      return `<div class="stacked-bar-tooltip-date">
        <span>${moment()
          .year(d.year)
          .week(d.week + 1)
          .day(0)
          .format("MMM DD YYYY")}</span><span>-</span><span>${moment()
        .year(d.year)
        .week(d.week + 1)
        .day(6)
        .format("MMM DD YYYY")}</span>
      </div>
      <div class="stacked-bar-tooltip-value"><span><strong>${
        d.total
      }</strong></span><span>New Leads</span></div>
      <div class="stacked-bar-tooltip-value"><span><strong>${
        d.processed
      }</strong></span><span>Processed</span></div>
      `;
    },
    resizeFetch() {
      this.onResize();
      this.drawChart();
    },
  },
};
</script>

<style lang="scss" scoped>
.staked-bar-chart-content {
  width: 100%;
  height: 100%;
  position: relative;
  .max-value-text {
    position: absolute;
    top: 5px;
    left: 10px;
  }
}
.stacked-bar-chart-body {
  width: 100%;
  height: 100%;
  position: relative;
  overflow-x: auto;
  overflow-y: auto;
}
::v-deep .stacked-bar-tooltip {
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
  .stacked-bar-tooltip-date {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 5px;
  }
  .stacked-bar-tooltip-value {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 5px;
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
