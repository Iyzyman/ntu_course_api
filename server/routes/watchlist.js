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
      .select('code')
      .eq('user_id', user_id);

    if (watchlist.length === 0) {
      return res.status(404).send({ message: 'No courses found in the watchlist' });
    }

    const courseCodes = watchlist.map(item => item.code);
    let { data: courses } = await supabase
      .from('CourseData')
      .select('*')
      .in('code', courseCodes);

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
    // Check if the course is already in the user's watchlist
    let { data: existingEntry } = await supabase
      .from('WatchList')
      .select('*')
      .eq('user_id', user_id)
      .eq('code', course_code)
      .single();

    if (existingEntry) {
      return res.status(400).send({ error: 'Course is already in the watchlist' });
    }

    // Add the course to the watchlist
    await supabase.from('WatchList').insert([{ user_id, course_code }]);

    // Increment the watchlists count in CourseData
    await supabase
      .from('CourseData')
      .update({ watchlists: supabase.raw('watchlists + 1') })  // Increment watchlists
      .eq('code', course_code);

    res.status(200).send({ message: 'Course added to watchlist successfully' });
  } catch (err) {
    console.error('Error adding course to watchlist:', err);
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
    // Remove the course from the watchlist
    await supabase
      .from('WatchList')
      .delete()
      .eq('user_id', user_id)
      .eq('code', course_code);

    // Decrement the watchlists count in CourseData
    await supabase
      .from('CourseData')
      .update({ watchlists: supabase.raw('watchlists - 1') })  // Decrement watchlists
      .eq('code', course_code);

    res.status(200).send({ message: 'Course removed from watchlist successfully' });
  } catch (err) {
    console.error('Error removing course from watchlist:', err);
    res.status(500).send({ error: 'Internal server error' });
  }
});

module.exports = router;