import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("../views/D3Graph.vue"),
  },
  {
    path: "/d3-graph",
    name: "D3Graph",
    component: () => import("../views/D3Graph.vue"),
  },
  {
    path: "/line-chart",
    name: "LineChart",
    component: () => import("../views/LineChart.vue"),
  },
  {
    path: "/contribution-graph",
    name: "ContributionGraph",
    component: () => import("../views/ContributionGraph.vue"),
  },
  {
    path: "/bar-chart",
    name: "BarChart",
    component: () => import("../views/BarChart.vue"),
  },
  {
    path: "/spider-chart",
    name: "SpiderChart",
    component: () => import("../views/SpiderChart.vue"),
  },
  {
    path: "/stacked-bar-chart",
    name: "StackedBarChart",
    component: () => import("../views/D3StackedBarChart.vue"),
  },
  {
    path: "/treemap",
    name: "Treemap",
    component: () => import("../views/D3Treemap.vue"),
  },
  {
    path: "/flow-chart",
    name: "FlowChart",
    component: () => import("../views/D3FlowChart.vue"),
  },
  {
    path: "/slope-chart",
    name: "SlopeChart",
    component: () => import("../views/SlopeChart.vue"),
  },
];

const router = new VueRouter({
  routes,
});

export default router;
