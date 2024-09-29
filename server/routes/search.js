const express = require('express');
const supabase = require('../supabase');
const router = express.Router();

// Route to search courses based on courseCode or courseTitle using a single 'query' parameter
router.get('/', async (req, res) => {
  const { query, page = 1, per_page = 10 } = req.query; // Extract 'query', 'page', and 'per_page' from request query

  // If no query is provided, return an empty result
  if (!query) {
    return res.status(200).send({
      results: [
        {
          found: 0,
          hits: [],
          request_params: {
            per_page: Number(per_page),
            page: Number(page)
          }
        }
      ]
    });
  }

  try {
    // Calculate offset for pagination
    const offset = (page - 1) * per_page;

    // Fetch data from 'CourseData' table, querying by course_code or title with pagination
    let { data: courses, error, count } = await supabase
      .from('CourseData')
      .select('code, title, description, aus, school, likes, watchlists, color, prerequisites, tags', { count: 'exact' })
      .or(`code.ilike.%${query}%,title.ilike.%${query}%`)
      .range(offset, offset + per_page - 1); // Apply pagination using range

    if (error) {
      console.error('Error fetching courses:', error);
      return res.status(500).send({ error: 'Error fetching courses' });
    }

    // If no courses found, return an empty hits array and found = 0
    if (!courses || courses.length === 0) {
      return res.status(200).send({
        results: [
          {
            found: 0,
            hits: [],
            request_params: {
              per_page: Number(per_page),
              page: Number(page)
            }
          }
        ]
      });
    }

    // Map the courses to the desired format
    const hits = courses.map(course => ({
      document: {
        code: course.code,
        title: course.title,
        description: course.description,
        aus: course.aus,
        school: course.school,
        likes: course.likes,
        watchlists: course.watchlists,
        color: course.color,
        prerequisites: course.prerequisites,
        tags: course.tags
      }
    }));

    // Return the result in the required format, including pagination parameters
    res.status(200).send({
      results: [
        {
          found: count,  // Total number of courses found (including all pages)
          hits: hits,     // The array of courses in the hits property
          request_params: {
            per_page: Number(per_page),  // Number of items per page
            page: Number(page)           // Current page
          }
        }
      ]
    });

  } catch (err) {
    console.error('Internal server error:', err);
    res.status(500).send({ error: 'Internal server error' });
  }
});

module.exports = router;
