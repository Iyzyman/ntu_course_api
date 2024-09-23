const express = require('express');
const supabase = require('../supabase');
const router = express.Router();

// Get all courses a user has watchlisted
router.get('/', async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).send({ error: 'User ID is required' });
  }

  try {
    let { data: watchlist } = await supabase
      .from('WatchList')
      .select('course_code')
      .eq('user_id', user_id);

    if (watchlist.length === 0) {
      return res.status(404).send({ message: 'No courses found in the watchlist' });
    }

    const courseCodes = watchlist.map(item => item.course_code);
    let { data: courses } = await supabase
      .from('CourseData')
      .select('*')
      .in('course_code', courseCodes);

    res.status(200).send(courses);
  } catch (err) {
    res.status(500).send({ error: 'Internal server error' });
  }
});

// Add a course to the watchlist
router.post('/', async (req, res) => {
  const { user_id, course_code } = req.body;

  if (!user_id || !course_code) {
    return res.status(400).send({ error: 'User ID and Course Code are required' });
  }

  try {
    let { data: existingEntry } = await supabase
      .from('WatchList')
      .select('*')
      .eq('user_id', user_id)
      .eq('course_code', course_code)
      .single();

    if (existingEntry) {
      return res.status(400).send({ error: 'Course is already in the watchlist' });
    }

    await supabase.from('WatchList').insert([{ user_id, course_code }]);

    res.status(200).send({ message: 'Course added to watchlist successfully' });
  } catch (err) {
    res.status(500).send({ error: 'Internal server error' });
  }
});

// Remove a course from the watchlist
router.delete('/', async (req, res) => {
  const { user_id, course_code } = req.body;

  if (!user_id || !course_code) {
    return res.status(400).send({ error: 'User ID and Course Code are required' });
  }

  try {
    await supabase
      .from('WatchList')
      .delete()
      .eq('user_id', user_id)
      .eq('course_code', course_code);

    res.status(200).send({ message: 'Course removed from watchlist successfully' });
  } catch (err) {
    res.status(500).send({ error: 'Internal server error' });
  }
});

module.exports = router;
