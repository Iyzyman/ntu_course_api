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

const searchRouter = require('./routes/search'); //http://localhost:3001/api/search?courseCode=CS1001
app.use('/api/search', searchRouter);

const detailsRouter = require('./routes/details'); //http://localhost:3001/api/details?course_code=CS1001
app.use('/api/details', detailsRouter);

const watchlistRouter = require('./routes/watchlist'); //http://localhost:3001/api/watchlist?user_id=<user_id>
app.use('/api/watchlist', watchlistRouter);

const likesRouter = require('./routes/like'); //http://localhost:3001/api/likedCourses/userLikes?user_id=123
app.use('/api/likedCourses', likesRouter);

const trendingRouter = require('./routes/trending'); //http://localhost:3001/api/trending
app.use('/api/trending', trendingRouter); //By Faculty: http://localhost:3001/api/trending/faculty?faculty=CCDS

const coursesfacultyRouter = require('./routes/coursefaculty'); //http://localhost:3001/api/coursefaculty?faculty=CCDS
app.use('/api/coursefaculty', coursesfacultyRouter);

app.listen(port, () => console.log(`Listening on port ${port}...`))
