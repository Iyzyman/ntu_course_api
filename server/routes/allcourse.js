const express = require('express');
const supabase = require('../supabase');
const router = express.Router();

// Route to get all courses
router.get('/all', async (req, res) => {
  try {
    let { data: courses, error } = await supabase
      .from('CourseData')
      .select('course_code, course_title, course_description, aus, faculty, likes, watchlists, color, prerequisites, tags'); 

    if (error) {
      console.error('Error fetching courses:', error);
      return res.status(500).send({ error: 'Error fetching courses' });
    }

    // If no courses are found, return a 404 message
    if (!courses || courses.length === 0) {
      return res.status(404).send({ message: 'No courses found' });
    }

    // Return all courses directly, since prerequisites and tags are included
    res.status(200).send(courses);

  } catch (err) {
    console.error('Internal server error:', err);
    res.status(500).send({ error: 'Internal server error' });
  }
});

module.exports = router;
