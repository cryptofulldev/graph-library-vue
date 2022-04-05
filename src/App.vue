<template>
  <div id="app">
    <div id="nav">
      <router-link to="/d3-graph">D3Graph</router-link> |
      <router-link to="/line-chart">Line Chart</router-link> |
      <router-link to="/bar-chart">Bar Chart</router-link> |
      <router-link to="/spider-chart">Spider Chart</router-link> |
      <router-link to="/contribution-graph">Contribution Graph</router-link> |
      <router-link to="/stacked-bar-chart">Stacked Bar Chart</router-link> |
      <router-link to="/flow-chart">Flow Chart</router-link> |
      <router-link to="/slope-chart">Slope Chart</router-link> |
      <router-link to="/treemap">Treemap Graph</router-link>
    </div>
    <router-view />
  </div>
</template>

<style lang="scss">
* {
  box-sizing: border-box;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  box-sizing: border-box;
}

#nav {
  padding: 30px;
  width: 100%;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
