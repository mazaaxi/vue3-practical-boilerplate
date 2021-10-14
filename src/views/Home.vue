<style lang="sass" scoped>
@import 'src/styles/app.variables'
</style>

<template>
  <q-page class="layout vertical center-center">
    <img alt="Quasar logo" src="../assets/logo.svg" style="width: 200px; height: 200px" />
    <!--
    <div>{{ msg }}</div>
    <div>{{ t('common.cancel') }}</div>
    -->
  </q-page>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted } from 'vue'
import { QPage } from 'quasar'
import { useI18n } from '@/i18n'
import { useRouterUtils } from '@/router'

export default defineComponent({
  name: 'Home',

  components: {
    QPage,
  },

  props: {
    msg: { type: String, default: 'Hello World' },
  },

  setup() {
    onMounted(() => {
      console.log(`Home onMounted`)
    })

    onUnmounted(() => {
      offAfterRouteUpdate()
      offBeforeRouteUpdate()
      offBeforeRouteLeave()
    })

    const i18n = useI18n()

    const { routes } = useRouterUtils()
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

    return {
      ...i18n,
    }
  },
})
</script>
