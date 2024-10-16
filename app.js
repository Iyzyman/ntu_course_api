const express = require('express')
const supabase = require('./supabase')
const bodyParser = require('body-parser')
const session = require('express-session')
const cors = require('cors')
const app = express()

const port = process.env.PORT || 3001

app.use(
  cors({
    origin: 'http://localhost:3000',
  }),
)
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

const searchRouter = require('./routes/search') //http://localhost:3001/api/search?search=Career
app.use('/api/search', searchRouter)

const detailsRouter = require('./routes/details') //http://localhost:3001/api/details?course_code=SC1005
app.use('/api/details', detailsRouter)

const watchlistRouter = require('./routes/watchlist') //http://localhost:3001/api/watchlist?user_id=<user_id>
app.use('/api/watchlist', watchlistRouter)

const likesRouter = require('./routes/like') //http://localhost:3001/api/likedCourses/userLikes?user_id=123
app.use('/api/like', likesRouter)

const trendingRouter = require('./routes/trending') //http://localhost:3001/api/trending?time_period=3
app.use('/api/trending', trendingRouter) //By Faculty: http://localhost:3001/api/trending?time_period=3&faculty=NBS

const coursesfacultyRouter = require('./routes/coursefaculty') //http://localhost:3001/api/coursefaculty?faculty=CEE
app.use('/api/coursefaculty', coursesfacultyRouter)

const allcoursesRouter = require('./routes/allcourse') //http://localhost:3001/api/course/all
app.use('/api/course', allcoursesRouter)

const reviewRouter = require('./routes/review')
app.use('/api/review', reviewRouter)

app.listen(port, () => console.log(`Listening on port ${port}...`))