<template>
  <div class="about">
    <h1>This is d3 graph page</h1>
    <div class="d3-geo-map">
      <D3GeoMap
        :proportion="0.6"
        markLightColor="#7CC0F1"
        markDarkColor="#0087E0"
        :valueSet="geoMapData"
      ></D3GeoMap>
    </div>
  </div>
</template>
<script>
import D3GeoMap from "../components/D3Graph/D3GeoMap.vue";
import GEO_DATA_PATTERN from "../assets/dumpDataForD3GeoMap.json";

export default {
  name: "D3-Graph",
  components: {
    D3GeoMap,
  },
  data: () => ({
    geoMapData: GEO_DATA_PATTERN,
  }),
};
</script>

<style lang="scss" scoped>
.d3-geo-map {
  display: flex;
  width: 800px;
  height: 500px;
  border: 1px solid grey;
  margin: auto;
}
</style>
