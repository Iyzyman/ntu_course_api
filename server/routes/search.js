const express = require('express');
const supabase = require('../supabase');
const router = express.Router();

// Route to search courses based on courseCode or courseTitle using a single 'search' parameter
router.get('/', async (req, res) => {
  const { search } = req.query; // Extract 'search' parameter from request

  // If no search query is provided, return an error
  if (!search) {
    return res.status(400).send({ error: 'Search query is required' });
  }

  try {
    // Fetch data from 'CourseData' table, searching by course_code or course_title
    let { data: courses, error } = await supabase
      .from('CourseData')
      .select('course_code, course_title, course_description, aus, faculty, likes, watchlists, color, prerequisites, tags')
      .or(`course_code.ilike.%${search}%,course_title.ilike.%${search}%`);

    if (error) {
      console.error('Error fetching courses:', error);
      return res.status(500).send('Error fetching courses');
    }

    // If no courses found, return a 404 response
    if (!courses || courses.length === 0) {
      return res.status(404).send({ message: 'No courses found' });
    }

    // Return the final courses array with all details, including prerequisites and tags
    res.status(200).send(courses);

  } catch (err) {
    console.error('Internal server error:', err);
    res.status(500).send({ error: 'Internal server error' });
  }
});

module.exports = router;
