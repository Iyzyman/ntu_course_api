const express = require('express');
const supabase = require('../supabase');
const router = express.Router();

// Helper function to map time period in months to SQL interval format
function getTimePeriodInterval(months) {
  if ([3, 6, 12].includes(months)) {
    return `${months} months`;
  }
  return null;
}

// Route to get the top 10 trending courses based on time period, with an optional faculty filter
router.get('/', async (req, res) => {
  const time_period = parseInt(req.query.time_period); // Extract time period from query parameters and convert to integer
  const faculty = req.query.faculty; // Extract faculty from query parameters

  // Validate input
  if (!time_period || ![3, 6, 12].includes(time_period)) {
    return res.status(400).send({ error: 'Invalid or missing time period. Choose 3, 6, or 12.' });
  }

  // Map time period to SQL-compatible interval
  const timePeriodInterval = getTimePeriodInterval(time_period);
  if (!timePeriodInterval) {
    return res.status(400).send({ error: 'Invalid time period provided.' });
  }

  try {
    // Call the Supabase RPC (Remote Procedure Call) to get the trending courses
    let { data: trendingCourses, error } = await supabase
      .rpc('get_trending_courses', { time_period: timePeriodInterval });

    if (error) {
      console.error('Error fetching trending courses:', error);
      return res.status(500).send({ error: 'Error fetching trending courses' });
    }

    if (!trendingCourses || trendingCourses.length === 0) {
      return res.status(404).send({ message: 'No trending courses found for the given time period.' });
    }

    // Fetch detailed information about the courses
    const courseCodes = trendingCourses.map(course => course.course_code);

    // Modify the query to include the faculty filter if provided
    let courseQuery = supabase.from('CourseData').select('*').in('course_code', courseCodes);
    
    if (faculty) {
      courseQuery = courseQuery.eq('faculty', faculty); // Apply faculty filter if provided
    }

    let { data: courseDetails, error: courseError } = await courseQuery;

    if (courseError) {
      console.error('Error fetching course details:', courseError);
      return res.status(500).send({ error: 'Error fetching course details.' });
    }

    // Combine course details with like counts
    const result = courseDetails.map(course => ({
      ...course,
      like_count: trendingCourses.find(tc => tc.course_code === course.course_code).like_count
    }));

    res.status(200).send(result);

  } catch (err) {
    console.error('Internal server error:', err);
    res.status(500).send({ error: 'Internal server error.' });
  }
});

module.exports = router;
