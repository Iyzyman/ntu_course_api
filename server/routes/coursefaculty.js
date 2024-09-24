const express = require('express');
const supabase = require('../supabase');
const router = express.Router();

// Route to get courses by faculty, including tags and prerequisites
router.get('/', async (req, res) => {
  const { faculty } = req.query; // Extract faculty from query parameters

  // Validate input
  if (!faculty) {
    return res.status(400).send({ error: 'Faculty is required' });
  }

  try {
    let { data: coursesByFaculty, error } = await supabase
      .from('CourseData')
      .select('course_code, course_title, course_description, aus, faculty, likes, watchlists, color, prerequisites, tags')
      .eq('faculty', faculty);  // Filter by faculty

    if (error) {
      return res.status(500).send({ error: error.message });
    }

    // If no courses are found, return a 404 message
    if (!coursesByFaculty || coursesByFaculty.length === 0) {
      return res.status(404).send({ message: `No courses found for faculty: ${faculty}` });
    }

    // Return the courses, prerequisites, and tags directly from CourseData
    res.status(200).send(coursesByFaculty);

  } catch (err) {
    console.error('Internal server error:', err);
    res.status(500).send({ error: 'Internal server error' });
  }
});

module.exports = router;
