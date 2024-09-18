const express = require('express');
const supabase = require('./supabase');
const bodyParser = require('body-parser');

// console.log('TESTING SUPABASE CLIENT:',supabase);

const app = express();

const port = process.env.PORT || 3001;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('build'));

app.get('/', (req, res) => {
  res.send('Testing')
})

app.get('/api/courses', async (req, res) => {
  // return an array of schools
  // for each school, an array of courses, course count
  
  let { data: courses, error } = await supabase
  .from('courses')
  .select('*').range(0,10)

  // res.send(courses);

  hashMap = {};

  for (let course of courses){
    if (!hashMap[course.Faculty]){
      hashMap[course.Faculty] = [];
      hashMap[course.Faculty].push([{
        courseCode: course.courseCode,
        courseTitle: course.courseTitle,
        Description: course.Description
      }]);
    }
    else
    {
      // console.log(hashMap[course.courseCode]);
      hashMap[course.Faculty][0].push({
        courseCode: course.courseCode,
        courseTitle: course.courseTitle,
        Description: course.Description
      });
    }
  }

  let tempArray = Object.entries(hashMap);
  let finalArray = tempArray;

  for (let faculty of finalArray){
    faculty.push(faculty[1][0].length);
  }

  // res.send(hashMap)
  res.send(finalArray);

  /* 
   HashMap should look like this:
  {
    'SOH': [coursesCount, [{
      'Course Code': '',
      'Course Title':'',    
      .... 
    }, 
    {
      'Course Code': '',
      'Course Title':'',    
      .... 
    }, 
    ....
  ]]
  }
  
  Final array should look like this:
  [{
    'faculty': '',
    'courses': [],
    'courseCount': '', 
  },
  {    
    'faculty': '',
    'courses': [],
    'courseCount': '', 
  }]

  Current array looks like:
  [ schoolName, [ array of courses ], coursesCount]

  */

});



app.listen(port, () => console.log(`Listening on port ${port}...`));
