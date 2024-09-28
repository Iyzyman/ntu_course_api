const express = require('express')
const supabase = require('../supabase')
const router = express.Router()

const facultyMap = {
  SPMS: {description: 'School of Physical and Mathematical Sciences'},
  CCEB: {
    description: 'School of Chemistry, Chemical Engineering and Biotechnology',
  },
  NBS: {description: 'Nanyang Business School'},
  SSS: {description: 'School of Social Sciences'},
  ASE: {description: 'The Asian School of Environment'},
  CEE: {description: 'School of Civil and Environmental Engineering'},
  SBS: {description: 'School of Biological Sciences'},
  CCDS: {description: 'College of Computing and Data Science'},
  ADM: {description: 'School of Art, Design and Media'},
  MSE: {description: 'School of Materials Science and Engineering'},
  SOH: {description: 'School of Humanities'},
  MAE: {description: 'School of Mechanical and Aerospace Engineering'},
  EEE: {description: 'School of Electrical and Electronic Engineering'},
  WKWSCI: {description: 'Wee Kim Wee School of Communication and Information'},
  ICC: {description: 'Interdisciplinary Collaborative Core'},
  Common: {description: 'Multidisciplinary Common Modules'},
}

router.get('/', async (req, res) => {
  // return an array of schools
  // for each school, an array of courses, course count

  let {data: courses, error} = await supabase.from('CourseData').select('*')
  // .range(0, 10)

  if (error) {
    return res.status(500).json({error: 'Failed to fetch courses.'})
  }
  hashMap = {}

  for (let course of courses) {
    if (!hashMap[course.faculty]) {
      hashMap[course.faculty] = {
        courses: [],
        courseKeys: [],
      }
      hashMap[course.faculty].courses.push({
        key: course.course_code,
        code: course.course_code,
        title: course.course_title,
        description: course.course_description ?? '',
        likes: course.likes,
        watchlists: course.watchlists,
        prerequisites: course.prerequisites ?? [],
        school: course.faculty,
        slug: course.course_code,
        image: course.color,
      })
      hashMap[course.faculty].courseKeys.push(course.course_code)
    } else {
      // console.log(hashMap[course.courseCode]);
      hashMap[course.faculty].courses.push({
        key: course.course_code,
        code: course.course_code,
        title: course.course_title,
        description: course.course_description ?? '',
        likes: course.likes,
        watchlists: course.watchlists,
        prerequisites: course.prerequisites ?? [],
        school: course.faculty,
        slug: course.course_code,
        image: course.color,
      })
    }
  }

  // let tempArray = Object.entries(hashMap)
  // let finalArray = tempArray

  // for (let faculty of finalArray) {
  //   faculty.push(faculty[1][0].length)
  // }

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

  for (let faculty in hashMap) {
    const facultyDetails = facultyMap[faculty] || {
      description: 'No description available.',
    }

    let newfaculty = {
      key: faculty, //faculty name
      slug: faculty,
      name: faculty,
      courseKeys: hashMap[faculty].courseKeys, // array of all courseKeys
      courses: hashMap[faculty].courses, //might not be neccessary
      description: facultyDetails.description,
      coursesCount: hashMap[faculty].courses.length,
      creator: {key: 'dummy'},
    }

    response.push(newfaculty)
  }

  res.json(response)
})

module.exports = router
