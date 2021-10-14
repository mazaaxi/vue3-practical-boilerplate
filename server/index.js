const path = require('path')
const dayjs = require('dayjs')
const jsonServer = require('json-server')

//========================================================================
//
//  Helpers
//
//========================================================================

function getUserId(req, res) {
  const authorization = req.get('Authorization')
  if (!(authorization && authorization.startsWith('Bearer '))) {
    res.header('WWW-Authenticate', `Bearer realm="token_required"`)
    sendError(res, 401, `Authorization failed because the authorization header is not set.`)
    return
  }

  const encodedIdToken = authorization.split('Bearer ')[1]
  if (!encodedIdToken.trim()) {
    res.header('WWW-Authenticate', `Bearer realm="token_required"`)
    sendError(res, 401, `Authorization failed because an id token could not be obtained from the HTTP request header.`)
    return
  }

  let idTokenObject
  try {
    idTokenObject = JSON.parse(encodedIdToken)
  } catch (err) {
    res.header('WWW-Authenticate', `Bearer error="invalid_token"`)
    sendError(res, 401, `Authentication failed because the decoding of the id token failed.`)
    return
  }

  if (!idTokenObject.uid) {
    res.header('WWW-Authenticate', `Bearer error="invalid_token"`)
    sendError(res, 401, `Authorization failed because an user id could not be obtained from the authorization header.`)
    return
  }

  return idTokenObject.uid
}

function generateId() {
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let autoId = ''
  for (let i = 0; i < 20; i++) {
    autoId += CHARS.charAt(Math.floor(Math.random() * CHARS.length))
  }
  return autoId
}

function sendError(res, code, message, detail) {
  const error = { message, detail }
  console.error(`ERROR: ${JSON.stringify(error, null, 2)}`)
  res.status(code).json({ error })
}

//========================================================================
//
//  Setup server
//
//========================================================================

const server = jsonServer.create()
const router = jsonServer.router(path.join(__dirname, 'db.json'))
const db = router.db

// デフォルトのミドルウェアを設定(logger, static, cors and no-cache)
server.use(jsonServer.defaults())

// クライアントリクエストで送らてくるデータの解析を行うパーサーを設定
server.use(jsonServer.bodyParser)

//========================================================================
//
//  REST APIs
//
//========================================================================

const APIPrefix = 'api'

server.put(`/${APIPrefix}/testData`, (req, res, next) => {
  const data = req.body

  for (const key in data) {
    db.get(key).remove().write()
    if (Array.isArray(data[key])) {
      db.get(key)
        .push(...data[key])
        .write()
    } else {
      db.set(key, data[key]).write()
    }
  }

  res.send(true)
})

server.get(`/${APIPrefix}/products`, (req, res, next) => {
  const ids = req.query.ids

  let products = []
  if (ids) {
    for (const id of ids) {
      const product = db.get('products').find({ id }).value()
      product && products.push(product)
    }
  } else {
    products = db.get('products').value()
  }

  res.json(products)
})

server.get(`/${APIPrefix}/cartItems`, (req, res, next) => {
  const uid = getUserId(req, res)
  if (!uid) return
  const ids = req.query.ids

  let cartItems = []
  if (ids) {
    for (const id of ids) {
      const cartItem = db.get('cartItems').find({ id, uid }).value()
      cartItem && cartItems.push(cartItem)
    }
  } else {
    cartItems = db.get('cartItems').filter({ uid }).value()
  }

  res.json(cartItems)
})

server.post(`/${APIPrefix}/cartItems`, (req, res, next) => {
  const uid = getUserId(req, res)
  if (!uid) return
  const inputs = req.body

  for (const input of inputs) {
    if (input.uid !== uid) {
      return sendError(res, 403, `The request user is trying to add an item to someone else's cart.`, {
        'request.uid': uid,
        'request.cartItem': input,
      })
    }
  }

  const result = []
  for (const input of inputs) {
    let cartItem = db.get('cartItems').find({ uid, productId: input.productId }).value()
    if (cartItem) {
      return sendError(res, 400, `The cart item trying to add already exists.`, {
        'exists.cartItem': cartItem,
        'input.cartItem': input,
      })
    }

    let product = db.get('products').find({ id: input.productId }).value()
    if (!product) {
      return sendError(res, 400, `There are no product.`, { 'input.cartItem': input })
    }

    const now = dayjs().toISOString()

    const cartItemId = generateId()
    cartItem = db
      .get('cartItems')
      .push({
        id: cartItemId,
        uid: input.uid,
        productId: input.productId,
        title: input.title,
        price: input.price,
        quantity: input.quantity,
        createdAt: now,
        updatedAt: now,
      })
      .find({ id: cartItemId })
      .write()

    product = db
      .get('products')
      .find({ id: cartItem.productId })
      .assign({
        stock: product.stock - cartItem.quantity,
        updatedAt: now,
      })
      .write()

    result.push({
      ...cartItem,
      product: {
        id: product.id,
        stock: product.stock,
        createdAt: product.createdAt,
        updatedAt: now,
      },
    })
  }

  res.json(result)
})

