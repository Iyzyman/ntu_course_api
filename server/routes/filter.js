const express = require('express');
const supabase = require('../supabase');
const router = express.Router();

// Route to get course details
router.get('/', async (req, res) => {
  const { tags } = req.query; // Extract course_code from query parameters

  if (!tags) {
    return res.status(400).send({ error: 'Tags is required' });
  }

  try {
    let {data: coursesByTags, error} = await supabase
      .from('CourseData')
      .select('code, title, description, aus, school, likes, watchlists, color, prerequisites, tags');

    if (error) {
      console.error('Error fetching courses:', error);
      return res.status(500).send({ error: 'Error fetching courses' });
    }

          // If no courses are found, return a 404 message
    if (!coursesByTags || coursesByTags.length === 0) {
      return res.status(404).send({ message: `No courses found for tags: ${tags}` });
    }

    // Return all courses directly, since prerequisites and tags are included
    res.status(200).send(coursesByTags);

  } catch (err) {
    console.error('Internal server error:', err);
    res.status(500).send({ error: 'Internal server error' });
  }
});

module.exports = router;
