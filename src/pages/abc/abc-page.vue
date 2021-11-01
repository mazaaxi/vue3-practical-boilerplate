<style lang="sass" scoped>
@import 'src/styles/app.variables'
</style>

<template>
  <AbcViewPC v-if="deviceType === 'PC'" ref="pcView" />
  <AbcViewSP v-else-if="deviceType === 'SP'" ref="pcView" />
</template>

<script lang="ts">
import AbcViewPCComp, { AbcViewPC } from '@/pages/abc/abc-view-pc.vue'
import AbcViewSPComp, { AbcViewSP } from '@/pages/abc/abc-view-sp.vue'
import { computed, defineComponent, ref } from 'vue'
import { useScreen } from '@/base'

const AbcPageComp = defineComponent({
  name: 'AbcPage',

  components: {
    AbcViewPC: AbcViewPCComp,
    AbcViewSP: AbcViewSPComp,
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

export default AbcPageComp
</script>
