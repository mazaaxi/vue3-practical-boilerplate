<style lang="sass" scoped>
@import 'src/styles/app.variables'
</style>

<template>
  <AbcViewPC v-if="deviceType === 'PC'" ref="pcView" />
  <AbcViewSP v-else-if="deviceType === 'SP'" ref="pcView" />
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import AbcViewPC from '@/pages/examples/abc/abc-view-pc.vue'
import AbcViewSP from '@/pages/examples/abc/abc-view-sp.vue'
import { useScreen } from '@/base'

const AbcPage = defineComponent({
  name: 'AbcPage',

  components: {
    AbcViewPC,
    AbcViewSP,
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

export default AbcPage
</script>
