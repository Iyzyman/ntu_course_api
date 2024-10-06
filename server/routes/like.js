const express = require('express');
const supabase = require('../supabase');
const router = express.Router();

// Route to like a course
router.post('/', async (req, res) => {
  const { user_id, course_code } = req.body;
  if (!user_id || !course_code) {
    return res.status(400).send({ error: 'User ID and Course Code are required' });
  }

  try {
    let { data: existingLike } = await supabase
      .from('CourseLikes')
      .select('*')
      .eq('user_id', user_id)
      .eq('code', course_code)
      .single();



    if (existingLike) {
      return res.status(400).send({ error: 'Course is already liked by the user' });
    }

    await supabase.from('CourseLikes').insert([{ user_id, code: course_code }])


    await supabase.rpc('increment_likes', { x: 1, course_code: course_code })

    res.status(201).send({ message: 'Course liked successfully' });
  } catch (err) {
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

// Route to unlike a course
router.delete('/', async (req, res) => {
  const { user_id, course_code } = req.body;

  if (!user_id || !course_code) {
    return res.status(400).send({ error: 'User ID and Course Code are required' });
  }

  try {
    let { data: existingLike } = await supabase
      .from('CourseLikes')
      .select('*')
      .eq('user_id', user_id)
      .eq('code', course_code)
      .single();

    if (!existingLike) {
      return res.status(400).send({ error: 'Course is not liked by the user' });
    }

    await supabase
      .from('CourseLikes')
      .delete()
      .eq('user_id', user_id)
      .eq('code', course_code);

    await supabase.rpc('increment_likes', { x: -1, course_code: course_code })

    res.status(200).send({ message: 'Course unliked successfully' });
  } catch (err) {
    res.status(500).send({ error: 'Internal server error' });
  }
});

// Route to check if a course is liked by the user
router.get('/', async (req, res) => {
  const { user_id, course_code } = req.query;
  // Validate input
  if (!user_id || !course_code) {
    return res.status(400).send({ error: 'User ID and Course Code are required' });
  }

  try {
    // Check if the course is already liked by the user
    let { data: existingLike } = await supabase
      .from('CourseLikes')
      .select('*')
      .eq('user_id', user_id)
      .eq('code', course_code)
      .single();


    // If row exists, return true; else, return false
    if (existingLike) {
      return res.status(200).send({ liked: true });
    } else {
      return res.status(200).send({ liked: false });
    }
  } catch (err) {

    res.status(500).send({ error: 'Internal server error' });
  }
});

// Route to get all courses liked by a user
router.get('/userLikes', async (req, res) => {
  const { user_id } = req.query;

  // Validate input
  if (!user_id) {
    return res.status(400).send({ error: 'User ID is required' });
  }

  try {
    // Query CourseLikes table to get all liked course codes for the user
    let { data: likedCourses, error } = await supabase
      .from('CourseLikes')
      .select('code')
      .eq('user_id', user_id);

    if (error) {
      return res.status(500).send({ error: error.message });
    }

    if (likedCourses.length === 0) {
      return res.status(404).send({ message: 'No liked courses found' });
    }

    // Fetch course details for each course_code in the likedCourses
    const courseCodes = likedCourses.map(item => item.code);
    let { data: courses, error: courseError } = await supabase
      .from('CourseData')
      .select('*')
      .in('code', courseCodes);

    if (courseError) {
      return res.status(500).send({ error: courseError.message });
    }

    res.status(200).send(courses);

  } catch (err) {
    res.status(500).send({ error: 'Internal server error' });
  }
});

module.exports = router;
