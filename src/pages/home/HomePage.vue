<style lang="scss" scoped>
.container {
  width: 100%;
  max-width: 400px;
  padding: 0 24px;
}
</style>

<template>
  <q-page class="HomePage layout vertical center-center">
    <div class="container layout vertical center">
      <img alt="Quasar logo" src="@/assets/logo.svg" style="width: 200px; height: 200px" />
      <div class="layout vertical full-width space-mt-40">
        <q-input v-model="message.title" class="full-width" :label="$t('common.title')" />
        <q-input v-model="message.body" class="full-width" :label="$t('common.message')" />
        <q-btn
          class="layout self-center space-mt-20"
          flat
          rounded
          noCaps
          color="primary"
          label="Move to ABC page"
          @click="moveToAbcPageButtonOnClick"
        />
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue'
import { useRouter } from '@/router'

const HomePage = defineComponent({
  components: {},

  setup() {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const router = useRouter()
    const route = router.routes.home

    const message = reactive({
      title: 'Quasar',
      body: 'Beyond the framework.',
    })

    //----------------------------------------------------------------------
    //
    //  Events
    //
    //----------------------------------------------------------------------

    async function moveToAbcPageButtonOnClick() {
      router.routes.examples.abc.move(message)
    }

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    return {
      message,
      moveToAbcPageButtonOnClick,
    }
  },
})

export default HomePage
</script>
