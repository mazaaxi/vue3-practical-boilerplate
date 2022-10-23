<style lang="scss" scoped>
.AboutView {
  body.screen--lg &,
  body.screen--xl &,
  body.screen--md & {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}

.message {
  display: flex;
  align-items: center;

  body.screen--xs &,
  body.screen--sm & {
    margin-top: 20px;
  }
}
</style>

<template>
  <div class="AboutView">
    <div class="message">
      <q-btn class="text-h5 q-mr-sm" icon="info" @click="iconOnClick" />
      <span class="text-h3">This is an about page</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/i18n'
import { useServices } from '@/services'

const i18n = useI18n()
const services = useServices()

async function iconOnClick() {
  console.log(i18n.t('langs.ja'))

  // const products = await services.shop.fetchProducts()
  // console.log(JSON.stringify(products, null, 2))
}
</script>
