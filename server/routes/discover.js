const express = require('express')
const supabase = require('../supabase')
const router = express.Router()

router.get('/', async (req, res) => {
  // return an array of schools
  // for each school, an array of courses, course count

  let {data: courses, error} = await supabase
    .from('courses')
    .select('*')
    .range(0, 10)

  hashMap = {}

  for (let course of courses) {
    if (!hashMap[course.Faculty]) {
      hashMap[course.Faculty] = []
      hashMap[course.Faculty].push([
        {
          courseCode: course.courseCode,
          courseTitle: course.courseTitle,
          Description: course.Description,
        },
      ])
    } else {
      // console.log(hashMap[course.courseCode]);
      hashMap[course.Faculty][0].push({
        courseCode: course.courseCode,
        courseTitle: course.courseTitle,
        Description: course.Description,
      })
    }
  }

  let tempArray = Object.entries(hashMap)
  let finalArray = tempArray

  for (let faculty of finalArray) {
    faculty.push(faculty[1][0].length)
  }

  /* 
  response should look like this:
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

  finalArray looks like:
  [ [ schoolName, [ array of courses ], coursesCount] ,  [ schoolName, [ array of courses ], coursesCount] ]
  */

  const response = []

  for (let faculty of finalArray) {
    let newFaculty = {
      faculty: faculty[0],
      courses: faculty[1][0],
      coursesCount: faculty[2],
    }

    response.push(newFaculty)
  }

  res.send(response)
})

module.exports = router
