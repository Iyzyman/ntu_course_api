const express = require('express')
const supabase = require('./supabase')
const bodyParser = require('body-parser')
const session = require('express-session')
const app = express()

const port = process.env.PORT || 3001

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static('build'))
// app.use(
//   session({
//     secret: 'your-secret-key',
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       httpOnly: false,
//     },
//   }),
// )

app.get('/', (req, res) => {
  res.send('Testing')
})

const discoverRouter = require('./routes/discover')
app.use('/api/discover', discoverRouter)

const authRouter = require('./routes/auth')
app.use('/api/auth', authRouter)

app.listen(port, () => console.log(`Listening on port ${port}...`))
