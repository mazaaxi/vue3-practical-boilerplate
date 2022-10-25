<style lang="scss" scoped>
.RoutingPage {
  body.screen--lg &,
  body.screen--xl &,
  body.screen--md & {
    max-width: 848px;
    padding: 48px;
    margin: 0 auto;
  }

  body.screen--xs &,
  body.screen--sm & {
    padding: 24px;
  }

  .logInput {
    width: 100%;
    min-height: 300px;
    font-family: 'MS Gothic', 'Osaka-Mono', monospace;
    font-size: 13px;
    @extend %layout-flex-1;

    &::v-deep(.q-field__control) {
      height: 100%;
    }
  }
}

.pageContainer {
  width: 100%;
  padding: 10px;

  .pageNumBtn {
    color: $primary;

    &.active {
      color: $accent;
    }
  }
}
</style>

<template>
  <q-page class="RoutingPage layout vertical center">
    <q-card class="pageContainer">
      <div class="layout horizontal center-justified">
        <q-btn flat color="primary" noCaps @click="backHistoryButtonOnClick">
          <div class="layout horizontal center">
            <q-icon name="arrow_back" />
            <div class="space-ml-10">{{ $t('routing.backHistory') }}</div>
          </div>
        </q-btn>
        <q-btn flat color="primary" noCaps @click="forwardHistoryButtonOnClick">
          <div class="layout horizontal center">
            <div class="space-mr-10">{{ $t('routing.forwardHistory') }}</div>
            <q-icon name="arrow_forward" />
          </div>
        </q-btn>
      </div>
      <div class="layout horizontal center-justified">
        <q-btn flat color="primary" label="<" @click="prevPageButtonOnClick" />
        <q-btn
          v-for="page in pages"
          :key="page"
          class="pageNumBtn"
          :class="{ active: page === currentPage }"
          flat
          :label="page"
          @click="pageButtonOnClick(page)"
        />
        <q-btn flat color="primary" label=">" @click="nextPageButtonOnClick" />
      </div>
    </q-card>

    <div class="layout horizontal end-justified full-width">
      <q-btn icon="description" color="primary" flat @click="descButtonOnClick">
        <q-tooltip>{{ $t('routing.logCurrentRoute') }}</q-tooltip>
      </q-btn>
      <q-btn icon="delete" color="primary" flat @click="clearLogMessageButtonOnClick">
        <q-tooltip>{{ $t('routing.clearLog') }}</q-tooltip>
      </q-btn>
    </div>

    <q-input ref="logInput" v-model="logMessage" class="logInput" type="textarea" filled readonly />
  </q-page>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, ref } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import type { QInput } from 'quasar'
import type { RouteLocationNormalized } from 'vue-router'
import { useRouter } from '@/router'
import { useScreen } from '@/base'

const RoutingPage = defineComponent({
  name: 'RoutingPage',

  components: {},

  setup(props, ctx) {
    //----------------------------------------------------------------------
    //
    //  Lifecycle hooks
    //
    //----------------------------------------------------------------------

    onMounted(async () => {
      const min = Math.min(...pages.value)
      const max = Math.max(...pages.value)
      if (isNaN(route.page) || route.page < min || max < route.page) {
        await route.replacePage(1)
      }
    })

    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const router = useRouter()
    const route = router.routes.examples.routing
    const screen = useScreen()

    const logInput = ref<QInput>()

    const deviceType = computed(() => (screen.gt.md ? 'PC' : 'SP'))

    const pages = ref([1, 2, 3])

    const currentPage = computed(() => route.page || 1)

    const logMessage = ref('')

    //----------------------------------------------------------------------
    //
    //  Internal methods
    //
    //----------------------------------------------------------------------

    function writLogRouteEvent(
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      event: string,
      blocked: boolean
    ): void {
      const blockedTitle = blocked ? ' blocked' : ''
      const historyTitle = route.isHistoryMoving ? ' history move' : ' page move'
      const fromPath = `from : ${from.fullPath}`
      const toPath = `  to : ${to.fullPath}`
      logMessage.value += `[${event}]${blockedTitle}${historyTitle}\n${fromPath}\n${toPath}\n\n`

      nextTick(() => {
        const inputEl = logInput.value!.getNativeElement() as HTMLTextAreaElement
        inputEl.scrollTop = inputEl.scrollHeight
      })
    }

    function writLogRouteDetail(): void {
      const routeDetail = JSON.stringify(route, null, 2)
      logMessage.value += `[currentRoute]\n${routeDetail}\n\n`

      nextTick(() => {
        const inputEl = logInput.value!.getNativeElement() as HTMLTextAreaElement
        inputEl.scrollTop = inputEl.scrollHeight
      })
    }

    //----------------------------------------------------------------------
    //
    //  Events
    //
    //----------------------------------------------------------------------

    onBeforeRouteUpdate((to, from, next) => {
      const toData = route.parse(to.fullPath)
      const newPage = toData?.page || 0

      const min = Math.min(...pages.value)
      const max = Math.max(...pages.value)

      // moving outside the scope of the page is not allowed
      if (newPage < min || max < newPage) {
        next(false)
        writLogRouteEvent(to, from, 'onBeforeRouteUpdate', true)
        return
      }

      writLogRouteEvent(to, from, 'onBeforeRouteUpdate', false)
      next()
    })

    onBeforeRouteLeave((to, from, next) => {
      // moving to another page by history move is not allowed
      if (route.isHistoryMoving) {
        writLogRouteEvent(to, from, 'onBeforeRouteLeave', true)
        next(false)
        return
      }

      next()
    })

    function pageButtonOnClick(page: number) {
      route.move(page)
    }

    function prevPageButtonOnClick() {
      route.move(currentPage.value - 1)
    }

    function nextPageButtonOnClick() {
      route.move(currentPage.value + 1)
    }

    function backHistoryButtonOnClick() {
      window.history.back()
    }

    function forwardHistoryButtonOnClick() {
      window.history.forward()
    }

    function clearLogMessageButtonOnClick() {
      logMessage.value = ''
    }

    function descButtonOnClick() {
      writLogRouteDetail()
    }

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    return {
      screen,
      logInput,
      deviceType,
      pages,
      currentPage,
      logMessage,
      pageButtonOnClick,
      prevPageButtonOnClick,
      nextPageButtonOnClick,
      backHistoryButtonOnClick,
      forwardHistoryButtonOnClick,
      clearLogMessageButtonOnClick,
      descButtonOnClick,
    }
  },
})

export default RoutingPage
</script>
