<style lang="sass" scoped>
@import 'src/styles/app.variables'

.input
  width: 400px
</style>

<template>
  <q-page class="layout vertical center-center">
    <img alt="Quasar logo" src="@/assets/logo.svg" style="width: 200px; height: 200px" />
    <div class="layout vertical spacing-mt-40">
      <q-input v-model="message.title" class="input" :label="$t('common.title')" />
      <q-input v-model="message.body" class="input" :label="$t('common.message')" />
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
import { defineComponent, reactive } from 'vue'
import { useRouterUtils } from '@/router'

const HomePageComp = defineComponent({
  name: 'HomePage',

  components: {},

  setup() {
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

    async function moveToAbcPageButtonOnClick() {
      routes.examples.abc.move(message)
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

export default HomePageComp
</script>
