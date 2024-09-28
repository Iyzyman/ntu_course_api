const express = require('express');
const supabase = require('../supabase');
const router = express.Router();

// Route to get course details
router.get('/', async (req, res) => {
  const { course_code } = req.query; // Extract course_code from query parameters

  // Validate input
  if (!course_code) {
    return res.status(400).send({ error: 'Course code is required' });
  }

  try {
    let { data: course, error } = await supabase
      .from('CourseData')
      .select('code, title, description, aus, school, likes, watchlists, color, prerequisites, tags')
      .eq('code', course_code)
      .single();

    const courseDetails = {
      code: course.code,
      title: course.title,
      description: course.description,
      aus: course.aus,
      school: course.school,
      likes: course.likes,
      watchlists: course.watchlists,
      color: course.color,
      prerequisites: course.prerequisites ?? [],
      tags: course.tags,
      key: course.code,
      slug: course.code,
    };

    if (courseDetails.prerequisites.length > 0) {
      const prerequisiteCodes = courseDetails.prerequisites;
    
      // Fetch details for each prerequisite
      const { data: prerequisiteCourses, error: prerequisiteError } = await supabase
        .from('CourseData')
        .select('code, title, likes, watchlists, color')
        .in('code', prerequisiteCodes); // Using the `in` clause to get all at once
    
      if (prerequisiteError) {
        console.error("Error fetching prerequisites:", prerequisiteError);
      } else {
        const mappedPrerequisites = prerequisiteCourses.map(prerequisite => ({
          code: prerequisite.code,
          title: prerequisite.title,
          likes: prerequisite.likes,
          watchlists: prerequisite.watchlists,
          color: prerequisite.color,
          key: prerequisite.code,
          slug: prerequisite.code,
        }));
    
        courseDetails.prerequisites = mappedPrerequisites;
      }
    }

    if (error) {
      console.error('Error fetching course details:', error);
      return res.status(500).send({ error: 'Error fetching course details' });
    }

    if (!course) {
      return res.status(404).send({ message: 'Course not found' });
    }

    // Return the course details directly
    res.status(200).send(courseDetails);

  } catch (err) {
    console.error('Internal server error:', err);
    res.status(500).send({ error: 'Internal server error' });
  }
});

module.exports = router;
