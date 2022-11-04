import { customAlphabet } from 'nanoid'
import dayjs from 'dayjs'
import jsonServer from 'json-server'
import path from 'path'
import url from 'url'

//========================================================================
//
//  Constants
//
//========================================================================

const VITE_APP_API_PORT = 5051

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

//========================================================================
//
//  Helpers
//
//========================================================================

function getUserId(req, res) {
  const authorization = req.get('Authorization')
  if (!(authorization && authorization.startsWith('Bearer '))) {
    res.header('WWW-Authenticate', `Bearer realm="token_required"`)
    sendError(res, 401, `Authorization failed because an authorization header is not set.`)
    return
  }

  const encodedIdToken = authorization.split('Bearer ')[1]
  if (!encodedIdToken.trim()) {
    res.header('WWW-Authenticate', `Bearer realm="token_required"`)
    sendError(
      res,
      401,
      `Authorization failed because an id token could not be obtained from a HTTP request header.`
    )
    return
  }

  let idTokenObject
  try {
    idTokenObject = JSON.parse(encodedIdToken)
  } catch (err) {
    res.header('WWW-Authenticate', `Bearer error="invalid_token"`)
    sendError(res, 401, `Authentication failed because a decoding of an id token failed.`)
    return
  }

  if (!idTokenObject.uid) {
    res.header('WWW-Authenticate', `Bearer error="invalid_token"`)
    sendError(
      res,
      401,
      `Authorization failed because an user id could not be obtained from an authorization header.`
    )
    return
  }

  return idTokenObject.uid
}

function generateId() {
  const nanoid = customAlphabet(
    '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    20
  )
  return nanoid()
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

// set default middleware
// ex. logger, static, cors and no-cache
server.use(jsonServer.defaults())

// set a parser to parse data sent by client requests
server.use(jsonServer.bodyParser)

// set a router
// cf. Prefix all requests in JSON Server with middleware
//     https://stackoverflow.com/questions/49559454/prefix-all-requests-in-json-server-with-middleware
server.use('api', router)

//========================================================================
//
//  REST APIs
//
//========================================================================

const APIPrefix = 'api'

server.put(`/${APIPrefix}/test_data`, (req, res, next) => {
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

server.get(`/${APIPrefix}/cart_items`, (req, res, next) => {
  const uid = getUserId(req, res)
  if (!uid) return

  const cartItems = db.get('cart_items').filter({ uid }).value()

  res.json(cartItems)
})

server.post(`/${APIPrefix}/cart_items`, (req, res, next) => {
  const uid = getUserId(req, res)
  if (!uid) return
  const inputs = req.body

  for (const input of inputs) {
    if (input.uid !== uid) {
      return sendError(
        res,
        403,
        `A request user is trying to add an item to someone else's cart.`,
        {
          'request.uid': uid,
          'request.cart_item': input,
        }
      )
    }
  }

  const result = []
  for (const input of inputs) {
    let cartItem = db.get('cart_items').find({ uid, product_id: input.product_id }).value()
    if (cartItem) {
      return sendError(res, 400, `A cart item trying to add already exists.`, {
        'exists.cart_item': cartItem,
        'input.cart_item': input,
      })
    }

    let product = db.get('products').find({ id: input.product_id }).value()
    if (!product) {
      return sendError(res, 400, `There are no product.`, { 'input.cart_item': input })
    }

    const now = dayjs().toISOString()

    const cartItemId = generateId()
    cartItem = db
      .get('cart_items')
      .push({
        id: cartItemId,
        uid: input.uid,
        product_id: input.product_id,
        title: input.title,
        price: input.price,
        quantity: input.quantity,
        created_at: now,
        updated_at: now,
      })
      .find({ id: cartItemId })
      .write()

    product = db
      .get('products')
      .find({ id: cartItem.product_id })
      .assign({
        stock: product.stock - cartItem.quantity,
        updated_at: now,
      })
      .write()

    result.push({
      ...cartItem,
      product: {
        id: product.id,
        stock: product.stock,
        created_at: product.created_at,
        updated_at: now,
      },
    })
  }

  res.json(result)
})

server.put(`/${APIPrefix}/cart_items`, (req, res, next) => {
  const uid = getUserId(req, res)
  if (!uid) return
  const inputs = req.body

  for (const input of inputs) {
    if (input.uid !== uid) {
      return sendError(
        res,
        403,
        `A request user is trying to update an item to someone else's cart.`,
        {
          'request.uid': uid,
          'request.cart_item': input,
        }
      )
    }
  }

  const result = []
  for (const input of inputs) {
    let cartItem = db.get('cart_items').find({ id: input.id, uid }).value()
    if (!cartItem) {
      return sendError(res, 400, `There are no cart item.`, { 'input.cart_item': input })
    }

    const product = db.get('products').find({ id: cartItem.product_id }).value()
    if (!product) {
      return sendError(res, 400, `There are no product.`, { 'input.cart_item': input })
    }

    const now = dayjs().toISOString()

    const addedQuantity = input.quantity - cartItem.quantity
    cartItem = db
      .get('cart_items')
      .find({ id: input.id, uid: input.uid })
      .assign({
        quantity: input.quantity,
        updated_at: now,
      })
      .write()

    const stock = product.stock - addedQuantity
    db.get('products')
      .find({ id: cartItem.product_id })
      .assign({
        stock,
        updated_at: now,
      })
      .write()

    result.push({
      ...cartItem,
      product: {
        id: product.id,
        stock,
        created_at: product.created_at,
        updated_at: now,
      },
    })
  }

  res.json(result)
})

server.delete(`/${APIPrefix}/cart_items`, (req, res, next) => {
  const uid = getUserId(req, res)
  if (!uid) return
  const cartItemIds = req.query.ids

  for (const cartItemId of cartItemIds) {
    const cartItem = db.get('cart_items').find({ id: cartItemId, uid }).value()
    if (!cartItem) continue

    if (cartItem.uid !== uid) {
      return sendError(
        res,
        403,
        `A request user is trying to remove an item to someone else's cart.`,
        {
          'request.uid': uid,
          'request.cart_item': { id: cartItemId },
        }
      )
    }
  }

  const result = []
  for (const cartItemId of cartItemIds) {
    const cartItem = db.get('cart_items').find({ id: cartItemId, uid }).value()
    if (!cartItem) {
      throw new Error(`There are no CartItem: ${JSON.stringify({ id: cartItemId, uid })}`)
    }

    const product = db.get('products').find({ id: cartItem.product_id }).value()
    if (!cartItem) {
      throw new Error(`There are no Product: ${JSON.stringify({ id: cartItem.product_id })}`)
    }

    const now = dayjs().toISOString()

    db.get('cart_items').remove({ id: cartItemId }).write()

    const stock = product.stock + cartItem.quantity
    db.get('products')
      .find({ id: cartItem.product_id })
      .assign({
        stock,
        updated_at: now,
      })
      .write()

    result.push({
      ...cartItem,
      product: {
        id: product.id,
        stock,
        created_at: product.created_at,
        updated_at: now,
      },
    })
  }

  res.json(result)
})

server.put(`/${APIPrefix}/cart_items/checkout`, (req, res, next) => {
  const uid = getUserId(req, res)
  if (!uid) return

  db.get('cart_items').remove({ uid }).write()

  res.send(true)
})

//========================================================================
//
//  Launch server
//
//========================================================================

// launch json-server
server.listen(VITE_APP_API_PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API Server running at: http://localhost:${VITE_APP_API_PORT}/`)
})
