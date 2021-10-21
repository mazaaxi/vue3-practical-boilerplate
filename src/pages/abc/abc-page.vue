<style lang="sass" scoped>
@import 'src/styles/app.variables'
</style>

<template>
  <AbcViewPC v-if="deviceType === 'PC'" ref="pcView" :device-type="deviceType" />
  <AbcViewSP v-else-if="deviceType === 'SP'" ref="spView" :device-type="deviceType" />
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { AbcViewPC } from '@/pages/abc/abc-view-pc.vue'
import { AbcViewSP } from '@/pages/abc/abc-view-sp.vue'
import { useScreen } from '@/base'

namespace AbcPage {
  export const clazz = defineComponent({
    name: 'AbcPage',

    components: {
      AbcViewPC: AbcViewPC.Component,
      AbcViewSP: AbcViewSP.Component,
    },

    setup(props, ctx) {
      //----------------------------------------------------------------------
      //
      //  Variables
      //
      //----------------------------------------------------------------------

      const screen = useScreen()

      const pcView = ref<AbcViewPC>()
      const spView = ref<AbcViewSP>()

      const deviceType = computed(() => (screen.gt.md ? 'PC' : 'SP'))

      //----------------------------------------------------------------------
      //
      //  Result
      //
      //----------------------------------------------------------------------

      return {
        screen,
        pcView,
        spView,
        deviceType,
      }
    },
  })
}

export default AbcPage.clazz
</script>
