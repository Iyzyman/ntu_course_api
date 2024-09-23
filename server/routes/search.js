const express = require('express');
const supabase = require('../supabase');
const router = express.Router();

// Route to search courses based on courseCode or courseTitle
router.get('/', async (req, res) => {
  const { courseCode, courseTitle } = req.query; // Extract query parameters from request

  // Fetch data from 'CourseData' table
  let query = supabase.from('CourseData').select('*');

  if (courseCode) {
    query = query.ilike('course_code', `%${courseCode}%`);
  }

  if (courseTitle) {
    query = query.ilike('course_title', `%${courseTitle}%`);
  }

  const { data: courses, error } = await query;

  if (error) {
    res.status(500).send('Error fetching courses');
  } else {
    res.send(courses);
  }
});

module.exports = router;
