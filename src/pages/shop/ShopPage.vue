<style lang="scss" scoped>
.ShopPage {
  padding: 24px;

  body.screen--lg &,
  body.screen--xl &,
  body.screen--md & {
    max-width: 824px;
    margin: 48px auto;
  }

  body.screen--xs &,
  body.screen--sm & {
    margin: 0;
  }
}

.signInSection {
  display: flex;
  flex-direction: row;
  align-items: center;

  .spacer {
    flex: 1;
  }

  body.screen--xs &,
  body.screen--sm & {
    display: flex;
    flex-direction: column;

    .signInInfo {
      align-self: start;
    }

    .signInBtn {
      align-self: end;
    }
  }
}

.titleText {
  @extend %text-h6;
}

.productItem,
.cartItem {
  padding: 12px;

  .title {
    @extend %text-subtitle1;
  }

  .detail {
    @extend %text-body2;
    color: $text-light;
  }
}

.emptyCart {
  padding: 12px;
  @extend %text-subtitle1;
}

.totalAmount {
  padding: 12px;

  .title {
    @extend %text-h6;
  }

  .detail {
    @extend %text-h6;
    color: $text-light;
  }
}
</style>

<template>
  <div class="ShopPage column">
    <div class="signInSection">
      <div v-show="isSignedIn" class="signInInfo">
        <div>{{ $t('abc.signedInUser', { name: user.fullName, email: user.email }) }}</div>
        <div>{{ $t('abc.signedInTime', { time: $d(new Date(), 'dateSec') }) }}</div>
      </div>
      <div class="spacer" />
      <q-btn
        class="signInBtn"
        flat
        rounded
        color="primary"
        :label="isSignedIn ? $t('common.signOut') : $t('common.signIn')"
        @click="signInOrOutButtonOnClick"
        dense
      />
    </div>

    <div>
      <div class="row items-center q-mt-xl">
        <div class="titleText">{{ $t('shop.products') }}</div>
      </div>
      <hr class="full-width" />
      <div v-for="product in products" :key="product.id" class="productItem row items-center">
        <div class="column justify-center col-grow">
          <div class="title">{{ product.title }}</div>
          <div class="detail">
            <span>{{ $n(product.price * exchangeRate, 'currency') }}</span
            >&nbsp;/&nbsp;<span>{{ $t('shop.stock') }}:</span>
            {{ product.stock }}
          </div>
        </div>
        <q-btn
          v-show="isSignedIn"
          :disable="product.outOfStock"
          round
          color="primary"
          size="xs"
          icon="add"
          @click="addButtonOnClick(product)"
        />
      </div>
    </div>

    <div v-show="isSignedIn" class="space-mt-20">
      <div class="row items-center">
        <div class="titleText">{{ $t('shop.whoseCart', { name: user.fullName }) }}</div>
      </div>
      <hr style="width: 100%" />
      <template v-if="isCartEmpty">
        <div class="emptyCart">{{ $t('shop.isCartEmpty') }}</div>
      </template>
      <template v-else>
        <div v-for="cartItem in cartItems" :key="cartItem.id" class="cartItem row items-center">
          <div class="column justify-center col-grow">
            <div class="title">{{ cartItem.title }}</div>
            <div class="detail">
              <span>{{ $n(cartItem.price * exchangeRate, 'currency') }}</span> x
              {{ cartItem.quantity }}
            </div>
          </div>
          <q-btn
            round
            color="primary"
            size="xs"
            icon="remove"
            @click="removeButtonOnClick(cartItem)"
          />
        </div>
      </template>
    </div>

    <div v-show="isSignedIn" class="space-mt-20">
      <div class="row items-center">
        <div class="titleText">{{ $t('shop.total') }}</div>
      </div>
      <hr class="full-width" />
      <div class="row items-center">
        <div class="totalAmount row items-center col-grow">
          <div class="detail">{{ $n(cartTotalPrice, 'currency') }}</div>
        </div>
        <q-btn
          :disable="isCartEmpty"
          :label="$t('shop.checkout')"
          color="primary"
          @click="checkoutButtonOnClick"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { AppServices, CartItem, Product } from '@/services'
