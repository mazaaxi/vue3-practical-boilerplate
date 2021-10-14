<style lang="sass" scoped>
@import 'src/styles/app.variables'
</style>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="glossy">
      <q-toolbar>
        <q-btn flat dense round @click="leftDrawerOpen = !leftDrawerOpen" aria-label="Menu" icon="menu" />

        <q-toolbar-title @click="onClick"> Quasar App</q-toolbar-title>
        <div class="spacing-mr-10">{{ d(new Date(), 'dateTime') }}</div>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-2">
      <q-list>
        <q-item-label header>Application Items</q-item-label>

        <q-item clickable tag="a" :to="`/${locale}/home`">
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Home</q-item-label>
            <q-item-label caption>home</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable tag="a" :to="`/${locale}/about`">
          <q-item-section avatar>
            <q-icon name="description" />
          </q-item-section>
          <q-item-section>
            <q-item-label>About</q-item-label>
            <q-item-label caption>about</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable tag="a" target="_blank" href="https://quasar.dev">
          <q-item-section avatar>
            <q-icon name="school" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Docs</q-item-label>
            <q-item-label caption>quasar.dev</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable tag="a" target="_blank" href="https://github.com/quasarframework/">
          <q-item-section avatar>
            <q-icon name="code" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Github</q-item-label>
            <q-item-label caption>github.com/quasarframework</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable tag="a" target="_blank" href="https://chat.quasar.dev">
          <q-item-section avatar>
            <q-icon name="chat" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Discord Chat Channel</q-item-label>
            <q-item-label caption>chat.quasar.dev</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable tag="a" target="_blank" href="https://forum.quasar.dev">
          <q-item-section avatar>
            <q-icon name="forum" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Forum</q-item-label>
            <q-item-label caption>forum.quasar.dev</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable tag="a" target="_blank" href="https://twitter.com/quasarframework">
          <q-item-section avatar>
            <q-icon name="rss_feed" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Twitter</q-item-label>
            <q-item-label caption>@quasarframework</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref, watch } from 'vue'
import { useI18n } from '@/i18n'
import { useRouterUtils } from '@/router'

export default defineComponent({
  name: 'AppPage',

  components: {},

  setup() {
    const i18n = useI18n()
    const { currentRoute } = useRouterUtils()

    watch(
      () => currentRoute.fullPath,
      async (newValue, oldValue) => {
        console.log(`currentRoute:`, { to: newValue, from: oldValue })
      }
    )

    function onClick(e) {
      console.log(i18n.d(new Date(), 'dateSec', 'en'), ': en')
      console.log(i18n.d(new Date(), 'dateSec', 'en-US'), ':en-US')
      console.log(i18n.d(new Date(), 'dateSec', 'ja'), ': ja')
      console.log(i18n.d(new Date(), 'dateSec', 'ja-JP'), ':ja-JP')
    }

    return {
      ...i18n,
      leftDrawerOpen: ref(false),
      onClick,
    }
  },
})
</script>
