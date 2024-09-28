const express = require('express')
const supabase = require('../supabase')
const router = express.Router()

const schoolMap = {
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
    if (!hashMap[course.school]) {
      hashMap[course.school] = {
        courses: [],
        courseKeys: [],
      }
    
    } 
      // console.log(hashMap[course.courseCode]);
      hashMap[course.school].courseKeys.push(course.code)
      hashMap[course.school].courses.push({
        key: course.code,
        code: course.code,
        title: course.title,
        description: course.description ?? '',
        likes: course.likes,
        watchlists: course.watchlists,
        prerequisites: course.prerequisites ?? [],
        school: course.school,
        slug: course.code,
        image: course.color,
      })
    
  }

  // let tempArray = Object.entries(hashMap)
  // let finalArray = tempArray

  // for (let school of finalArray) {
  //   school.push(school[1][0].length)
  // }

  /* 
  response should look like this:
  [{
    'school': '',
    'courses': [],
    'courseCount': '', 
  },
  {    
    'school': '',
    'courses': [],
    'courseCount': '', 
  }]

  finalArray looks like:
  [ [ schoolName, [ array of courses ], coursesCount] ,  [ schoolName, [ array of courses ], coursesCount] ]
  */

  const response = []

  for (let school in hashMap) {
    const schoolDetails = schoolMap[school] || {
      description: 'No description available.',
    }

    let newschool = {
      key: school, //school name
      slug: school,
      name: school,
      courseKeys: hashMap[school].courseKeys, // array of all courseKeys
      courses: hashMap[school].courses, //might not be neccessary
      description: schoolDetails.description,
      coursesCount: hashMap[school].courses.length,
      creator: {key: 'dummy'},
    }

    response.push(newschool)
  }

  res.json(response)
})

module.exports = router
