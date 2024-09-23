const express = require('express');
const supabase = require('../supabase');
const router = express.Router();

// Route to get course details
router.get('/', async (req, res) => {
  const { course_code } = req.query; // Extract course_code from query parameters

  // Validate input
  if (!course_code) {
    return res.status(400).send({ error: 'Course code is required' });
  }

  try {
    // Fetch the course details from the CourseData table based on the course_code
    let { data: course, error } = await supabase
      .from('CourseData')  // CourseData table where course information is stored
      .select('course_code, course_title, course_description, like_count, aus, faculty')  // Specify the columns you want to fetch
      .eq('course_code', course_code)
      .single();  // Fetch a single row

    if (error) {
      return res.status(500).send({ error: 'Error fetching course details' });
    }

    // Check if course exists
    if (!course) {
      return res.status(404).send({ message: 'Course not found' });
    }

    // Fetch the prerequisite course code from the CoursePrerequisites table
    let { data: prerequisite, error: prereqError } = await supabase
      .from('CoursePrerequisites')
      .select('prerequisite_code')
      .eq('course_code', course_code)
      .single();  // Fetch a single row for the prerequisite

    if (prerequisite) {
      course.prerequisite_code = prerequisite.prerequisite_code;
    } else {
      course.prerequisite_code = null;  // If no prerequisite is found, set to null
    }

    // Return the course details including the prerequisite course code
    res.status(200).send(course);

  } catch (err) {
    res.status(500).send({ error: 'Internal server error' });
  }
});

module.exports = router;
