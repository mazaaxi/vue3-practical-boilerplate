import { RouteRecordRaw, createRouter, createWebHistory } from 'vue-router'
import { SupportLocales, loadLocaleMessages, setI18nLanguage } from '@/i18n'
import About from '@/views/About.vue'
import Home from '@/views/Home.vue'
import { I18n } from 'vue-i18n'
import { WritableComputedRef } from 'vue'

//----------------------------------------------------------------------
//
//  Implementation
//
//----------------------------------------------------------------------

function setupRouter(i18n: I18n) {
  const locale = i18n.mode === 'legacy' ? i18n.global.locale : (i18n.global.locale as WritableComputedRef<string>).value

  // setup routes
  const routes: RouteRecordRaw[] = [
    {
      path: '/:locale/home',
      name: 'home',
      component: Home,
    },
    {
      path: '/:locale/about',
      name: 'about',
      component: About,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: () => `/${locale}/home`,
    },
  ]

  // create router instance
  const router = createRouter({
    history: createWebHistory(),
    routes,
  })

  // navigation guards
  router.beforeEach(async to => {
    const paramsLocale = to.params.locale as string

    // use locale if paramsLocale is not in `SupportLocales`
    if (!SupportLocales.includes(paramsLocale)) {
      return `/${locale}`
    }

    // load locale messages
    if (!i18n.global.availableLocales.includes(paramsLocale)) {
      await loadLocaleMessages(i18n, paramsLocale)
    }

    // set i18n language
    setI18nLanguage(i18n, paramsLocale)
  })

  return router
}

//----------------------------------------------------------------------
//
//  Export
//
//----------------------------------------------------------------------

export { setupRouter }
