<style lang="sass" scoped>
@import 'src/styles/app.variables'
</style>

<template>
  <div class="layout vertical center-center">
    <h1>This is an about page</h1>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted } from 'vue'
import { useRouterUtils } from '@/router'

export default defineComponent({
  name: 'About',

  components: {},

  setup() {
    onMounted(() => {
      console.log(`About onMounted`)
    })

    onUnmounted(() => {
      offAfterRouteUpdate()
      offBeforeRouteUpdate()
      offBeforeRouteLeave()
    })

    const { routes } = useRouterUtils()
    const route = routes.about

    const offBeforeRouteUpdate = route.onBeforeRouteUpdate(async (to, from) => {
      console.log(`About onBeforeRouteUpdate:`, { to: to.fullPath, from: from.fullPath })
    })

    const offBeforeRouteLeave = route.onBeforeRouteLeave(async (to, from) => {
      console.log(`About onBeforeRouteLeave:`, { to: to.fullPath, from: from.fullPath })
    })

    const offAfterRouteUpdate = route.onAfterRouteUpdate(async (to, from) => {
      console.log(`About onAfterRouteUpdate:`, { to: to.fullPath, from: from.fullPath })
    })
  },
})
</script>
