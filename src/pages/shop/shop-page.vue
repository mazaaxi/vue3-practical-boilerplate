<style lang="sass" scoped>
@import 'src/styles/app.variables'

.ShopPage
  padding: 24px
  body.screen--lg &, body.screen--xl &, body.screen--md &
    max-width: 824px
    margin: 48px auto
  body.screen--xs &, body.screen--sm &
    margin: 0

.toggle
  border: 1px solid $primary

.title-text
  @extend %text-h6

.product-item,
.cart-item
  padding: 12px

  .title
    @extend %text-subtitle1

  .detail
    @extend %text-body2
    color: $text-light

.empty-cart
  padding: 12px
  @extend %text-subtitle1

.total-amount
  padding: 12px

  .title
    @extend %text-h6

  .detail
    @extend %text-h6
    color: $text-light

.error-text
  @extend %text-body2
  color: $text-error
  text-align: right
  margin: 0 20px
</style>

<template>
  <div class="ShopPage layout vertical">
    <div class="layout horizontal center">
      <div v-show="isSignedIn">
        <div>{{ $t('abc.signedInUser', { name: user.fullName, email: user.email }) }}</div>
        <div>{{ $t('abc.signedInTime', { time: $d(new Date(), 'dateSec') }) }}</div>
      </div>
      <div class="flex-1" />
      <q-btn flat rounded color="primary" :label="isSignedIn ? $t('common.signOut') : $t('common.signIn')" @click="signInOrOutButtonOnClick" dense />
    </div>

    <div>
      <div class="layout horizontal center spacing-mt-20">
        <div class="title-text">{{ $t('shop.products') }}</div>
      </div>
      <hr style="width: 100%" />
      <div v-for="product in products" :key="product.id" class="layout horizontal center product-item">
        <div class="layout vertical center-justified">
          <div class="title">{{ product.title }}</div>
          <div class="detail">
            <span>{{ $n(product.exchangedPrice, 'currency') }}</span
            >&nbsp;/&nbsp;<span>{{ $t('shop.stock') }}:</span>
            {{ product.stock }}
          </div>
        </div>
        <div class="flex-1"></div>
        <q-btn v-show="isSignedIn" :disable="product.outOfStock" round color="primary" size="xs" icon="add" @click="addButtonOnClick(product)" />
      </div>
    </div>

    <div v-show="isSignedIn" class="spacing-mt-20">
      <div class="layout horizontal center">
        <div class="title-text">{{ $t('shop.whoseCart', { name: user.fullName }) }}</div>
        <div class="flex-1"></div>
      </div>
      <hr style="width: 100%" />
      <template v-if="cartIsEmpty">
        <div class="empty-cart">{{ $t('shop.cartIsEmpty') }}</div>
      </template>
      <template v-else>
        <div v-for="cartItem in cartItems" :key="cartItem.id" class="layout horizontal center cart-item">
          <div class="layout vertical center-justified">
            <div class="title">{{ cartItem.title }}</div>
            <div class="detail">
              <span>{{ $n(cartItem.exchangedPrice, 'currency') }}</span> x {{ cartItem.quantity }}
            </div>
          </div>
          <div class="flex-1"></div>
          <q-btn round color="primary" size="xs" icon="remove" @click="removeButtonOnClick(cartItem)" />
        </div>
      </template>
    </div>

    <div v-show="isSignedIn" class="spacing-mt-20">
      <div class="layout horizontal center">
        <div class="title-text">{{ $t('shop.total') }}</div>
        <div class="flex-1"></div>
      </div>
      <hr style="width: 100%" />
      <div class="layout horizontal center">
        <div class="total-amount layout horizontal center">
          <div class="detail">{{ $n(cartTotalPrice, 'currency') }}</div>
        </div>
        <div class="flex-1"></div>
        <q-btn :disable="cartIsEmpty" :label="$t('shop.checkout')" color="primary" @click="checkoutButtonOnClick" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { CartItem, Product, useService } from '@/services'
import { computed, defineComponent, onMounted, reactive, toRefs } from 'vue'
import { Loading } from 'quasar'
import { TestUsers } from '@/services/test-data'
import { useDialogs } from '@/dialogs'
import { useI18n } from '@/i18n'

export default defineComponent({
  name: 'ShopPage',

  setup(props, context) {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const services = useService()
    const i18n = useI18n()
    const dialogs = useDialogs()

    const isSignedIn = computed(() => services.account.isSignedIn)

    const user = reactive({
      ...toRefs(services.account.user),
      fullName: computed(() => `${services.account.user.first} ${services.account.user.last}`),
    })

    const exchangeRate = computed(() => {
      return services.shop.getExchangeRate(i18n.locale.value as string)
    })

    const products = computed(() => {
      return services.shop.products.map(product => ({
        ...product,
        exchangedPrice: product.price * exchangeRate.value,
        outOfStock: product.stock === 0,
      }))
    })

    const cartItems = computed(() => {
      return services.shop.cartItems.map(cartItem => ({
        ...cartItem,
        exchangedPrice: cartItem.price * exchangeRate.value,
      }))
    })

    const cartTotalPrice = computed(() => services.shop.cartTotalPrice * exchangeRate.value)

    const cartIsEmpty = computed(() => cartItems.value.length === 0)

    //----------------------------------------------------------------------
    //
    //  Lifecycle hooks
    //
    //----------------------------------------------------------------------

    onMounted(async () => {
      Loading.show()
      await services.shop.fetchProducts()
      Loading.hide()
    })

    //----------------------------------------------------------------------
    //
    //  Events
    //
    //----------------------------------------------------------------------

    async function signInOrOutButtonOnClick() {
      if (isSignedIn.value) {
        await services.account.signOut()
      } else {
        const index = Math.floor(Math.random() * 2)
        await services.account.signIn(TestUsers[index].id)
      }
    }

    async function addButtonOnClick(product: Product) {
      Loading.show()
      await services.shop.addItemToCart(product.id)
      Loading.hide()
    }

    async function removeButtonOnClick(cartItem: CartItem) {
      Loading.show()
      await services.shop.removeItemFromCart(cartItem.productId)
      Loading.hide()
    }

    async function checkoutButtonOnClick() {
      const confirmed = await dialogs.message.open({
        type: 'confirm',
        title: i18n.t('shop.shoppingCart'),
        message: i18n.t('shop.checkoutQ'),
      })
      if (!confirmed) return

      Loading.show()
      await services.shop.checkout()
      Loading.hide()
    }

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    return {
      isSignedIn,
      user,
      products,
      cartItems,
      cartTotalPrice,
      cartIsEmpty,
      signInOrOutButtonOnClick,
      addButtonOnClick,
      removeButtonOnClick,
      checkoutButtonOnClick,
    }
  },
})
</script>
