/**
 * Vercel Serverless Function Entry Point for CLARITY REST API & AI Assistant
 */
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-Memory Database Store
const db = {
  users: [
    { id: 'student-1', name: 'Alex Student', email: 'student@clarity.com', role: 'STUDENT' },
    { id: 'teacher-1', name: 'Prof. Sarah Jenkins', email: 'teacher@clarity.com', role: 'TEACHER' }
  ],
  courses: [
    {
      id: 'c-1',
      title: 'C Programming',
      slug: 'c-programming',
      shortDescription: 'Master foundational system programming, memory management, pointers, and performance optimization in C.',
      overview: 'C is a powerful general-purpose programming language used in systems development.',
      difficulty: 'Beginner',
      estimatedDuration: '6 Weeks',
      prerequisites: 'Basic Computer Literacy',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      pdfName: 'C Programming Complete Lecture Notes & Syntax Guide.pdf',
      roadmapItems: [
        { id: 'r1', title: 'C Basics & Syntax', description: 'Understanding main(), header files stdio.h', orderIndex: 0 },
        { id: 'r2', title: 'Data Types & Variables', description: 'int, float, char, qualifiers', orderIndex: 1 },
        { id: 'r3', title: 'Pointers & Memory', description: 'Pointer arithmetic, malloc(), free()', orderIndex: 2 }
      ],
      subtopics: [
        { id: 's1', title: 'Pointers and Memory Allocation', description: 'Master raw memory addressing.', content: 'Pointers store memory addresses of variables.', difficulty: 'Intermediate' }
      ],
      videos: [
        { id: 'v1', title: 'C Programming Tutorial for Beginners', youtubeUrl: 'https://www.youtube.com/watch?v=KJgsSFOSQv0', thumbnailUrl: 'https://img.youtube.com/vi/KJgsSFOSQv0/maxresdefault.jpg', channelName: 'freeCodeCamp.org' }
      ],
      websites: [
        { id: 'w1', name: 'GeeksforGeeks C Programming', url: 'https://www.geeksforgeeks.org/c-programming-language/', logoUrl: 'fa-code', description: 'Tutorials and quizzes.' }
      ]
    },
    {
      id: 'py-1',
      title: 'Python Programming',
      slug: 'python-programming',
      shortDescription: 'Learn versatile, readable Python for web development, automation, data science, and AI.',
      overview: 'Python is a high-level interpreted language known for clean syntax.',
      difficulty: 'Beginner',
      estimatedDuration: '5 Weeks',
      prerequisites: 'None',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      pdfName: 'Python Full Course Lecture Notes.pdf',
      roadmapItems: [
        { id: 'py-r1', title: 'Python Basics', description: 'Variables, print statements, dynamic typing', orderIndex: 0 }
      ],
      subtopics: [
        { id: 'py-s1', title: 'Variables and Data Types', description: 'Learn how Python manages dynamic memory.', content: 'Python variables do not require explicit type declaration.', difficulty: 'Beginner' }
      ],
      videos: [
        { id: 'py-v1', title: 'Python for Beginners Full Course', youtubeUrl: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc', thumbnailUrl: 'https://img.youtube.com/vi/_uQrJ0TkZlc/maxresdefault.jpg', channelName: 'Programming with Mosh' }
      ],
      websites: [
        { id: 'py-w1', name: 'Official Python Docs', url: 'https://docs.python.org/3/', logoUrl: 'fa-brands fa-python', description: 'Standard library documentation.' }
      ]
    },
    {
      id: 'ds-1',
      title: 'Data Structures',
      slug: 'data-structures',
      shortDescription: 'Master Arrays, Linked Lists, Stacks, Queues, Trees, Graphs, and Algorithmic Time Complexity.',
      overview: 'Data structures organize and store data to enable efficient computation.',
      difficulty: 'Intermediate',
      estimatedDuration: '8 Weeks',
      prerequisites: 'Basic Logic',
      pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      pdfName: 'Data Structures & Algorithms Handbook.pdf',
      roadmapItems: [
        { id: 'ds-r1', title: 'Big-O Notation', description: 'Time & space complexity analysis', orderIndex: 0 }
      ],
      subtopics: [
        { id: 'ds-s1', title: 'Arrays and Linked Lists', description: 'Compare contiguous memory arrays against dynamic node pointers.', content: 'Arrays provide O(1) random access.', difficulty: 'Beginner' }
      ],
      videos: [
        { id: 'ds-v1', title: 'Data Structures and Algorithms', youtubeUrl: 'https://www.youtube.com/watch?v=8hly31xKLI0', thumbnailUrl: 'https://img.youtube.com/vi/8hly31xKLI0/maxresdefault.jpg', channelName: 'freeCodeCamp.org' }
      ],
      websites: [
        { id: 'ds-w1', name: 'GeeksforGeeks DS', url: 'https://www.geeksforgeeks.org/data-structures/', logoUrl: 'fa-code', description: 'Repository of data structure implementations.' }
      ]
    }
  ]
};

// API Health
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'CLARITY Vercel Serverless API' });
});

