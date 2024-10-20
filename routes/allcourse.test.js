const request = require('supertest');
const express = require('express');
const allcoursesRouter = require('../routes/allcourse'); // Path to your router
const supabase = require('../supabase');

// Create an Express app with the router for testing
const app = express();
app.use(express.json());
app.use('/api/course', allcoursesRouter); // Mount the router

// Mock Supabase
jest.mock('../supabase', () => ({
  from: jest.fn(() => ({
    select: jest.fn(),
  })),
}));

describe('GET /api/course/all', () => {
  
  it('should return 200 and the list of courses', async () => {
    // Mock Supabase response with sample courses
    const mockCourses = [
      {
        code: "MH1811",
        title: "MATHEMATICS 2",
        description: "Partial differentiation. Multiple integrals.",
        aus: 3,
        school: "SPMS",
        likes: 10,
        watchlists: 5,
        color: "#FFFF00",
        prerequisites: [],
        tags: ["partial differentiation", "multiple integrals"]
      }
    ];

    // Mocking the supabase.from().select() response
    supabase.from.mockReturnValueOnce({
      select: jest.fn().mockResolvedValueOnce({ data: mockCourses, error: null })
    });

    // Make the request using supertest
    const response = await request(app).get('/api/course/all');

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockCourses);
  });

  it('should return 404 when no courses are found', async () => {
    // Mock Supabase returning no courses
    supabase.from.mockReturnValueOnce({
      select: jest.fn().mockResolvedValueOnce({ data: [], error: null })
    });

    const response = await request(app).get('/api/course/all');

    // Assertions
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'No courses found' });
  });

  it('should return 500 if there is an error fetching courses', async () => {
    // Mock Supabase with an error
    supabase.from.mockReturnValueOnce({
      select: jest.fn().mockResolvedValueOnce({ data: null, error: 'Supabase error' })
    });

    const response = await request(app).get('/api/course/all');

    // Assertions
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Error fetching courses' });
  });

  it('should return 500 if there is an internal server error', async () => {
    // Mock Supabase throwing an exception
    supabase.from.mockReturnValueOnce({
      select: jest.fn().mockRejectedValueOnce(new Error('Internal server error'))
    });

    const response = await request(app).get('/api/course/all');

    // Assertions
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });
});
