export default {
  common: {
    ok: 'OK',
    cancel: 'キャンセル',
    yes: 'はい',
    no: 'いいえ',
    reload: 'リロード',
    signIn: 'サインイン',
    signOut: 'サインアウト',
    send: '送信',
    lang: '言語',
    title: 'タイトル',
    message: 'メッセージ',
    email: 'メール',
    password: 'パスワード',
    clear: 'クリア',
  },
  langs: {
    en: '英語',
    ja: '日本語',
  },
  error: {
    required: '{target}は必須です。',
    invalid: '{target}は不正です。',
  },
  site: {
    updating: 'サイトアップデートをダウンロードしています。',
    updated:
      'サイトアップデートがダウンロードされました。\nリロードするとアップデートが適用されます。',
  },
  app: {
    updated: 'アプリケーションが更新されました。',
    anchorDialog: {
      name: 'アンカーダイアログ',
      message:
        'このダイアログはアンカーダイアログです。\nブラウザをリロードすると、再度このダイアログが表示されます。',
    },
  },
  home: {
    moveToAbcPage: 'ABCページへ移動',
  },
  abc: {
    signedInUser: '{name} <{email}>',
    signedInTime: 'サインイン時刻: {time}',
  },
  shop: {
    shoppingCart: 'ショッピングカート',
    products: '商品一覧',
    whoseCart: '{name} のカート',
    price: '価格',
    stock: '在庫',
    total: '合計',
    checkout: '精算',
    isCartEmpty: 'カートは空です。',
    checkoutQ: '精算してもよろしいですか？',
  },
  routing: {
    backHistory: '前の履歴へ',
    forwardHistory: '次の履歴へ',
    logCurrentRoute: '現在のルートをログ表示',
    clearLog: 'ログをクリア',
  },
  serviceWorker: {
    ready: 'ServiceWorkerが起動しました。',
    installing: 'ServiceWorkerをインストールしています。',
    updating: 'ServiceWorkerを更新しています。',
    installed: 'ServiceWorkerがインストールされました。',
    updated: 'ServiceWorkerが更新されました。',
    offline: 'サーバーへ接続できないため、ServiceWorkerはオフラインモードで実行しています。',
    error: 'ServiceWorkerの登録でエラーが発生しました.',
  },
  signIn: {
    signInError: '指定された "{email}" が存在しないか、パスワードが一致しません。',
  },
}
