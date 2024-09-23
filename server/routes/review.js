const express = require('express')
const supabase = require('../supabase')
const router = express.Router()

router.post('/putReview', async (req, res) => {
  const {data, error} = await supabase
    .from('Reviews')
    .upsert({
      course_id: req.body['course_id'],
      rating: {
        // review score
        'Content Usefulness': req.body['rating']['Content Usefulness'],
        'Lecture Clarity': req.body['rating']['Lecture Clarity'],
        'Assignment Difficulty': req.body['rating']['Assignment Difficulty'],
        'Team Dependency': req.body['rating']['Team Dependency'],
        'Overall Workload': req.body['rating']['Overall Workload'],
      },
      user_id: req.body['user_id'],
      review_text: req.body['review_text'],
      course_date: req.body['course_date'], // in the form of '2023 Semester 1', describes when course was taken
      recommended: req.body['recommended'],
    })
    .select()

  if (error) {
    res.send(error)
  } else {
    res.send(data)
  }
})

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
