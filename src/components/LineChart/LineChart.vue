<template>
  <div ref="lineChartRef" class="line-chart-content" @resize="onResize">
    <svg
      ref="lineChartSVGRef"
      xmlns="http://www.w3.org/2000/svg"
      class="line-chart"
      :viewBox="viewBox"
      :height="initialHeight"
    >
      <g :transform="`translate(0, ${scaleY(0) + 12})`">
        <line
          stroke="#cccccc"
          stroke-width="1"
          x1="0"
          :x2="width"
          :y1="0"
          :y2="0"
        ></line>
      </g>
      <g :transform="`translate(0, ${paddingTop / 2})`">
        <defs>
          <linearGradient
            id="linear-gradient"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="80%"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0" stop-color="#F1F5F8" stop-opacity="1" />
            <stop offset="1" stop-color="#F1F5F8" stop-opacity="1" />
          </linearGradient>
        </defs>
        <path class="chart-area" :d="area" fill="url(#linear-gradient)" />
        <path
          class="historic-part"
          fill="none"
          :d="line1"
          :stroke="color"
          stroke-width="4"
        />
        <path
          class="prediction-part"
          :transform="`translate(${transPreview}, 0)`"
          fill="none"
          :d="line2"
          stroke-width="4"
          :stroke="color"
          stroke-dasharray="3"
        />
        <g class="graph-box" fill="none">
          <rect
            fill="none"
            :height="innerHeight"
            :width="width"
            stroke="none"
            :x="0"
            :y="0"
            class="graph-box-rect"
          ></rect>
          <g
            v-for="(el, index) in data"
            :key="index"
            class="tick"
            opacity="1"
            font-size="10"
            font-family="sans-serif"
            text-anchor="middle"
            :transform="`translate(${scaleX(index)}, 0)`"
          >
            <!-- <line stroke="#cccccc" :y2="innerHeight"></line> -->
            <!-- <text fill="#707070" y="9" dy="0.71em" :transform="xLabelTransForm(index)">
                            {{ el.label }}
                        </text> -->
            <circle
              :cx="pointR(index)"
              :cy="pointR(index)"
              :r="pointR(index)"
              :fill="color"
              :transform="`translate(${-pointR(index)}, ${
                scaleY(el.value) - pointR(index)
              })`"
              class="point-circle"
              v-tooltip="{
                content: getTooltipData(el),
                classes: 'show-tick-value',
                show: hoverIdx === index,
                trigger: 'mannual',
                placement: 'top',
                delay: { show: 1000, hide: 100 },
                autoHide: true,
              }"
              @mouseover="hoverIdx = index"
              @mouseout="hoverIdx = -1"
            />
            <line
              v-if="hoverIdx === index"
              :stroke="color"
              :y1="scaleY(el.value)"
              :y2="scaleY(el.value)"
              stroke-width="2"
            ></line>
          </g>
        </g>
      </g>
      <g :transform="`translate(${width - 20}, ${paddingTop})`">
        <text>{{ maxValue }}</text>
      </g>
      <g :transform="`translate(0, ${paddingTop})`">
        <text>{{ graphTitle }}</text>
      </g>
      <g :transform="`translate(0, ${scaleY(0) + 30})`">
        <text class="date-label" text-anchor="start">
          {{ formatTime(startDate) }}
        </text>
      </g>
      <g :transform="`translate(${width}, ${scaleY(0) + 30})`">
        <text class="date-label" text-anchor="end">
          {{ formatTime(endDate) }}
        </text>
      </g>
    </svg>
  </div>
</template>

<script>
import Vue from "vue";
import VTooltip from "v-tooltip";
Vue.use(VTooltip);

import * as d3 from "d3";
import moment from "moment";

export default {
  neme: "D3LineChart",
  props: {
    lineChartNodeDistance: {
      default: 5,
      type: Number,
    },
    data: { default: () => [], type: Array },
    historicIdx: { default: 0, type: Number },
    color: { default: "#28678A", type: String },
    graphTitle: { default: "", type: String },
    startDate: { default: new Date(), type: Date },
    endDate: { default: new Date(), type: Date },
  },
  data() {
    return {
      paddingTop: 20,
      paddingBottom: 12,
      hoverIdx: -1,
      initialWidth: 0,
      initialHeight: 0,
    };
  },
  computed: {
    width() {
      // const miniWidth = this.getLineChartContainerWidth(this.data.length);
      // console.log("[miniWidth]", miniWidth);
      // return this.initialWidth > miniWidth ? this.initialWidth : miniWidth;
      return this.initialWidth - 20;
    },
    innerHeight() {
      return this.initialHeight > this.paddingBottom
        ? this.initialHeight - this.paddingBottom
        : this.initialHeight;
    },
    rangeX() {
      const width = this.width; // - this.padding;
      return [0, width];
    },
    rangeY() {
      return [this.innerHeight - 25, 0];
    },
    scaleX() {
      return d3
        .scaleLinear()
        .range(this.rangeX)
        .domain(d3.extent(this.data, (d, i) => i));
    },
    scaleY() {
      const dataCopy = [...this.data];
      dataCopy.sort((a, b) => {
        return a.value - b.value;
      });

      return d3
        .scaleLinear()
        .range(this.rangeY)
        .domain([dataCopy[0].value, dataCopy[dataCopy.length - 1].value + 5]);
    },
    path() {
      return d3
        .line()
        .x((d, i) => this.scaleX(i))
        .y((d) => this.scaleY(d.value));
    },
    line1() {
      if (this.historicIdx === -1) {
        return this.path(this.data);
      }
      const lineData1 = this.data.slice(0, this.historicIdx + 1);
      return this.path(lineData1);
    },
    line2() {
      const lineData2 = this.data.slice(this.historicIdx, 12);
      return this.path(lineData2);
    },
    generateArea() {
      return d3
        .area()
        .x((d, i) => this.scaleX(i))
        .y0(this.initialHeight - 35)
        .y1((d) => this.scaleY(d.value));
    },
    area() {
      return this.generateArea(this.data);
    },
    viewBox() {
      return `0 0 ${this.width} ${this.initialHeight}`;
    },
    transPreview() {
      return this.data.length > 0 ? this.scaleX(this.historicIdx) : 0;
    },
    maxValue() {
      return d3.max(this.data, (d) => d.value);
    },
    formatTime() {
      return d3.timeFormat("%b %d %Y");
    },
  },
  mounted() {
    this.onResize();
    window.addEventListener("resize", this.resizeFetch);
  },
  methods: {
    xLabelTransForm(idx) {
      if (idx === 0) {
        return `translate(10, ${this.innerHeight})`;
      }
      if (idx === this.data.length - 1) {
        return `translate(-10, ${this.innerHeight})`;
      }
      return `translate(0, ${this.innerHeight})`;
    },
    valueLabelTransForm(idx) {
      if (idx === 0) {
        return 0;
      }
      if (idx === this.data.length - 1) {
        return -40;
      }
      return -30;
    },
    pointR(idx) {
      if (idx === this.historicIdx) {
        return 6;
      }
      return 3;
    },
    getLineChartContainerWidth(len) {
      return len * this.lineChartNodeDistance;
    },
    onOverGraph(evt) {
      const svgRect = this.$refs.lineChartSVGRef.getBoundingClientRect();
      const relativePosX = evt.clientX - svgRect.left;
      if (this.data.length > 1) {
        this.hoverIdx = Math.round(
          ((this.data.length - 1) * relativePosX) / svgRect.width
        );
      }
    },
    onResize() {
      if (this.$refs.lineChartRef) {
        this.initialWidth = this.$refs.lineChartRef.clientWidth || 0;
        this.initialHeight = this.$refs.lineChartRef.clientHeight || 0;
      }
    },
    getTooltipData(d) {
      return `<div class="line-chart-tooltip-date" style="margin-bottom: 5px">
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
            <div class="line-chart-tooltip-value"><span style="margin-right: 5px"><strong>${
              d.value
            }</strong></span><span>interventions</span></div>
            `;
    },
    resizeFetch() {
      this.onResize();
    },
  },
};
</script>

<style lang="scss" scoped>
.line-chart-content {
  width: 100%;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  border-bottom: 1px solid var(--v-shades3-base);
}
.point-circle {
  cursor: pointer;
}

::v-deep .date-label {
  font-size: 11px;
  fill: rgb(118, 118, 118);
  font-family: Helvetica, arial, "Open Sans", sans-serif;
}
</style>
<style lang="scss">
// ::v-deep {
.show-tick-value {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding: 15px;
  background: #fff !important;
  box-shadow: 0px 0px 11px 3px rgba($color: #aaa9a9, $alpha: 0.8);
  border-radius: 5px;
  gap: 5px;
  .tooltip-inner {
    background: transparent;
    color: #888;
    padding: 0px;
    width: 100%;
  }
  // }
}
</style>
