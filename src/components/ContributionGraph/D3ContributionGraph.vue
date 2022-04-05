<template>
  <!-- <div ref="lineChartRef" @resize="onResize"> -->
  <div
    ref="contributionGraphRef"
    class="d3-contribution-graph"
    @resize="onResize"
  >
    <div
      class="d3-contribution-graph-body"
      :class="`d3-contribution-graph-body-${classId}`"
    ></div>
  </div>
</template>
<script>
import * as d3 from "d3";
import moment from "moment";

export default {
  name: "ContributionGraph",
  props: {
    endDate: { default: new Date() },
    values: { default: () => [] },
    rangeColor: { default: () => [] },
    isTooltip: { default: true },
    legendEnabled: { default: true },
    classId: { default: 1, type: Number },
    squarePadding: { default: 2, type: Number },
    squareLength: { default: 10, type: Number },
  },
  data() {
    return {
      max: 20,
      initialWidth: 0,
      initialHeight: 0,
      legendWidth: 0,
      square_padding: 2,
      month_label_padding: 15,
      counterMap: {},
      tooltipUnit: "intervention",
      onClick: null,
      weekStart: 1,
      locale: {
        months: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        No: "No",
        on: "on",
        Less: "Less",
        More: "More",
      },
    };
  },
  computed: {
    selector() {
      return `.d3-contribution-graph-body-${this.classId}`;
    },
    width() {
      return this.initialWidth;
    },
    height() {
      return this.initialHeight;
    },
    square_length() {
      return (this.initialWidth - 30) / 61;
    },
    endDate2() {
      return moment(this.endDate).day() === 0
        ? moment(this.endDate).endOf("day").toDate()
        : moment(this.endDate).endOf("day").add(1, "weeks").day(0).toDate();
    },
    yearAgo() {
      return moment(this.endDate)
        .startOf("day")
        .subtract(1, "year")
        .day(1)
        .toDate();
    },
    dateRange() {
      return ((d3.time && d3.time.days) || d3.timeDays)(
        this.yearAgo,
        this.endDate2
      ); // generates an array of date objects within the specified range;
    },
    monthRange() {
      if (moment(this.yearAgo).date() < 15) {
        return ((d3.time && d3.time.months) || d3.timeMonths)(
          moment(this.yearAgo).startOf("month").toDate(),
          this.endDate2
        );
      }
      return ((d3.time && d3.time.months) || d3.timeMonths)(
        moment(this.yearAgo).add(1, "months").startOf("month").toDate(),
        this.endDate2
      );
    },
    maxValue() {
      if (this.values.length === 0) {
        return 0;
      }
      return d3.max(this.values, function (d) {
        return d.count;
      });
    },
    color() {
      return (
        d3
          .scaleLinear()
          .domain(d3.ticks(0, this.maxValue, 5))
          // .interpolator(d3.interpolateBuGn);
          .range(this.rangeColor)
      );
    },
    daysOfChart() {
      return this.values.map(function (day) {
        return day.date.toDateString();
      });
    },
  },
  watch: {
    values: {
      handler() {
        if (this.values.length > 0) {
          this.values.forEach((element) => {
            const key = moment(new Date(element.date)).format("YYYY-MM-DD");
            // const counter = this.counterMap[key] || 0;
            this.counterMap[key] = element.count;
          });
        }
      },
      deep: true,
      immediate: true,
    },
    endDate2: {
      handler() {
        this.drawChart();
      },
      deep: true,
      immediate: true,
    },
  },
  mounted() {
    this.onResize();
    this.drawChart();
    window.addEventListener("resize", this.resizeFetch);
  },
  methods: {
    countForDate(d) {
      const key = moment(d).format("YYYY-MM-DD");
      return this.counterMap[key] || 0;
    },
    drawChart() {
      d3.select(this.selector).selectAll("svg.calendar-heatmap").remove();
      let tooltip;
      let dayRects;
      const WEEKSTART = this.weekStart;
      const firstDate =
        moment(this.dateRange[0]).format("ddd") !== "Mon"
          ? moment(this.dateRange[0]).day(1)
          : moment(this.dateRange[0]);
      const formatWeekday = (weekDay) => {
        if (WEEKSTART === 1) {
          if (weekDay === 0) {
            return 6;
          } else {
            return weekDay - 1;
          }
        }
        return weekDay;
      };
      const SQUARE_LENGTH = this.square_length;
      const SQUARE_PADDING = this.square_padding;
      const MONTH_LABEL_PADDING = this.month_label_padding;
      const LOCALE = this.locale;
      const WIDTH = this.width;
      // const HEIGHT = this.height;
      const LEGENDWIDTH = this.legendWidth;
      const DATERANGE = this.dateRange;
      const LEGEND_ADD_HEIGHT = this.legendEnabled
        ? SQUARE_LENGTH + SQUARE_PADDING + 20
        : 0;

      const svg = d3
        .select(this.selector)
        .append("svg")
        .attr(
          "viewBox",
          `0 0 ${this.width} ${
            (SQUARE_LENGTH + SQUARE_PADDING) * 7 + LEGEND_ADD_HEIGHT + 15
          }`
        )
        .attr("width", this.width)
        .attr("class", "calendar-heatmap")
        .attr(
          "height",
          (SQUARE_LENGTH + SQUARE_PADDING) * 7 + LEGEND_ADD_HEIGHT + 15
        );

      const legendGroupForMonth = svg
        .append("g")
        .attr("class", "month-label-bar")
        .attr("transform", "translate(25, 0)");

      // eslint-disable-next-line no-unused-vars
      const monthLabels = legendGroupForMonth
        .selectAll(".month-name")
        .data(this.monthRange)
        .enter()
        .append("text")
        .attr("class", "month-name")
        .text((d) => {
          return LOCALE.months[d.getMonth()];
        })
        .attr("x", function (d) {
          let matchIndex = 0;
          DATERANGE.find(function (element, index) {
            matchIndex = index;
            return (
              moment(d).isSame(element, "month") &&
              moment(d).isSame(element, "year")
            );
          });

          return Math.floor(matchIndex / 7) * (SQUARE_LENGTH + SQUARE_PADDING);
        })
        .attr("y", 10); // fix these to the top

      const legendGroupForDay = svg
        .append("g")
        .attr("class", "week-group")
        .attr("transform", `translate(0, 10)`);

      LOCALE.days.forEach(function (day, index) {
        index = formatWeekday(index);
        if (index % 2) {
          legendGroupForDay
            .append("text")
            .attr("class", "day-initial")
            .attr(
              "transform",
              "translate(10," +
                (SQUARE_LENGTH + SQUARE_PADDING) * (index + 1) +
                ")"
            )
            .style("text-anchor", "middle")
            .attr("dy", "2")
            .text(day);
        }
      });

      const legendGroupBody = svg
        .append("g")
        .attr("class", "day-cell-group")
        .attr("transform", "translate(25, 0)");

      dayRects = legendGroupBody.selectAll(".day-cell").data(DATERANGE); //  array of days for the last yr

      const counterMapTemp = this.counterMap;
      const colorTemp = this.color;
      const enterSelection = dayRects
        .enter()
        .append("rect")
        .attr("class", "day-cell")
        .attr("width", SQUARE_LENGTH)
        .attr("height", SQUARE_LENGTH)
        .attr("fill", function (d) {
          const key = moment(d).format("YYYY-MM-DD");
          // console.log("[d]", this.countForDate(d));
          const countData = counterMapTemp[key] || 0;
          return colorTemp(Number(countData));
        })
        .attr("x", function (d) {
          const cellDate = moment(d);
          let weekDayDiff = d.getDay() === 0 ? 1 : 0;
          const result =
            cellDate.week() -
            weekDayDiff -
            firstDate.week() +
            firstDate.weeksInYear() *
              (cellDate.weekYear() - firstDate.weekYear());
          return result * (SQUARE_LENGTH + SQUARE_PADDING);
        })
        .attr("y", function (d) {
          const formatWeekdayCount = formatWeekday(d.getDay());
          return (
            MONTH_LABEL_PADDING +
            formatWeekdayCount * (SQUARE_LENGTH + SQUARE_PADDING)
          );
        });

      if (typeof onClick === "function") {
        enterSelection.merge(dayRects).on("click", function (d) {
          const count = this.countForDate(d);
          this.onClick({ date: d, count: count });
        });
      }

      const tooltipHTMLForDates = this.tooltipHTMLForDate;

      if (this.isTooltip) {
        enterSelection
          .merge(dayRects)
          .on("mouseover", function (d, i) {
            tooltip = d3
              .select(".d3-contribution-graph-body")
              .append("div")
              .attr("class", "day-cell-tooltip")
              .html(tooltipHTMLForDates(i))
              .style("left", function () {
                let tooltipX = 0;
                if (d.layerX > WIDTH - 250) {
                  tooltipX = WIDTH - 250;
                } else if (d.layerX < 250) {
                  tooltipX = 10;
                } else {
                  tooltipX = d.layerX - 125;
                }
                return tooltipX + "px";
              })
              .style("top", function () {
                let tooltipY = 0;
                if (d.layerY < 70) {
                  tooltipY = d.layerY + 10;
                } else {
                  tooltipY = d.layerY - 70;
                }
                return tooltipY + "px";

                // return (
                //   formatWeekday(i.getDay()) * (SQUARE_LENGTH + SQUARE_PADDING) +
                //   MONTH_LABEL_PADDING * 2 -
                //   55 +
                //   "px"
                // );
              });
          })
          .on("mouseout", function () {
            tooltip.remove();
          });
      }

      if (this.legendEnabled) {
        const colorRange = [];
        for (let i = 0; i <= 4; i++) {
          colorRange.push(this.color((this.maxValue * i) / 4));
        }

        const legendGroup = svg
          .append("g")
          .attr("class", "legend-group")
          .attr(
            "transform",
            `translate(${
              WIDTH - (SQUARE_PADDING + (colorRange.length + 5) * SQUARE_LENGTH)
            }, ${(SQUARE_LENGTH + SQUARE_PADDING) * 9})`
          )
          .style("z-index", "999");

        legendGroup
          .append("text")
          .attr(
            "class",
            "calendar-heatmap-legend-text calendar-heatmap-legend-text-less"
          )
          .attr("x", -45)
          .attr("y", 11)
          .text(LOCALE.Less);

        legendGroup
          .selectAll(".calendar-heatmap-legend")
          .data(colorRange)
          .enter()
          .append("rect")
          .attr("class", "calendar-heatmap-legend")
          .attr("width", SQUARE_LENGTH)
          .attr("height", SQUARE_LENGTH)
          .attr("x", function (d, i) {
            return (
              LEGENDWIDTH + (i + 1) * (SQUARE_LENGTH + SQUARE_PADDING) - 20
            );
          })
          .attr("y", 0)
          .attr("fill", function (d) {
            return d;
          });

        legendGroup
          .append("text")
          .attr(
            "class",
            "calendar-heatmap-legend-text calendar-heatmap-legend-text-more"
          )
          .attr(
            "x",
            SQUARE_PADDING +
              (colorRange.length + 1) * (SQUARE_LENGTH + SQUARE_PADDING) -
              15
          )
          .attr("y", 11)
          .text(LOCALE.More);
      }

      dayRects.exit().remove();
    },
    onResize() {
      if (
        this.$refs.contributionGraphRef &&
        this.$refs.contributionGraphRef.clientWidth > 0
      ) {
        this.initialWidth = this.$refs.contributionGraphRef.clientWidth;
        this.initialHeight = this.$refs.contributionGraphRef.clientHeight;
      }
    },
    tooltipHTMLForDate(d) {
      const dateStr = moment(new Date(d)).format("ddd, MMM Do YYYY");
      const count = this.countForDate(new Date(d));
      return (
        "<span><strong>" +
        (count ? count : this.locale.No) +
        " " +
        this.pluralizedTooltipUnit(count) +
        "</strong> " +
        this.locale.on +
        " " +
        dateStr +
        "</span>"
      );
    },
    pluralizedTooltipUnit(count) {
      if ("string" === typeof this.tooltipUnit) {
        return this.tooltipUnit + (count === 1 ? "" : "s");
      }
      for (let i in this.tooltipUnit) {
        const _rule = this.tooltipUnit[i];
        const _min = _rule.min;
        let _max = _rule.max || _rule.min;
        _max = _max === "Infinity" ? Infinity : _max;
        if (count >= _min && count <= _max) {
          return _rule.unit;
        }
      }
    },
    resizeFetch() {
      this.onResize();
      this.drawChart();
    },
  },
};
</script>

