<style lang="sass" scoped>
@import 'src/styles/app.variables'

.menu
  .list
    .item
      white-space: nowrap
</style>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="glossy">
      <q-toolbar>
        <q-btn flat dense round @click="leftDrawerOpen = !leftDrawerOpen" aria-label="Menu" icon="menu" />

        <q-toolbar-title>Vue3 App</q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>

        <q-btn class="spacing-ml-10" flat round dense color="white" icon="more_vert">
          <q-menu class="menu">
            <q-list class="list">
              <!-- Sing-in or Sign-out -->
              <q-item class="item" v-close-popup clickable>
                <q-item-section @click="signInMenuItemOnClick">{{ isSignedIn ? $t('common.signOut') : $t('common.signIn') }}</q-item-section>
              </q-item>
              <!-- Languages -->
              <q-item clickable>
                <q-item-section>{{ $t('common.lang', 2) }}</q-item-section>
                <q-item-section side>
                  <q-icon name="keyboard_arrow_right" />
                </q-item-section>
                <q-menu anchor="top end" self="top start">
                  <q-list>
                    <q-item class="item" v-close-popup clickable>
                      <q-item-section @click="langMenuItemOnclick('en')">{{ $t('langs.en') }}</q-item-section>
                    </q-item>
                    <q-item class="item" v-close-popup clickable>
                      <q-item-section @click="langMenuItemOnclick('ja')">{{ $t('langs.ja') }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-item>
              <q-separator />
              <!-- Anchor Dialog -->
              <q-item class="item" v-close-popup clickable>
                <q-item-section @click="anchorDialogItemOnClick">{{ $t('app.anchorDialog.name') }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
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

        <q-item clickable tag="a" :to="`/${locale}/abc`">
          <q-item-section avatar>
            <q-icon name="code" />
          </q-item-section>
          <q-item-section>
            <q-item-label>ABC</q-item-label>
            <q-item-label caption>abc</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable tag="a" :to="`/${locale}/shop`">
          <q-item-section avatar>
            <q-icon name="fas fa-shopping-bag" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Shop</q-item-label>
            <q-item-label caption>shop</q-item-label>
          </q-item-section>
        </q-item>

        <q-item-label header>Quasar Items</q-item-label>

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
            <q-icon name="fab fa-github" />
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

  <DialogContainer ref="dialogContainer" />
</template>

<script lang="ts">
import { DialogContainer, setupDialogs } from '@/dialogs'
import { computed, defineComponent, ref, watch } from 'vue'
import { useI18n, useI18nUtils } from '@/i18n'
import { TestUsers } from '@/services/test-data'
import { setupService } from '@/services'
import { setupServiceWorker } from '@/service-worker'
import { showNotification } from '@/base'
import { useRouterUtils } from '@/router'

export default defineComponent({
  name: 'AppPage',

  components: {
    DialogContainer,
  },

  setup() {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const services = setupService()
    const serviceWorker = setupServiceWorker()
    const i18n = useI18n()
    const { loadI18nLocaleMessages } = useI18nUtils()
    const { currentRoute } = useRouterUtils()

    const dialogContainer = ref<DialogContainer>()
    const dialogs = setupDialogs(dialogContainer)

    const leftDrawerOpen = ref(false)
    const isSignedIn = computed(() => services.account.isSignedIn)

    //----------------------------------------------------------------------
    //
    //  Events
    //
    //----------------------------------------------------------------------

    let closeUpdatingNotification: Function | undefined

    watch(
      () => currentRoute.fullPath,
      async (newValue, oldValue) => {
        // console.log(`currentRoute:`, { to: newValue, from: oldValue })
      }
    )

    serviceWorker.onStateChange(info => {
      if (info.state === 'updating') {
        closeUpdatingNotification = showNotification('info', i18n.t('site.updating'), {
          timeout: 0,
          actions: 'none',
        })
      }

      if (info.state === 'updated') {
        closeUpdatingNotification?.()
        showNotification('info', i18n.t('site.updated'), {
          actions: [
            {
              label: i18n.t('common.reload'),
              handler: () => window.location.reload(),
            },
          ],
          timeout: 0,
        })
      }

      if (info.state === 'error') {
        console.error(info.message)
      } else {
        console.log('ServiceWorker:', JSON.stringify(info, null, 2))
      }
    })

    async function langMenuItemOnclick(lang: string) {
      await loadI18nLocaleMessages(lang)
    }

    async function signInMenuItemOnClick() {
      if (isSignedIn.value) {
        await services.account.signOut()
      } else {
        const index = Math.floor(Math.random() * 2)
        await services.account.signIn(TestUsers[index].id)
      }
    }

    async function anchorDialogItemOnClick() {
      dialogs.anchor.open({
        title: i18n.t('app.anchorDialog.name'),
        message: i18n.t('app.anchorDialog.message'),
      })
    }

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    return {
      locale: i18n.locale,
      dialogContainer,
      leftDrawerOpen,
      isSignedIn,
      langMenuItemOnclick,
      signInMenuItemOnClick,
      anchorDialogItemOnClick,
    }
  },
})
</script>
