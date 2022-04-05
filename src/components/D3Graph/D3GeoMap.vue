<template>
  <div class="world-map-container" ref="worldmapref" @resize="onResize">
    <div
      v-if="loading"
      class="d-flex justify-center align-center"
      :style="`width: 100%; height: 100%;`"
    ></div>
    <button
      class="rounded-t-xl clear-btn"
      v-if="!allSelected"
      @click="onClearSelect"
    >
      <span>Clear selection</span>
      <IconClear color="#d0d0d0" />
    </button>

    <svg class="world-map" v-bind="graphPos">
      <g
        :transform="`translate(${transX}, ${transY}) scale(${mapScale}, ${mapScale})`"
        id="worldmap"
        class="worldmapg"
        @mousedown="startMove"
        @touchstart="startMove"
      >
        <rect
          class="map-background"
          :width="`${width}px`"
          :height="`${height - 100}px`"
        ></rect>
        <path
          v-for="(geo, idx) in geoDataSet"
          :key="idx"
          :fill="getRegionColor(geo, idx)"
          :d="geo.d"
          style="stroke: rgb(221, 221, 221)"
          stroke-width="0.5"
          class="region"
          @mouseover="hoverIdx = idx"
          @mouseout="hoverIdx = -1"
          @click="(evt) => onRegionClick(evt, geo)"
        ></path>
      </g>
    </svg>
    <div class="scale-btns">
      <button class="rounded-t-xl scale-btn" @click="onZoomIn">
        <IconAdd color="#d0d0d0" />
      </button>
      <button class="rounded-b-xl btn-bottom scale-btn" @click="onZoomOut">
        <IconRemove color="#d0d0d0" />
      </button>
    </div>
  </div>
</template>

<script>
import * as d3 from "d3";
import { geoNaturalEarth2 } from "d3-geo-projection";
import getcountryISO2 from "country-iso-3-to-2";

import IconAdd from "../Icons/IconAdd";
import IconRemove from "../Icons/IconRemove";
import IconClear from "../Icons/IconClear";

