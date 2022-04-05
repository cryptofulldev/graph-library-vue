<template>
  <div
    ref="treemapChartRef"
    class="treemap-body"
    :class="`treemap-body-${classId}`"
  ></div>
</template>

<script>
import * as d3 from "d3";
import { Library } from "@observablehq/stdlib";

export default {
  name: "D3TreemapChart",
  props: {
    data: { default: () => {}, type: Object },
    classId: { default: 0, type: Number },
    rangeColor: { default: () => [], type: Array },
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
    maxValue: 0,
  }),
  computed: {
    width() {
      return this.initialWidth;
    },
    height() {
      return this.initialHeight;
    },
  },
  mounted() {
    this.onResize();
    this.drawChart(this.data);
    window.addEventListener("resize", this.resizeFetch);
  },
  methods: {
    async drawChart(data) {
      const { DOM } = new Library();
      // eslint-disable-next-line no-unused-vars
      const WIDTH = this.width;
      // eslint-disable-next-line no-unused-vars
      const HEIGHT = this.height;

      const bodyClass = `.treemap-body-${this.classId}`;

      // const format = d3.format(",d");

      const treemap = (data) =>
        d3.treemap().size([WIDTH, HEIGHT]).padding(3).round(true)(
          d3
            .hierarchy(data)
            .sum((d) => d.value)
            .sort((a, b) => b.value - a.value)
        );

      const root = treemap(data);

      const maxValue = d3.max(root.children, (d) => d.value);

      const color = d3
        .scaleLinear()
        .domain(d3.ticks(0, maxValue, 5))
        .range(this.rangeColor);

      const tooltipHTMLForDates = this.tooltipHTMLForDates;

      let tooltip;
      // What happens when user hover a bar
      const mouseover = function (e, d) {
        // what subgroup are we hovering?
        tooltip = d3
          .select(bodyClass)
          .append("div")
          .attr("class", "treemap-tooltip")
          .html(tooltipHTMLForDates(d))
          .style("width", "220px")
          .style("top", () => {
            if (e.layerY < 100) {
              return e.layerY + 10 + "px";
            } else {
              return e.layerY - 90 + "px";
            }
          })
          .style("left", function () {
            let tooltipX = 0;
            const parentWidth = d3.select(bodyClass).node().offsetWidth;
            if (e.layerX > parentWidth - 220) {
              tooltipX = parentWidth - 250;
            } else if (e.layerX < 150) {
              tooltipX = 30;
            } else {
              tooltipX = e.layerX - 110;
            }
            return tooltipX + "px";
          });
      };

      // eslint-disable-next-line no-unused-vars
      const mouseleave = function (d) {
        tooltip.remove();
      };

      const svg = d3
        .select(bodyClass)
        .append("svg")
        .attr("viewBox", [0, 0, WIDTH, HEIGHT])
        .attr("width", WIDTH)
        .attr("height", HEIGHT)
        .style("font", "20px sans-serif");

      const leaf = svg
        .selectAll("g")
        .data(root.leaves())
        .join("g")
        .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

      leaf
        .append("rect")
        .attr("id", (d) => (d.leafUid = DOM.uid("leaf")).id)
        .attr("fill", (d) => {
          while (d.depth > 1) d = d.parent;
          return color(d.data.value);
        })
        .attr("rx", "5")
        .attr("width", (d) => d.x1 - d.x0)
        .attr("height", (d) => d.y1 - d.y0)
        .on("mouseover", mouseover)
        .on("mouseleave", mouseleave);

      leaf
        .append("text")
        .data(root.leaves())
        .attr("x", (d) => (d.x1 - d.x0) / 2)
        .attr("y", (d) => (d.y1 - d.y0) / 2)
        .attr("transform", (d) => `translate(-${d.data.name.length * 5}, 5)`)
        .join("tspan")
        .attr("fill-opacity", (d, i, nodes) =>
          i === nodes.length - 1 ? 0.7 : null
        )
        .style("display", (d, i, nodes) => {
          if (i !== nodes.length - 1 && d.data.name.length * 10 < d.x1 - d.x0)
            return "flex";
          else return "none";
        })
        .attr("fill", "#FFF")
        .text((d) => d.data.name);
    },
    onResize() {
      if (
        this.$refs.treemapChartRef &&
        this.$refs.treemapChartRef.clientWidth > 0
      ) {
        this.initialWidth = this.$refs.treemapChartRef.clientWidth;
        this.initialHeight = this.$refs.treemapChartRef.clientHeight;
      }
    },
    tooltipHTMLForDates(d) {
      return `<div class="treemap-title">
        <span>${d.data.name}</span>
      </div>
      <div class="treemap-value"><span><strong>${d.data.value}</strong></span><span> interventions</span></div>
      `;
    },
    resizeFetch() {
      this.onResize();
      this.drawChart(this.data);
    },
  },
};
</script>

<style lang="scss">
.treemap-body {
  width: 100%;
  height: 100%;
  position: relative;
}
.treemap-tooltip {
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
  .treemap-title {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 5px;
  }
  .treemap-value {
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
