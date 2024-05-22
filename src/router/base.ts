import Layout from "@/layout/layout.vue";
import Error from "@/views/error.vue";
import {RouteRecordRaw} from "vue-router";
import Index from "@/views/index/index.vue";
import Login from "@/views/login.vue";
import Iframe from "@/views/iframe.vue";
import Detail from "@/views/model/detail.vue";
/**
 * 框架基础路由
 */
const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: Index,
    name: 'index',
    meta: {title: "主页", isNavigationMenu: false, isIndex: true },
    children: [
      {
        path: "/about",
        name: 'about',
        component: () => import("@/views/index/pages/about.vue"),
        meta: {title: "关于我们", isIndex: true}
      },
      {
        path: "/feature",
        name: 'feature',
        component: () => import("@/views/index/pages/feature.vue"),
        meta: {title: "特性", isIndex: true}
      },
      {
        path: "/method",
        name: 'method',
        component: () => import("@/views/index/pages/method.vue"),
        meta: {title: "解决方案", isIndex: true}
      },
      {
        path: "/price",
        name: 'price',
        component: () => import("@/views/index/pages/price.vue"),
        meta: {title: "价格", isIndex: true}
      },
    ]
  },
  {
    path: "/history/:id",
    component: () => import("@/views/history.vue"),
    meta: {title: "对话", isNavigationMenu: false, isIndex: true }
  },
  {
    path: "/index",
    component: Layout,
    redirect: "/home",
    meta: {title: "工作台", icon: "icon-desktop"},
    children: [
      {
        path: "/home",
        component: () => import("@/views/home.vue"),
        meta: {title: "主页", icon: "icon-home"}
      }
    ]
  },
  {
    path: "/login",
    component: Login,
    meta: {title: "登录", isNavigationMenu: false}
  },
  {
    path: "/user/password",
    component: () => import("@/views/sys/user-update-password.vue"),
    meta: {title: "修改密码", requiresAuth: true, isNavigationMenu: false}
  },
  {
    path: "/iframe/:id?",
    component: Iframe,
    meta: {title: "iframe", isNavigationMenu: false}
  },
  {
    path: "/error",
    name: "error",
    component: Error,
    meta: {title: "错误页面", isNavigationMenu: false}
  },
  {
    path: "/model/detail/:id?",
    name: "detail",
    component: Detail,
    meta: {title: "模型详情", isNavigationMenu: false}
  },
];

export const errorRoute: Array<RouteRecordRaw> = [
  {
    path: "/:path(.*)*",
    redirect: {path: "/error", query: {to: 404}, replace: true},
    meta: {isNavigationMenu: false}
  }
];

export default routes;