server.put(`/${APIPrefix}/cartItems`, (req, res, next) => {
  const uid = getUserId(req, res)
  if (!uid) return
  const inputs = req.body

  for (const input of inputs) {
    if (input.uid !== uid) {
      return sendError(res, 403, `The request user is trying to update an item to someone else's cart.`, {
        'request.uid': uid,
        'request.cartItem': input,
      })
    }
  }

  const result = []
  for (const input of inputs) {
    let cartItem = db.get('cartItems').find({ id: input.id, uid }).value()
    if (!cartItem) {
      return sendError(res, 400, `There are no cart item.`, { 'input.cartItem': input })
    }

    const product = db.get('products').find({ id: cartItem.productId }).value()
    if (!product) {
      return sendError(res, 400, `There are no product.`, { 'input.cartItem': input })
    }

    const now = dayjs().toISOString()

    const addedQuantity = input.quantity - cartItem.quantity
    cartItem = db
      .get('cartItems')
      .find({ id: input.id, uid: input.uid })
      .assign({
        quantity: input.quantity,
        updatedAt: now,
      })
      .write()

    const stock = product.stock - addedQuantity
    db.get('products')
      .find({ id: cartItem.productId })
      .assign({
        stock,
        updatedAt: now,
      })
      .write()

    result.push({
      ...cartItem,
      product: {
        id: product.id,
        stock,
        createdAt: product.createdAt,
        updatedAt: now,
      },
    })
  }

  res.json(result)
})

server.delete(`/${APIPrefix}/cartItems`, (req, res, next) => {
  const uid = getUserId(req, res)
  if (!uid) return
  const cartItemIds = req.query.ids

  for (const cartItemId of cartItemIds) {
    const cartItem = db.get('cartItems').find({ id: cartItemId, uid }).value()
    if (!cartItem) continue

    if (cartItem.uid !== uid) {
      return sendError(res, 403, `The request user is trying to remove an item to someone else's cart.`, {
        'request.uid': uid,
        'request.cartItem': { id: cartItemId },
      })
    }
  }

  const result = []
  for (const cartItemId of cartItemIds) {
    const cartItem = db.get('cartItems').find({ id: cartItemId, uid }).value()
    if (!cartItem) {
      throw new Error(`There are no CartItem: ${JSON.stringify({ id: cartItemId, uid })}`)
    }

    const product = db.get('products').find({ id: cartItem.productId }).value()
    if (!cartItem) {
      throw new Error(`There are no Product: ${JSON.stringify({ id: cartItem.productId })}`)
    }

    const now = dayjs().toISOString()

    db.get('cartItems').remove({ id: cartItemId }).write()

    const stock = product.stock + cartItem.quantity
    db.get('products')
      .find({ id: cartItem.productId })
      .assign({
        stock,
        updatedAt: now,
      })
      .write()

    result.push({
      ...cartItem,
      product: {
        id: product.id,
        stock,
        createdAt: product.createdAt,
        updatedAt: now,
      },
    })
  }

  res.json(result)
})

server.put(`/${APIPrefix}/cartItems/checkout`, (req, res, next) => {
  const uid = getUserId(req, res)
  if (!uid) return

  db.get('cartItems').remove({ uid }).write()

  res.send(true)
})

//========================================================================
//
//  Launch server
//
//========================================================================

// json-serverのデフォルトルーターを設定
// cf. Prefix all requests in JSON Server with middleware
//     https://stackoverflow.com/questions/49559454/prefix-all-requests-in-json-server-with-middleware
server.use('api', router)

// json-server起動
server.listen(5041, () => {
  console.log('API Server running at: http://localhost:5041/')
})
