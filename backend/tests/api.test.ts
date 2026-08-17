import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/database/db';

describe('EduLearn Backend API Tests', () => {
  let studentToken: string;
  let teacherToken: string;
  let createdCourseId: string;

  beforeAll(async () => {
    // Setup clean environment or ensure db connection
    await prisma.$connect();
  });

  afterAll(async () => {
    // Cleanup created test records
    if (createdCourseId) {
      await prisma.course.deleteMany({ where: { id: createdCourseId } });
    }
    await prisma.$disconnect();
  });

  describe('Authentication Endpoints', () => {
    it('should register a new student user', async () => {
      const email = `teststudent_${Date.now()}@edulearn.com`;
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Student',
          email,
          password: 'password123',
          role: 'STUDENT',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(email);
      expect(res.body.data.user.role).toBe('STUDENT');
      expect(res.body.data.token).toBeDefined();

      studentToken = res.body.data.token;
    });

    it('should register a new teacher user', async () => {
      const email = `testteacher_${Date.now()}@edulearn.com`;
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Teacher',
          email,
          password: 'password123',
          role: 'TEACHER',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('TEACHER');
      expect(res.body.data.token).toBeDefined();

      teacherToken = res.body.data.token;
    });

    it('should fail login with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@edulearn.com',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Course & Search Endpoints', () => {
    it('should retrieve list of courses', async () => {
      const res = await request(app).get('/api/courses');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should search courses by query', async () => {
      const res = await request(app).get('/api/search?q=Python');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('Role-Based Authorization & Teacher Operations', () => {
    it('should prevent student from creating a course (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Unauthorized Course',
          shortDescription: 'Student should not create this',
          overview: 'Overview',
        });

      expect(res.status).toBe(403);
    });

    it('should allow teacher to create a full course transaction', async () => {
      const res = await request(app)
        .post('/api/teacher/courses')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Quantum Computing Intro',
          shortDescription: 'Introduction to qubits, quantum logic gates, and algorithms.',
          overview: 'Learn basic quantum mechanics and Qiskit programming.',
          difficulty: 'Advanced',
          estimatedDuration: '4 Weeks',
          prerequisites: 'Linear Algebra & Python',
          roadmap: [
            { title: 'Classical vs Quantum', description: 'Bit vs Qubit' },
            { title: 'Quantum Gates', description: 'Hadamard, CNOT, Pauli-X' }
          ],
          subtopics: [
            { title: 'Qubits & Superposition', description: 'Bloch sphere representation', content: 'Detailed qubit physics.' }
          ],
          videos: [
            { title: 'Quantum Computing Explained', youtubeUrl: 'https://youtube.com/watch?v=g_IaVepNDT4', channelName: 'Kurzgesagt' }
          ],
          websites: [
            { name: 'IBM Quantum Experience', url: 'https://quantum.ibm.com' }
          ]
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.roadmapItems.length).toBe(2);
      expect(res.body.data.subtopics.length).toBe(1);

      createdCourseId = res.body.data.id;
    });

    it('should allow teacher to update their course', async () => {
      const res = await request(app)
        .put(`/api/courses/${createdCourseId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          shortDescription: 'Updated quantum computing short description',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.shortDescription).toBe('Updated quantum computing short description');
    });
  });

  describe('AI Chatbot Endpoint', () => {
    it('should generate subject-aware answer from AI chatbot', async () => {
      const res = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          message: 'What is a qubit in quantum computing?',
          courseId: createdCourseId,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reply).toBeDefined();
      expect(res.body.data.conversationId).toBeDefined();
    });
  });
});