export default {
  name: "WorldMap",
  components: {
    IconAdd,
    IconRemove,
    IconClear,
  },
  props: {
    loading: { default: false },
    proportion: { default: 0.5 },
    allSelected: { default: true },
    markLightColor: { default: "#7CC0F1" },
    markDarkColor: { default: "#1C669D" },
    basicDarkColor: { default: "#DDDBDD" },
    basicLightColor: { default: "#F5F5F5" },
    valueSet: { default: () => [] },
    selectedRegions: { default: () => [] },
  },
  data() {
    return {
      projection: null,
      dataSet: [],
      maxHeight: 400,
      mapScale: 1.0,
      transX: -20,
      transY: 30,
      prevTransX: 0,
      prevTransY: 0,
      left: 0,
      top: 0,
      moveStartX: 0,
      moveStartY: 0,
      hoverIdx: -1,
      width: 600,
      widthRect: 0,
      heightRect: 0,
      marginTop: { default: 30 },
    };
  },
  computed: {
    height() {
      return this.width * this.proportion;
    },
    getGeoPath() {
      return d3
        .geoPath() // a function which converts GeoJSON data into SVG path
        .projection(this.projection);
    },
    geoDataSet() {
      const geoData = [];
      for (const item of this.dataSet) {
        if (item.properties.name !== "Antarctica") {
          geoData.push({
            d: this.getGeoPath(item),
            country: item.properties.name,
            code: item.id,
          });
        }
      }
      return geoData;
    },
    graphPos() {
      return {
        viewBox: [0, 0, this.width, this.height].join(" "),
        width: this.width,
      };
    },
    colorScale() {
      return d3.scaleSequential(
        d3.interpolate(this.markLightColor, this.markDarkColor)
      );
    },
    colorMap() {
      return {};
    },
  },
  async mounted() {
    window.addEventListener("resize", this.onResize);
    const { features } = await d3.json(
      "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
    );
    // this.$nextTick(() => {
    this.dataSet = [...features];
    this.onResize();
    this.transY = this.width > 400 ? 30 : 10;
    // });
  },
  watch: {
    valueSet: {
      async handler() {
        const colorValues = [];
        if (this.valueSet.length > 0) {
          for (const d of this.valueSet) {
            this.colorMap[d.code] = d.value;
            colorValues.push(Number(d.value));
          }
          this.colorScale.domain(d3.extent(colorValues)); // set min and max values for colorscale
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    getProjection(width, height, windowWidth) {
      const projection = geoNaturalEarth2() // a projection function that converts from a lon/lat point to an x/y point
        .scale(windowWidth > 992 ? (width / 550) * 100 : (width / 650) * 100) // scale a projection, eg zoom in/out. The default scale factor on a projection is 150, so a scale of 450 is three times zoomed in and so on
        .translate([width / 2, height / 2]); // set the x/y value for the center (lon/lat) point of the map
      return projection;
    },
    getTranslatePosition(
      prevScale,
      mapScale,
      width,
      height,
      prevX,
      prevY,
      marginTop
    ) {
      const prevWidthRect = width * prevScale;
      const prevHeightRect = height * prevScale;
      const prevStandardX = prevX === 0 ? prevX : width / 2 - prevWidthRect / 2;
      const prevStandardY =
        prevY === 0
          ? prevY
          : height / 2 - prevHeightRect / 2 + marginTop * prevScale;
      const widthRect = width * mapScale;
      const heightRect = height * mapScale;
      const transX = width / 2 - widthRect / 2 + (prevX - prevStandardX);
      const transY =
        height / 2 -
        heightRect / 2 +
        marginTop * mapScale +
        (prevY - prevStandardY);
      return { translateX: transX, translateY: transY };
    },
    checkGeoData(geo, data) {
      const found = data.find((item) => getcountryISO2(geo.code) === item.code);
      return found === undefined ? false : true;
    },
    getMousePos(mouseEvent, point) {
      point.x = mouseEvent.clientX;
      point.y = mouseEvent.clientY;
    },
    getTouchPos(touchEvent, point) {
      point.x = touchEvent.touches[0].clientX;
      point.y = touchEvent.touches[0].clientY;
    },
    onZoomIn() {
      this.mapScale += 0.2;
      const { translateX, translateY } = this.getTranslatePosition(
        this.mapScale - 0.2,
        this.mapScale,
        this.width,
        this.height,
        this.prevTransX,
        this.prevTransY,
        this.marginTop
      );
      this.transX = translateX;
      this.transY = translateY;
      this.prevTransX = this.transX;
      this.prevTransY = this.transY;
    },
    onZoomOut() {
      this.mapScale -= 0.2;
      const { translateX, translateY } = this.getTranslatePosition(
        this.mapScale + 0.2,
        this.mapScale,
        this.width,
        this.height,
        this.prevTransX,
        this.prevTransY,
        this.marginTop
      );
      this.transX = translateX;
      this.transY = translateY;
      this.prevTransX = this.transX;
      this.prevTransY = this.transY;
    },
    startMove(evt) {
      evt.stopPropagation();
      const curTransX = this.transX;
      const curTrasnY = this.transY;
      const touch = evt.type === "touchstart";
      if (!touch && evt.button !== 0) return;
      const events = touch
        ? {
            move: "touchmove",
            stop: "touchend",
          }
        : {
            move: "mousemove",
            stop: "mouseup",
          };
      const elem = evt.currentTarget.closest("svg");
      const point = elem.createSVGPoint();
      const transform = elem.getScreenCTM().inverse();
      const getPos = touch ? this.getTouchPos : this.getMousePos;
      var moving = true;
      var newPt;
      let started = false;
      const updateFn = () => {
        if (moving) requestAnimationFrame(updateFn);
        newPt = point.matrixTransform(transform);
        if (!started) {
          this.moveStartX = newPt.x;
          this.moveStartY = newPt.y;
          started = true;
        }
        this.transX = curTransX + newPt.x - this.moveStartX;
        this.transY = curTrasnY + newPt.y - this.moveStartY;
      };
      const moveFn = (evt) => getPos(evt, point);
      const stopFn = () => {
        moving = false;
        elem.removeEventListener(events.move, moveFn);
        elem.removeEventListener(events.stop, stopFn);
      };
      requestAnimationFrame(updateFn);
      moveFn(evt);
      elem.addEventListener(events.move, moveFn);
      elem.addEventListener(events.stop, stopFn);
    },
    onRegionClick(evt, geo) {
      if (
        Math.abs(this.prevTransX - this.transX) < 1 &&
        Math.abs(this.prevTransY - this.transY) < 1
      ) {
        this.prevTransX = this.transX;
        this.prevTransY = this.transY;
        this.$emit("region-click", getcountryISO2(geo.code));
      } else {
        this.prevTransX = this.transX;
        this.prevTransY = this.transY;
        return;
      }
    },
    onClearSelect() {
      this.$emit("region-clear");
    },
    getRegionColor(geo, idx) {
      if (this.checkGeoData(geo, this.valueSet) || this.hoverIdx === idx) {
        if (!this.checkGeoData(geo, this.valueSet)) {
          return this.basicDarkColor;
        }
        const geoValue = this.colorMap[getcountryISO2(geo.code)];
        return this.colorScale(Number(geoValue));
      }
      return this.basicLightColor;
    },
    onResize() {
      if (this.$refs.worldmapref) {
        this.width = this.$refs.worldmapref.clientWidth || 600;
        this.maxHeight = this.$refs.worldmapref.clientHeight || 400;
        this.marginTop = this.width > 400 ? 30 : 10;
        const windowWidth = window.innerWidth;
        this.projection = this.getProjection(
          this.width,
          this.height,
          windowWidth
        );
      }
    },
  },
};
</script>

<style lang="scss">
.DTGeotooltip {
  .tooltip-inner {
    padding: 20px;
    .gta-dt-map-tooltip-item {
      text-align: left;
    }
    .gta-dt-map-tooltip-title {
      font-weight: 600;
      color: #4393c3;
      text-align: left;
    }
  }
}
svg.world-map {
  // width: 100% !important;
  // height: calc(100% - 25px) !important;
  path,
  rect {
    cursor: pointer;
  }
}
.region:hover {
  fill-opacity: 0.8;
}
.world-map-container {
  position: relative;
  width: 100%;
  height: 90%;
  display: block !important;
}
.map-background {
  fill: transparent;
}
.scale-btns {
  display: flex;
  flex-direction: column;
  position: absolute;
  bottom: 10px;
  left: 10px;
  width: 36px !important;
  border: 1px solid #dadada;
  border-radius: 25px;
  background-color: #ffffff;
  .scale-btn {
    background: transparent;
    height: 35px !important;
    min-width: unset;
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;

    &:first-child {
      border-bottom: 1px solid #dadada;
    }
  }
  .bottom-btn {
    border-top: none;
  }
}

.clear-btn {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: auto !important;
  background: #fff;
  min-width: unset;
  font-size: 12px;
  display: flex;
  justify-content: center;
  border: 1px solid #dadada;
  color: #b9b9b9;
  align-items: center;
  border-radius: 20px;
  padding: 2px 10px;
}
.worldmapg {
  display: block !important;
}
</style>
