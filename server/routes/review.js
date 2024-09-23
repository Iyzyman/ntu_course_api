const express = require('express')
const supabase = require('../supabase')
const router = express.Router()

router.post('/putReview', (req, res) => {})

router.get('/:id', async (req, res) => {
  let {data: Reviews, error: ReviewsError} = await supabase
    .from('Reviews')
    .select('*')
    .eq('course_code', req.params.id)

  let {data: CourseCode, error: CourseCodeError} = await supabase
    .from('courses')
    .select('ID')
    .eq('courseCode', req.params.id)

  const response = {
    course_id: CourseCode[0]['ID'],
    rating: {
      'Content Usefulness': null,
      'Lecture Clarity': null,
      'Assignment Difficulty': null,
      'Team Dependency': null,
      'Overall Workload': null,
    },
    reviews: Reviews,
  }
  res.send(response)
})

module.exports = router
