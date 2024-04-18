<script lang="ts">
import app from "@/constants/app";
import { defineComponent } from "vue";
interface ILogo {
  logoUrl?: string;
  logoName?: string;
}

/**
 * 顶部logo
 */
export default defineComponent({
  name: "Logo",
  props: {
    logoUrl: String,
    logoName: {
      type: String,
      default: "logo"
    }
  },
  setup(props: ILogo) {
    return { props, app };
  }
});
</script>

<template>
  <span :class="`rr-header-ctx-logo-img-wrap ${'enabled-logo-' + app.enabledLogo}`">
    <svg t="1711267475903" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5434" width="32" height="32"><path d="M912.96 345.728a16 16 0 0 1 2.176 8v384.832a32 32 0 0 1-16 27.712l-333.12 192.32a16 16 0 0 1-24-13.824V560.896a32 32 0 0 1 15.936-27.648l333.184-193.344a16 16 0 0 1 21.824 5.76zM123.968 339.84a16 16 0 0 1 8.064 2.176l329.6 191.232a32 32 0 0 1 15.872 27.648v381.76a16 16 0 0 1-24 13.888l-329.536-190.272a32 32 0 0 1-16-27.712V355.84a16 16 0 0 1 16-16z m719.168 111.104l-229.12 132.992v263.808l229.12-132.288V450.944zM180.032 453.12v262.4l225.472 130.24v-261.76L179.968 453.12z m347.52-385.792l329.856 190.464a16 16 0 0 1 0 27.712L525.888 477.888a32 32 0 0 1-32.128 0L163.84 286.528a16 16 0 0 1 0-27.776l331.712-191.488a32 32 0 0 1 32 0z m-16 73.92l-227.84 131.584 226.048 131.2 227.84-132.288-226.048-130.496z" p-id="5435"></path></svg>
    <span class="rr-header-ctx-logo-line"></span>
  </span>
  <span class="rr-header-ctx-logo-text">{{ props.logoName }}</span>
</template>
