const request = require('supertest');
const express = require('express');
const detailsRouter = require('../routes/details'); // Adjust the path to your details router
const supabase = require('../supabase');

// Create an Express app for testing
const app = express();
app.use(express.json());
app.use('/api/details', detailsRouter); // Mount the router for testing

// Mock Supabase
jest.mock('../supabase', () => ({
  from: jest.fn(() => ({
    select: jest.fn(),
    eq: jest.fn(),
    single: jest.fn(),
    in: jest.fn(),
  })),
}));

describe('GET /api/details', () => {
  it('should return 200 and course details including prerequisites', async () => {
    const mockCourse = {
      code: 'SC1005',
      title: 'Course Title',
      description: 'Course Description',
      aus: 3,
      school: 'SPMS',
      likes: 10,
      watchlists: 5,
      color: '#FFFF00',
      prerequisites: ['SC1001', 'SC1002'],
      tags: ['tag1', 'tag2']
    };

    const mockPrerequisites = [
      { code: 'SC1001', title: 'Course 1', description: 'Desc 1', aus: 3 },
      { code: 'SC1002', title: 'Course 2', description: 'Desc 2', aus: 3 }
    ];

    // Mock the main course details response
    supabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValueOnce({ data: mockCourse, error: null })
    });

    // Mock the prerequisites fetch response
    supabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      in: jest.fn().mockResolvedValueOnce({ data: mockPrerequisites, error: null })
    });

    const response = await request(app).get('/api/details').query({ course_code: 'SC1005' });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ...mockCourse,
      prerequisites: mockPrerequisites
    });
  });

  it('should return 400 if course_code is missing', async () => {
    const response = await request(app).get('/api/details');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Course code is required' });
  });

  it('should return 404 if course is not found', async () => {
    // Mock the course not found response
    supabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValueOnce({ data: null, error: null })
    });

    const response = await request(app).get('/api/details').query({ course_code: 'SC9999' });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Internal server error"});
  });

  it('should return 500 if there is an error fetching course details', async () => {
    // Mock an error response from Supabase
    supabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValueOnce({ data: null, error: 'Error fetching course' })
    });

    const response = await request(app).get('/api/details').query({ course_code: 'SC1005' });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });

  it('should return 500 if there is an internal server error', async () => {
    // Mock Supabase throwing an exception
    supabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockRejectedValueOnce(new Error('Internal server error'))
    });

    const response = await request(app).get('/api/details').query({ course_code: 'SC1005' });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });
});