<style lang="scss" scoped>
.d3-contribution-graph {
  width: 100%;
  height: 50%;
}
.d3-contribution-graph-body {
  width: 100%;
  height: 100%;
  position: relative;
}
::v-deep g.month-label-bar {
  line-height: 10px;
  z-index: 999;
}
::v-deep text.month-name,
::v-deep text.calendar-heatmap-legend-text,
::v-deep text.day-initial {
  font-size: 11px;
  fill: rgb(118, 118, 118);
  font-family: Helvetica, arial, "Open Sans", sans-serif;
}

::v-deep rect.day-cell {
  stroke-width: 1px;
}

::v-deep rect.day-cell:hover {
  stroke: #555555;
  stroke-width: 1px;
}
::v-deep .day-cell-tooltip {
  position: absolute;
  z-index: 9999;
  padding: 10px 9px;
  color: #fff;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.85);
  border-radius: 3px;
  text-align: center;
  width: 220px;
  -webkit-animation: 0.3s ease 0s normal forwards 1 fadein;
  animation: 0.3s ease 0s normal forwards 1 fadein;
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

::v-deep .day-cell-tooltip > span {
  font-family: Helvetica, arial, "Open Sans", sans-serif;
}
::v-deep .calendar-heatmap {
  box-sizing: border-box;
}
</style>
