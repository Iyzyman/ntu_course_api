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
    // Fetch the course details directly from the CourseData table including prerequisites and tags
    let { data: course, error } = await supabase
      .from('CourseData')
      .select('course_code, course_title, course_description, aus, faculty, likes, watchlists, color, prerequisites, tags')
      .eq('course_code', course_code)
      .single();

    if (error) {
      console.error('Error fetching course details:', error);
      return res.status(500).send({ error: 'Error fetching course details' });
    }

    if (!course) {
      return res.status(404).send({ message: 'Course not found' });
    }

    // Return the course details directly
    res.status(200).send(course);

  } catch (err) {
    console.error('Internal server error:', err);
    res.status(500).send({ error: 'Internal server error' });
  }
});

module.exports = router;
