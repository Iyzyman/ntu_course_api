const express = require('express');
const supabase = require('../supabase');
const router = express.Router();

// Helper function to map time period in months to SQL interval format
function getTimePeriodInterval(months) {
  const periodMapping = {
    3: 'threeMonths',
    6: 'sixMonths',
    12: 'year',
  };
  return periodMapping[months] || null;
}

// Function to fetch trending courses for a specific period
async function fetchTrendingCoursesForPeriod(months, faculty) {
  const timePeriodInterval = `${months} months`;

  let { data: trendingCourses, error } = await supabase
    .rpc('get_trending_courses', { time_period: timePeriodInterval });

  if (error) {
    console.error(`Error fetching trending courses for ${months} months:`, error);
    return { error: 'Error fetching trending courses' };
  }

  if (!trendingCourses || trendingCourses.length === 0) {
    return []; // Return empty array if no trending courses are found
  }

  const courseCodes = trendingCourses.map(course => course.course_code); // Use 'course_code' instead of 'code'
  let courseQuery = supabase.from('CourseData').select('*').in('code', courseCodes);

  if (faculty) {
    courseQuery = courseQuery.eq('faculty', faculty); // Apply faculty filter if provided
  }

  let { data: courseDetails, error: courseError } = await courseQuery;

  if (courseError) {
    console.error(`Error fetching course details for ${months} months:`, courseError);
    return { error: 'Error fetching course details.' };
  }

  // Combine course details with like counts
  const result = courseDetails.map(course => ({
    ...course,
    likes: trendingCourses.find(tc => tc.course_code === course.code).likes
  }));

  return result;
}

// Route to get trending courses categorized by time period
router.get('/', async (req, res) => {
  const faculty = req.query.faculty; // Extract faculty from query parameters

  try {
    // Fetch trending courses for 3, 6, and 12 months
    const [threeMonths, sixMonths, year] = await Promise.all([
      fetchTrendingCoursesForPeriod(3, faculty),
      fetchTrendingCoursesForPeriod(6, faculty),
      fetchTrendingCoursesForPeriod(12, faculty)
    ]);

    // If any error occurs during the course fetching process, return an error response
    if (threeMonths.error || sixMonths.error || year.error) {
      return res.status(500).send({
        error: threeMonths.error || sixMonths.error || year.error
      });
    }

    // Structure the result in the desired format
    const results = {
      threeMonths,
      sixMonths,
      year,
    };

    res.status(200).send({ results });

  } catch (err) {
    console.error('Internal server error:', err);
    res.status(500).send({ error: 'Internal server error.' });
  }
});

module.exports = router;
