const express = require('express');
const supabase = require('../supabase');
const router = express.Router();

// Route to get the top 10 trending courses
router.get('/', async (req, res) => {
  try {
    // Query for top 10 courses sorted by like_count
    let { data: trendingCourses, error } = await supabase
      .from('CourseData')
      .select('*')
      .order('like_count', { ascending: false })
      .limit(10);

    if (error) {
      return res.status(500).send({ error: error.message });
    }

    // Return the trending courses
    res.status(200).send(trendingCourses);

  } catch (err) {
    res.status(500).send({ error: 'Internal server error' });
  }
});

// Route to get trending courses by faculty
router.get('/faculty', async (req, res) => {
  const { faculty } = req.query; // Extract faculty from query parameters

  if (!faculty) {
    return res.status(400).send({ error: 'Faculty is required' });
  }

  try {
    // Query for trending courses by faculty sorted by like_count
    let { data: trendingCoursesByFaculty, error } = await supabase
      .from('CourseData')
      .select('*')
      .eq('faculty', faculty)  // Filter by faculty
      .order('like_count', { ascending: false })
      .limit(10);

    if (error) {
      return res.status(500).send({ error: error.message });
    }

    // Return the trending courses by faculty
    res.status(200).send(trendingCoursesByFaculty);

  } catch (err) {
    res.status(500).send({ error: 'Internal server error' });
  }
});

module.exports = router;

