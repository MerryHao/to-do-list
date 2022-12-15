const express = require('express')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars')
const Todo = require('./models/todo') // 載入 Todo model
const methodOverride = require('method-override') // 載入method-override

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

app.get('/', (req, res) => {
  Todo.find() //取出Todo model裡的所有資料
    .lean() //把Mongoose的Model物件轉換成乾淨的JavaScript資料陣列
    .sort({ _id: 'asc'}) // asc sorting
    .then(todos => res.render('index', {todos})) //將樣板資料傳給index樣板
    .catch(error => console.error(error)) //錯誤處理
})

app.get('/todos/new', (req, res) => {
  return res.render('new')
})

app.post('/todos', (req, res) => {
  const name = req.body.name // 從 req.body 拿出表單裡的 name 資料
  return Todo.create({name}) // 存入資料庫
    .then(() => res.redirect('/')) // 新增完成後導回首頁
    .catch(error => console.log(error))
})

app.get('/todos/:id', (req, res) => {
  const id = req.params.id
  return Todo.findById(id) //從資料庫查找出資料
    .lean() //把資料換成單純的JS物件
    .then((todo) => res.render('detail', { todo })) //然後把資料送給前端樣板
    .catch(error => console.log(error)) //如果發生意外，執行錯誤處理
})

app.get('/todos/:id/edit', (req, res) => {
  const id = req.params.id
  return Todo.findById(id)
    .lean()
    .then((todo) => res.render('edit', { todo }))
    .catch(error => console.log(error))
})

app.put('/todos/:id', (req, res) => {
  const id = req.params.id
  const { name, isDone } = req.body
  return Todo.findById(id) //查詢資料
    .then(todo => { //如果查詢成功，修改後重新儲存資料
      todo.name = name
      todo.isDone = isDone === 'on'
      // 上面位下面的縮寫
      // if (isDone === 'on') {
      //   todo.isDone = true
      // } else {
      //   todo.isDone = false
      // }
      return todo.save()
    })
    .then(() => res.redirect(`/todos/${id}`)) //如果儲存成功，導向首頁
    .catch(error => console.log(error))
})

app.delete('/todos/:id', (req, res) => {
  const id = req.params.id
  return Todo.findById(id)
    .then(todo => todo.remove())
    .then(() => res.redirect('/'))
    .catch(error => console.log(error))
})

app.listen(port, () => {
  console.log(`Express is running on http://localhost:${port}`)
})