<template>
  <AbcViewPC v-if="deviceType === 'PC'" ref="pcView" />
  <AbcViewSP v-else-if="deviceType === 'SP'" ref="pcView" />
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import AbcViewPC from '@/pages/examples/abc/ABCViewPC.vue'
import AbcViewSP from '@/pages/examples/abc/ABCViewSP.vue'
import { Screen } from '@/base'

const AbcPage = defineComponent({
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

    const screen = Screen.use()

    const pcView = ref<AbcViewPC>()
    const spView = ref<AbcViewSP>()

    const deviceType = computed(() => (screen.gt.xs ? 'PC' : 'SP'))

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
