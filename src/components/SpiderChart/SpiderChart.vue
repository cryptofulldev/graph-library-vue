<template>
  <div id="body" ref="spiderChartRef" @resize="onResize">
    <div id="chart"></div>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "SpiderChart",
  props: {
    d: { default: () => [] },
  },
  data() {
    return {
      initialHeight: 0,
      initialWidth: 0,
      legendOptions: ["Smartphone", "Tablet"],
      mycfg: {
        w: this.w,
        h: this.h,
        maxValue: 0.6,
        levels: 6,
        ExtraWidthX: 300,
        ExtraWidthY: 100,
      },
    };
  },
  computed: {
    w() {
      const wid =
        this.initialWidth > this.initialHeight
          ? this.initialHeight
          : this.initialWidth;
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.mycfg.ExtraWidthX = this.initialWidth - wid;
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.mycfg.ExtraWidthY = this.initialHeight - wid + (500 / wid) * 100;
      return wid - 100;
    },
    h() {
      const wid =
        this.initialWidth > this.initialHeight
          ? this.initialHeight
          : this.initialWidth;
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.mycfg.ExtraWidthX = this.initialWidth - wid;
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.mycfg.ExtraWidthY = this.initialHeight - wid + (500 / wid) * 100;
      return wid - 100;
    },
    colorscale() {
      return d3.scaleOrdinal(d3.schemeCategory10);
    },
    svg() {
      return d3
        .select("#body")
        .selectAll("svg")
        .append("svg")
        .attr("width", this.mycfg.w)
        .attr("height", this.mycfg.h);
    },
    text() {
      return this.svg
        .append("text")
        .attr("class", "title")
        .attr("transform", "translate(90,0)")
        .attr("x", this.w - 70)
        .attr("y", 10)
        .attr("font-size", "12px")
        .attr("fill", "#404040")
        .text("What % of owners use a specific service in a week");
    },
    legend() {
      return this.svg
        .append("g")
        .attr("class", "legend")
        .attr("height", 10)
        .attr("width", 20)
        .attr("transform", "translate(90,20)");
    },
  },
  mounted() {
    this.legend
      .selectAll("rect")
      .data(this.legendOptions)
      .enter()
      .append("rect")
      .attr("x", this.w - 65)
      .attr("y", function (d, i) {
        return i * 20;
      })
      .attr("width", 10)
      .attr("height", 10)
      .style("fill", function (d, i) {
        return this.colorscale(i);
      });
    //Create text next to squares
    this.legend
      .selectAll("text")
      .data(this.legendOptions)
      .enter()
      .append("text")
      .attr("x", this.w - 52)
      .attr("y", function (d, i) {
        return i * 20 + 9;
      })
      .attr("font-size", "11px")
      .attr("fill", "#737373")
      .text(function (d) {
        return d;
      });
    this.onResize();
    this.draw("#chart", this.d, this.mycfg);
  },
  methods: {
    draw(id, d, options) {
      const cfg = {
        radius: 5,
        w: this.w,
        h: this.h,
        factor: 1,
        factorLegend: 0.85,
        levels: 3,
        maxValue: 0,
        radians: 2 * Math.PI,
        opacityArea: 0.5,
        ToRight: 5,
        TranslateX: this.mycfg.ExtraWidthX / 2,
        TranslateY: this.mycfg.ExtraWidthY / 2,
        color: d3.scaleOrdinal(d3.schemeCategory10),
      };
      if ("undefined" !== typeof options) {
        for (let i in options) {
          if ("undefined" !== typeof options[i]) {
            cfg[i] = options[i];
          }
        }
      }
      cfg.maxValue = Math.max(
        cfg.maxValue,
        d3.max(d, function (i) {
          return d3.max(
            i.map(function (o) {
              return o.value;
            })
          );
        })
      );
      const allAxis = d[0].map(function (i) {
        return i.label;
      });
      const total = allAxis.length;
      const radius = cfg.factor * Math.min(cfg.w / 2, cfg.h / 2);
      const Format = d3.format("%");
      d3.select(id).select("svg").remove();

      const g = d3
        .select(id)
        .append("svg")
        .attr("width", cfg.w + cfg.ExtraWidthX)
        .attr("height", cfg.h + cfg.ExtraWidthY)
        .append("g")
        .attr(
          "transform",
          "translate(" + cfg.TranslateX + "," + cfg.TranslateY + ")"
        );
      let tooltip;
      for (var j = 0; j < cfg.levels - 1; j++) {
        var levelFactor = cfg.factor * radius * ((j + 1) / cfg.levels);
        g.selectAll(".levels")
          .data(allAxis)
          .enter()
          .append("svg:line")
          .attr("x1", function (d, i) {
            return (
              levelFactor *
              (1 - cfg.factor * Math.sin((i * cfg.radians) / total))
            );
          })
          .attr("y1", function (d, i) {
            return (
              levelFactor *
              (1 - cfg.factor * Math.cos((i * cfg.radians) / total))
            );
          })
          .attr("x2", function (d, i) {
            return (
              levelFactor *
              (1 - cfg.factor * Math.sin(((i + 1) * cfg.radians) / total))
            );
          })
          .attr("y2", function (d, i) {
            return (
              levelFactor *
              (1 - cfg.factor * Math.cos(((i + 1) * cfg.radians) / total))
            );
          })
          .attr("class", "line")
          .style("stroke", "grey")
          .style("stroke-opacity", "0.75")
          .style("stroke-width", "0.3px")
          .attr(
            "transform",
            "translate(" +
              (cfg.w / 2 - levelFactor) +
              ", " +
              (cfg.h / 2 - levelFactor) +
              ")"
          );
      }

      //Text indicating at what % each level is
      for (let j = 0; j < cfg.levels; j++) {
        const levelFactor = cfg.factor * radius * ((j + 1) / cfg.levels);
        g.selectAll(".levels")
          .data([1]) //dummy data
          .enter()
          .append("svg:text")
          .attr("x", function () {
            return levelFactor * (1 - cfg.factor * Math.sin(0));
          })
          .attr("y", function () {
            return levelFactor * (1 - cfg.factor * Math.cos(0));
          })
          .attr("class", "legend")
          .style("font-family", "sans-serif")
          .style("font-size", "10px")
          .attr(
            "transform",
            "translate(" +
              (cfg.w / 2 - levelFactor + cfg.ToRight) +
              ", " +
              (cfg.h / 2 - levelFactor) +
              ")"
          )
          .attr("fill", "#737373")
          .text(Format(((j + 1) * cfg.maxValue) / cfg.levels));
      }

      let series = 0;

      const axis = g
        .selectAll(".axis")
        .data(allAxis)
        .enter()
        .append("g")
        .attr("class", "axis");

      axis
        .append("line")
        .attr("x1", cfg.w / 2)
        .attr("y1", cfg.h / 2)
        .attr("x2", function (d, i) {
          return (
            (cfg.w / 2) * (1 - cfg.factor * Math.sin((i * cfg.radians) / total))
          );
        })
        .attr("y2", function (d, i) {
          return (
            (cfg.h / 2) * (1 - cfg.factor * Math.cos((i * cfg.radians) / total))
          );
        })
        .attr("class", "line")
        .style("stroke", "grey")
        .style("stroke-width", "1px");

      axis
        .append("text")
        .attr("class", "legend")
        .text(function (d) {
          return d;
        })
        .style("font-family", "sans-serif")
        .style("font-size", "11px")
        .attr("text-anchor", "middle")
        .attr("dy", "1.5em")
        .attr("transform", function () {
          return "translate(0, -10)";
        })
        .attr("x", function (d, i) {
          return (
            (cfg.w / 2) *
              (1 - cfg.factorLegend * Math.sin((i * cfg.radians) / total)) -
            60 * Math.sin((i * cfg.radians) / total)
          );
        })
        .attr("y", function (d, i) {
          return (
            (cfg.h / 2) * (1 - Math.cos((i * cfg.radians) / total)) -
            20 * Math.cos((i * cfg.radians) / total)
          );
        });

      let dataValues = [];
      d.forEach(function (y) {
        g.selectAll(".nodes").data(y, function (j, i) {
          dataValues.push([
            (cfg.w / 2) *
              (1 -
                (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) *
                  cfg.factor *
                  Math.sin((i * cfg.radians) / total)),
            (cfg.h / 2) *
              (1 -
                (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) *
                  cfg.factor *
                  Math.cos((i * cfg.radians) / total)),
          ]);
        });
        dataValues.push(dataValues[0]);
        g.selectAll(".area")
          .data([dataValues])
          .enter()
          .append("polygon")
          .attr("class", "radar-chart-serie" + series)
          .style("stroke-width", "2px")
          .style("stroke", cfg.color(series))
          .attr("points", function (d) {
            var str = "";
            for (var pti = 0; pti < d.length; pti++) {
              str = str + d[pti][0] + "," + d[pti][1] + " ";
            }
            return str;
          })
          .style("fill", function () {
            return cfg.color(series);
          })
          .style("fill-opacity", cfg.opacityArea)
          .on("mouseover", function () {
            const z = "polygon." + d3.select(this).attr("class");
            g.selectAll("polygon").transition(200).style("fill-opacity", 0.1);
            g.selectAll(z).transition(200).style("fill-opacity", 0.7);
          })
          .on("mouseout", function () {
            g.selectAll("polygon")
              .transition(200)
              .style("fill-opacity", cfg.opacityArea);
          });
        series++;
      });
      series = 0;

      d.forEach(function (y) {
        g.selectAll(".nodes")
          .data(y)
          .enter()
          .append("svg:circle")
          .attr("class", "radar-chart-serie" + series)
          .attr("r", cfg.radius)
          .attr("alt", function (j) {
            return Math.max(j.value, 0);
          })
          .attr("cx", function (j, i) {
            dataValues.push([
              (cfg.w / 2) *
                (1 -
                  (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) *
                    cfg.factor *
                    Math.sin((i * cfg.radians) / total)),
              (cfg.h / 2) *
                (1 -
                  (parseFloat(Math.max(j.value, 0)) / cfg.maxValue) *
                    cfg.factor *
                    Math.cos((i * cfg.radians) / total)),
            ]);
            return (
              (cfg.w / 2) *
              (1 -
                (Math.max(j.value, 0) / cfg.maxValue) *
                  cfg.factor *
                  Math.sin((i * cfg.radians) / total))
            );
          })
          .attr("cy", function (j, i) {
            return (
              (cfg.h / 2) *
              (1 -
                (Math.max(j.value, 0) / cfg.maxValue) *
                  cfg.factor *
                  Math.cos((i * cfg.radians) / total))
            );
          })
          .attr("data-id", function (j) {
            return j.label;
          })
          .style("fill", cfg.color(series))
          .style("fill-opacity", 0.9)
          .on("mouseover", function (e, d) {
            const newX = parseFloat(d3.select(this).attr("cx")) - 10;
            const newY = parseFloat(d3.select(this).attr("cy")) - 5;
            tooltip
              .attr("x", newX)
              .attr("y", newY)
              .text(Format(d.value))
              .transition(200)
              .style("opacity", 1);

            const z = "polygon." + d3.select(this).attr("class");
            g.selectAll("polygon").transition(200).style("fill-opacity", 0.1);
            g.selectAll(z).transition(200).style("fill-opacity", 0.7);
          })
          .on("mouseout", function () {
            tooltip.transition(200).style("opacity", 0);
            g.selectAll("polygon")
              .transition(200)
              .style("fill-opacity", cfg.opacityArea);
          })
          .append("svg:title")
          .text(function (j) {
            return Math.max(j.value, 0);
          });

        series++;
      });
      //Tooltip
      tooltip = g
        .append("text")
        .style("opacity", 0)
        .style("font-family", "sans-serif")
        .style("font-size", "13px");
    },
    onResize() {
      if (this.$refs.spiderChartRef) {
        this.initialWidth = this.$refs.spiderChartRef.clientWidth || 0;
        this.initialHeight = this.$refs.spiderChartRef.clientHeight || 0;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.chart {
  width: 100%;
  height: 100%;
}
</style>
