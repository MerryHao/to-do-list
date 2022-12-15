const express = require('express')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars')
const Todo = require('./models/todo') // 載入 Todo model
const methodOverride = require('method-override') // 載入method-override
const routes = require('./routes') // 引用路由器

//僅在非正式環境(production)時，使用dotenv
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const app = express()
const port = 3000

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })

// 取得資料庫連線狀態
const db = mongoose.connection
// 連線異常
db.on('error', () => {
  console.log('mongodb error!')
})
// 連線成功
db.once('open', () => {
  console.log('mongodb connected!')
})

app.engine('hbs', exphbs({ defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', 'hbs')
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method')) // 設定每一筆請求都會透過 methodOverride 進行前置處理
app.use(routes) // 將 request 導入路由器。引入路由器時，路徑設定為 /routes 就會自動去尋找目錄下叫做 index 的檔案。

app.listen(port, () => {
  console.log(`Express is running on http://localhost:${port}`)
})