const express = require('express')
const supabase = require('../supabase')
const router = express.Router()

router.post('/putReview', async (req, res) => {
  const { data, error } = await supabase
    .from('Reviews')
    .upsert({
      code: req.body['course_id'],
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
    console.error(error)
    res.status(400).send(error)
  } else {
    res.status(200).send(data)
  }
})

router.get('/:id', async (req, res) => {
  try {
    let { data: Reviews } = await supabase
      .from('Reviews')
      .select('*')
      .eq('code', req.params.id)

    let { data: CourseCode } = await supabase
      .from('courses')
      .select('ID')
      .eq('courseCode', req.params.id)

    if (Reviews === null || Reviews.length === 0) {
      return res.status(404).send({ message: 'No reviews found' })
    }

    // for calculating aggregate ratings
    let contentUsefulness = 0
    let lectureClarity = 0
    let assignmentDifficulty = 0
    let teamDep = 0
    let overallWorkload = 0

    for (let review of Reviews) {
      contentUsefulness += parseInt(review['rating']['Content Usefulness'])
      lectureClarity += parseInt(review['rating']['Lecture Clarity'])
      assignmentDifficulty += parseInt(
        review['rating']['Assignment Difficulty'],
      )
      teamDep += parseInt(review['rating']['Team Dependency'])
      overallWorkload += parseInt(review['rating']['Overall Workload'])
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

    res.status(200).send(response)
  } catch (error) {
    console.error(error)
    res.status(400).send(error)
  }
})

module.exports = router