// Courses API
app.get('/api/courses', (req, res) => {
  res.status(200).json({ success: true, data: db.courses });
});

app.get('/api/courses/:id', (req, res) => {
  const course = db.courses.find(c => c.id === req.params.id || c.slug === req.params.id);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
  res.status(200).json({ success: true, data: course });
});

app.get('/api/search', (req, res) => {
  const q = (req.query.q || '').toString().toLowerCase().trim();
  if (!q) return res.status(200).json({ success: true, data: db.courses });
  const filtered = db.courses.filter(c => c.title.toLowerCase().includes(q) || c.shortDescription.toLowerCase().includes(q));
  res.status(200).json({ success: true, data: filtered });
});

// Auth API
app.post('/api/auth/login', (req, res) => {
  const { email, name, role } = req.body;
  const user = { id: `user-${Date.now()}`, name: name || 'User', email: email || 'user@clarity.com', role: role || 'STUDENT' };
  res.status(200).json({ success: true, data: { user, token: 'vercel_demo_token_2026' } });
});

app.post('/api/auth/register', (req, res) => {
  const { email, name, role } = req.body;
  const user = { id: `user-${Date.now()}`, name: name || 'User', email: email || 'user@clarity.com', role: role || 'STUDENT' };
  res.status(201).json({ success: true, data: { user, token: 'vercel_demo_token_2026' } });
});

// Chat AI Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { question, message, courseId } = req.body;
    const userQuestion = (question || message || '').trim();

    let courseName = 'General Academic Subjects';
    if (courseId) {
      const course = db.courses.find(c => c.id === courseId);
      if (course) courseName = course.title;
    }

    // Wikipedia OpenSearch API
    let sources = [];
    try {
      const cleanTerm = userQuestion.replace(/what is a?/gi, '').replace(/explain/gi, '').trim();
      const wikiUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(cleanTerm)}&limit=2&format=json`;
      const wikiRes = await fetch(wikiUrl);
      if (wikiRes.ok) {
        const data = await wikiRes.json();
        const titles = data[1] || [];
        const links = data[3] || [];
        for (let i = 0; i < titles.length; i++) {
          if (titles[i] && links[i]) {
            sources.push({ title: `${titles[i]} - Wikipedia`, url: links[i] });
          }
        }
      }
    } catch (e) {}

    if (sources.length === 0) {
      sources.push(
        { title: `${courseName} Documentation`, url: `https://docs.python.org/3/` },
        { title: `GeeksforGeeks ${courseName}`, url: `https://www.geeksforgeeks.org/` }
      );
    }

    let answer = `### Answer: ${userQuestion}\n\nUnderstanding **"${userQuestion}"** in the context of **${courseName}** using live web-search educational sources.\n\n### Sources\n` +
      sources.map((s, i) => `${i + 1}. [${s.title}](${s.url})`).join('\n');

    res.status(200).json({
      success: true,
      data: {
        answer,
        reply: answer,
        sources,
        course: courseName,
        conversationId: `conv-${Date.now()}`
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = app;
