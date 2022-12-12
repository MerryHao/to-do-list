const express = require('express')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars')
const Todo = require('./models/todo') // 載入 Todo model

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

app.get('/', (req, res) => {
  Todo.find() //取出Todo model裡的所有資料
    .lean() //把Mongoose的Model物件轉換成乾淨的JavaScript資料陣列
    .then(todos => res.render('index', {todos})) //將樣板資料傳給index樣板
    .catch(error => console.error(error)) //錯誤處理
})


app.listen(port, () => {
  console.log(`Express is running on http://localhost:${port}`)
})