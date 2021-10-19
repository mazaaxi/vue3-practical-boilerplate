<style lang="sass" scoped>
@import 'src/styles/app.variables'

.input
  width: 400px
</style>

<template>
  <q-page class="layout vertical center-center">
    <img alt="Quasar logo" src="../assets/logo.svg" style="width: 200px; height: 200px" />
    <div class="layout vertical spacing-mt-40">
      <q-input v-model="message.title" class="input" :label="$t('common.title')" />
      <q-input v-model="message.body" class="input" :label="$t('common.message')" model-value="Beyond the framework." />
      <q-btn
        class="layout self-center spacing-mt-20"
        flat
        rounded
        no-caps
        color="primary"
        label="Move to ABC page"
        @click="moveToAbcPageButtonOnClick"
      />
    </div>
  </q-page>
</template>

<script lang="ts">
import { QBtn, QInput, QPage } from 'quasar'
import { defineComponent, onMounted, onUnmounted, reactive } from 'vue'
import { useRouterUtils } from '@/router'

export default defineComponent({
  name: 'Home',

  components: {
    QBtn,
    QInput,
    QPage,
  },

  props: {
    msg: { type: String, default: 'Hello World' },
  },

  setup() {
    //----------------------------------------------------------------------
    //
    //  Lifecycle hooks
    //
    //----------------------------------------------------------------------

    onMounted(() => {
      console.log(`Home onMounted`)
    })

    onUnmounted(() => {
      offAfterRouteUpdate()
      offBeforeRouteUpdate()
      offBeforeRouteLeave()
    })

    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const { routes } = useRouterUtils()
    const route = routes.home

    const message = reactive({
      title: 'Quasar',
      body: 'Beyond the framework.',
    })

    //----------------------------------------------------------------------
    //
    //  Events
    //
    //----------------------------------------------------------------------

    const offBeforeRouteUpdate = route.onBeforeRouteUpdate(async (to, from) => {
      console.log(`Home onBeforeRouteUpdate:`, { to: to.fullPath, from: from.fullPath })
    })

    const offBeforeRouteLeave = route.onBeforeRouteLeave(async (to, from) => {
      console.log(`Home onBeforeRouteLeave:`, { to: to.fullPath, from: from.fullPath })
    })

    const offAfterRouteUpdate = route.onAfterRouteUpdate(async (to, from) => {
      console.log(`Home onAfterRouteUpdate:`, { to: to.fullPath, from: from.fullPath })
    })

    async function moveToAbcPageButtonOnClick() {
      routes.abc.move(message)
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
</script>