import { computed, defineComponent, onMounted, onUnmounted, reactive, ref, toRefs } from 'vue'
import { AppDialogs } from '@/dialogs'
import { AppI18n } from '@/i18n'
import { Loading } from 'quasar'
import { assertNonNullable } from 'js-common-lib'

const ShopPage = defineComponent({
  setup(props, context) {
    //----------------------------------------------------------------------
    //
    //  Lifecycle hooks
    //
    //----------------------------------------------------------------------

    onMounted(async () => {
      Loading.show()
      await services.shop.fetchProducts()
      isSignedIn.value && (await services.shop.fetchUserCartItems())
      Loading.hide()
    })

    onUnmounted(() => {
      offProductsChange()
      offUserCartItemsChange()
    })

    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const services = AppServices.use()
    const i18n = AppI18n.use()
    const dialogs = AppDialogs.use()

    const isSignedIn = computed(() => services.account.isSignedIn)

    // see below for why we use `toRefs`:
    // https://v3.vuejs.org/guide/reactivity-fundamentals.html#destructuring-reactive-state
    const user = reactive({
      ...toRefs(services.account.user),
      fullName: computed(() => `${services.account.user.first} ${services.account.user.last}`),
    })

    const exchangeRate = computed(() => {
      return services.shop.getExchangeRate(i18n.locale.value as string)
    })

    const products = ref<(Product & { outOfStock: boolean })[]>([])

    const cartItems = ref<CartItem[]>([])

    const cartTotalPrice = computed(() => services.shop.cartTotalPrice * exchangeRate.value)

    const isCartEmpty = computed(() => cartItems.value.length === 0)

    //----------------------------------------------------------------------
    //
    //  Events
    //
    //----------------------------------------------------------------------

    const offProductsChange = services.shop.onProductsChange(
      (changeType, newProduct, oldProduct) => {
        const toPageProduct = (product: Product) => ({
          ...product,
          outOfStock: product.stock === 0,
        })

        if (changeType === 'Add' || changeType === 'Update') {
          assertNonNullable(newProduct)
          const targetProduct = products.value.find(product => product.id === newProduct.id)
          if (!targetProduct) {
            products.value.push(toPageProduct(newProduct))
          } else {
            Object.assign(targetProduct, toPageProduct(newProduct))
          }
        } else {
          assertNonNullable(oldProduct)
          const targetProductIndex = products.value.findIndex(
            product => product.id === oldProduct.id
          )
          targetProductIndex >= 0 && products.value.splice(targetProductIndex, 1)
        }
      }
    )

    const offUserCartItemsChange = services.shop.onUserCartItemsChange(
      (changeType, newCartItem, oldCartItem) => {
        const toPageCartItem = (cartItem: CartItem) => ({
          ...cartItem,
        })

        if (changeType === 'Add' || changeType === 'Update') {
          assertNonNullable(newCartItem)
          const targetCartItem = cartItems.value.find(cartItem => cartItem.id === newCartItem.id)
          if (!targetCartItem) {
            cartItems.value.push(toPageCartItem(newCartItem))
          } else {
            Object.assign(targetCartItem, toPageCartItem(newCartItem))
          }
        } else {
          assertNonNullable(oldCartItem)
          const targetCartItemIndex = cartItems.value.findIndex(
            cartItem => cartItem.id === oldCartItem.id
          )
          targetCartItemIndex >= 0 && cartItems.value.splice(targetCartItemIndex, 1)
        }
      }
    )

    async function signInOrOutButtonOnClick() {
      if (isSignedIn.value) {
        await services.account.signOut()
      } else {
        dialogs.signIn.open()
      }
    }

    async function addButtonOnClick(product: Product) {
      Loading.show()
      await services.shop.incrementCartItem(product.id)
      Loading.hide()
    }

    async function removeButtonOnClick(cartItem: CartItem) {
      Loading.show()
      await services.shop.decrementCartItem(cartItem.productId)
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
      exchangeRate,
      products,
      cartItems,
      cartTotalPrice,
      isCartEmpty,
      signInOrOutButtonOnClick,
      addButtonOnClick,
      removeButtonOnClick,
      checkoutButtonOnClick,
    }
  },
})

export default ShopPage
</script>
