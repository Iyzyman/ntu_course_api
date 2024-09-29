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
      displayName: req.body['displayName'],
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
    .eq('code', req.params.id)

  let {data: CourseCode, error: CourseCodeError} = await supabase
    .from('courses')
    .select('ID')
    .eq('courseCode', req.params.id)

  // for calculating aggregate ratings
  let contentUsefulness = 0
  let lectureClarity = 0
  let assignmentDifficulty = 0
  let teamDep = 0
  let overallWorkload = 0

  for (let review of Reviews) {
    contentUsefulness += parseInt(review['ratingNew']['Content Usefulness'])
    lectureClarity += parseInt(review['ratingNew']['Lecture Clarity'])
    assignmentDifficulty += parseInt(
      review['ratingNew']['Assignment Difficulty'],
    )
    teamDep += parseInt(review['ratingNew']['Team Dependency'])
    overallWorkload += parseInt(review['ratingNew']['Overall Workload'])
  }

  contentUsefulness = contentUsefulness / Reviews.length
  lectureClarity = lectureClarity / Reviews.length
  assignmentDifficulty = assignmentDifficulty / Reviews.length
  teamDep = teamDep / Reviews.length
  overallWorkload = overallWorkload / Reviews.length

  const response = {
    course_id: CourseCode[0]['ID'],
    rating: {
      'Content Usefulness': contentUsefulness,
      'Lecture Clarity': lectureClarity,
      'Assignment Difficulty': assignmentDifficulty,
      'Team Dependency': teamDep,
      'Overall Workload': overallWorkload,
    },
    reviews: Reviews,
  }

  res.send(response)
})

module.exports = router
