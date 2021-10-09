<style lang="sass" scoped>
@import 'src/styles/app.variables'
</style>

<template>
  <q-page class="layout vertical center-center">
    <img alt="Quasar logo" src="../assets/logo.svg" style="width: 200px; height: 200px" />
  </q-page>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted } from 'vue'
import { useRouter } from '@/router'

export default defineComponent({
  name: 'Home',

  components: {},

  setup() {
    onMounted(() => {
      console.log(`Home onMounted`)
    })

    onUnmounted(() => {
      offAfterRouteUpdate()
      offBeforeRouteUpdate()
      offBeforeRouteLeave()
    })

    const { routes } = useRouter()
    const route = routes.home

    const offBeforeRouteUpdate = route.onBeforeRouteUpdate(async (to, from) => {
      console.log(`Home onBeforeRouteUpdate:`, { to: to.fullPath, from: from.fullPath })
    })

    const offBeforeRouteLeave = route.onBeforeRouteLeave(async (to, from) => {
      console.log(`Home onBeforeRouteLeave:`, { to: to.fullPath, from: from.fullPath })
    })

    const offAfterRouteUpdate = route.onAfterRouteUpdate(async (to, from) => {
      console.log(`Home onAfterRouteUpdate:`, { to: to.fullPath, from: from.fullPath })
    })
  },
})
</script>
