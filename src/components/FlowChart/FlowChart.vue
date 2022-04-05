<template>
  <div
    ref="flowChartRef"
    class="flow-chart-body"
    :class="`flow-chart-body-${classId}`"
    id="flow-chart-body"
  ></div>
</template>

<script>
import * as d3 from "d3";
import { sankey as d3Sankey } from "./sankey";

export default {
  name: "D3FlowChart",
  props: {
    data: { default: {} },
    classId: { default: 0 },
    startDate: { default: new Date() },
    endDate: { default: new Date() },
    margin: {
      default: () => ({
        top: 20,
        right: 30,
        bottom: 35,
        left: 30,
      }),
    },
  },
  data: () => ({
    initialWidth: 0,
    initialHeight: 0,
  }),
  computed: {
    width() {
      return this.initialWidth > 590
        ? this.initialWidth - this.margin.left - this.margin.right
        : 960 - this.margin.left - this.margin.right;
    },
    height() {
      return this.initialWidth > 590
        ? this.initialHeight - this.margin.top - this.margin.bottom
        : 500 - this.margin.top - this.margin.bottom;
    },
    formatNumber() {
      return d3.format(",.0f");
    },
  },
  mounted() {
    this.onResize();
    this.drawChart(this.data);
  },
  methods: {
    drawChart(data) {
      const color = d3.scaleOrdinal(d3.schemeCategory10);
      const formatTime = d3.timeFormat("%b %d %Y");
      const width = this.width;
      const height = this.height;

      const svg = d3
        .select("#flow-chart-body")
        .append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.left + this.margin.right)
        .append("g")
        .attr(
          "transform",
          "translate(" + this.margin.left + "," + this.margin.top + ")"
        );

      const sankey = d3Sankey(d3)
        .nodeWidth(10)
        .nodePadding(40)
        .size([width, height]);

      sankey.nodes(data.nodes).links(data.links).layout(1);

      const link = svg
        .append("g")
        .selectAll(".link")
        .data(data.links)
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", sankey.link())
        .style("stroke-width", function (d) {
          return Math.max(1, d.dy);
        })
        .style("stroke", function (d) {
          return (d.color = color(d.target.name.replace(/ .*/, "")));
        })
        .sort(function (a, b) {
          return b.dy - a.dy;
        });

      const node = svg
        .append("g")
        .selectAll(".node")
        .data(data.nodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", function (d) {
          return "translate(" + d.x + "," + d.y + ")";
        })
        .call(
          d3
            .drag()
            .subject(function (d) {
              return d;
            })
            .on("start", function () {
              this.parentNode.appendChild(this);
            })
            .on("drag", dragmove)
        );

      // add the rectangles for the nodes
      node
        .append("rect")
        .attr("height", function (d) {
          return d.dy;
        })
        .attr("width", sankey.nodeWidth())
        .style("fill", function (d) {
          return (d.color = color(d.name.replace(/ .*/, "")));
        })
        .style("stroke", function (d) {
          return d3.rgb(d.color).darker(2);
        })
        // Add hover text
        .append("title")
        .text(function (d) {
          return d.name + "\n" + "There is " + d.value + " stuff in this node";
        });

      // add in the title for the nodes
      node
        .append("text")
        .attr("x", -6)
        .attr("y", function (d) {
          return d.dy / 2;
        })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function (d) {
          return d.name;
        })
        .filter(function (d) {
          return d.x < width / 2;
        })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");

      const startDate = svg
        .append("text")
        .attr("x", 0)
        .attr("y", height + 20)
        .attr("class", "date-text")
        .text(formatTime(this.startDate))
        .attr("text-anchor", "center");

      const endDate = svg
        .append("text")
        .attr("x", width)
        .attr("y", height + 20)
        .attr("class", "date-text")
        .text(formatTime(this.endDate))
        .attr("text-anchor", "end");

      startDate.attr("transform", null);
      endDate.attr("transform", null);

      // the function for moving the nodes
      const dragmove = (d) => {
        d3.select(this).attr(
          "transform",
          "translate(" +
            d.x +
            "," +
            (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) +
            ")"
        );
        sankey.relayout();
        link.attr("d", sankey.link());
      };
    },
    onResize() {
      if (this.$refs.flowChartRef) {
        this.initialWidth = this.$refs.flowChartRef.clientWidth - 20 || 0;
        this.initialHeight = this.$refs.flowChartRef.clientHeight - 40 || 0;
      } else {
        this.initialWidth = 960;
        this.initialHeight = 500;
      }
    },
  },
};
</script>

<style lang="scss">
.flow-chart-body {
  width: 100%;
  height: 100%;
  position: relative;
  overflow-x: auto;
  overflow-y: auto;
  padding-top: 20px;
}
.node rect {
  fill-opacity: 0.9;
  shape-rendering: crispEdges;
}

.node text {
  pointer-events: none;
  text-shadow: 0 1px 0 #fff;
}

.link {
  fill: none;
  stroke: #000;
  stroke-opacity: 0.2;
}

.link:hover {
  stroke-opacity: 0.5;
}

.date-text {
  opacity: 0.7;
}
</style>
