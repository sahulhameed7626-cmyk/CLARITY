/* ==========================================================================
   CLARITY Frontend Application Engine
   Single-Page Application Router, API Integration & UI Components
   ========================================================================== */

const API_BASE_URL = window.location.origin.includes('localhost')
  ? 'http://localhost:5000/api'
  : '/api';

// Initial Application State
const state = {
  currentUser: JSON.parse(localStorage.getItem('clarity_user')) || null,
  token: localStorage.getItem('clarity_token') || null,
  role: localStorage.getItem('clarity_role') || 'GUEST', // 'GUEST' | 'STUDENT' | 'TEACHER'
  currentView: 'LANDING', // 'LANDING' | 'LOGIN' | 'STUDENT_DASHBOARD' | 'TEACHER_DASHBOARD' | 'SUBJECT_DETAIL'
  courses: [],
  filteredCourses: [],
  selectedCourse: null,
  activeRoadmapIndex: 0,
  searchQuery: '',
  isChatOpen: false,
  chatMessages: [],
  chatLoadingState: '', // '' | 'Understanding question...' | 'Searching the web...' | 'Analyzing sources...' | 'Preparing answer...'
  activeVideoUrl: null,
  isAddSubjectModalOpen: false,
  editingCourseId: null,
  mobileNavOpen: false,
};

// Seed Fallback Data
const FALLBACK_COURSES = [
  {
    id: 'c-1',
    title: 'C Programming',
    slug: 'c-programming',
    shortDescription: 'Master foundational system programming, memory management, pointers, and performance optimization in C.',
    overview: 'C is a powerful general-purpose programming language. It can be used to develop software like operating systems, databases, compilers, and more. Excellent for building low-level memory awareness.',
    difficulty: 'Beginner',
    estimatedDuration: '6 Weeks',
    prerequisites: 'Basic Computer Literacy',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pdfName: 'C Programming Complete Lecture Notes & Syntax Guide.pdf',
    roadmapItems: [
      { id: 'r1', title: 'C Basics & Syntax', description: 'Understanding main(), compilation, header files stdio.h', orderIndex: 0 },
      { id: 'r2', title: 'Data Types & Variables', description: 'int, float, char, qualifiers, format specifiers', orderIndex: 1 },
      { id: 'r3', title: 'Operators & Control Flow', description: 'if-else statements, switch case, while & for loops', orderIndex: 2 },
      { id: 'r4', title: 'Functions & Scope', description: 'Function prototypes, return types, pass-by-value vs pass-by-reference', orderIndex: 3 },
      { id: 'r5', title: 'Arrays & Strings', description: '1D/2D arrays, null-terminated char arrays, string.h', orderIndex: 4 },
      { id: 'r6', title: 'Pointers & Memory', description: 'Pointer arithmetic, & and * operators, malloc(), free()', orderIndex: 5 },
      { id: 'r7', title: 'Structures & Unions', description: 'struct keywords, typedef, memory alignment, union types', orderIndex: 6 }
    ],
    subtopics: [
      { id: 's1', title: 'Pointers and Memory Allocation', description: 'Master raw memory addressing and dynamic memory management.', content: 'Pointers store memory addresses of variables. Dynamic memory allocation using malloc(), calloc(), realloc(), and free() allows allocating memory at runtime on the heap.', difficulty: 'Intermediate' },
      { id: 's2', title: 'Structures & Data Representation', description: 'Group composite variables into unified custom types.', content: 'A struct in C allows grouping variables of different data types under a single name. Used extensively in data structure implementations like linked lists and trees.', difficulty: 'Beginner' },
      { id: 's3', title: 'File Handling & Streams', description: 'Read and write binary and text files directly to disk.', content: 'FILE pointers in C allow creating, reading, writing, and appending to files on the file system using standard stream operations.', difficulty: 'Advanced' }
    ],
    videos: [
      { id: 'v1', title: 'C Programming Tutorial for Beginners', youtubeUrl: 'https://www.youtube.com/watch?v=KJgsSFOSQv0', thumbnailUrl: 'https://img.youtube.com/vi/KJgsSFOSQv0/maxresdefault.jpg', channelName: 'freeCodeCamp.org' },
      { id: 'v2', title: 'C Programming All-in-One Complete Course', youtubeUrl: 'https://www.youtube.com/watch?v=87SH2Cn0s9A', thumbnailUrl: 'https://img.youtube.com/vi/87SH2Cn0s9A/maxresdefault.jpg', channelName: 'Programming with Mosh' },
      { id: 'v3', title: 'Pointers in C Programming Explained', youtubeUrl: 'https://www.youtube.com/watch?v=zuegQmMdy8M', thumbnailUrl: 'https://img.youtube.com/vi/zuegQmMdy8M/maxresdefault.jpg', channelName: 'mycodeschool' }
    ],
    websites: [
      { id: 'w1', name: 'GeeksforGeeks C Programming', url: 'https://www.geeksforgeeks.org/c-programming-language/', logoUrl: 'fa-code', description: 'Comprehensive tutorials, quizzes, and code examples for C language features.' },
      { id: 'w2', name: 'C Programming Reference', url: 'https://en.cppreference.com/w/c', logoUrl: 'fa-book', description: 'Official standard library reference for C language specs and header definitions.' },
      { id: 'w3', name: 'Learn-C.org Interactive', url: 'https://www.learn-c.org/', logoUrl: 'fa-laptop-code', description: 'Free interactive C tutorial where you can run C code directly in the browser.' }
    ]
  },
  {
    id: 'cpp-1',
    title: 'C++ Programming',
    slug: 'cpp-programming',
    shortDescription: 'Master Object-Oriented Programming, Standard Template Library (STL), templates, and modern C++20 features.',
    overview: 'C++ is a high-performance language that extends C with object-oriented, generic, and functional capabilities.',
    difficulty: 'Intermediate',
    estimatedDuration: '8 Weeks',
    prerequisites: 'C Programming or Basic Logic',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pdfName: 'C++ OOP & STL Complete Reference Notes.pdf',
    roadmapItems: [
      { id: 'cpp-r1', title: 'C++ Basics & I/O Streams', description: 'cin, cout, namespaces', orderIndex: 0 },
      { id: 'cpp-r2', title: 'Classes & Objects', description: 'Constructors, destructors, access modifiers', orderIndex: 1 },
      { id: 'cpp-r3', title: 'Inheritance & Polymorphism', description: 'Virtual functions, abstract classes', orderIndex: 2 },
      { id: 'cpp-r4', title: 'Standard Template Library (STL)', description: 'Vectors, maps, sets, algorithms', orderIndex: 3 }
    ],
    subtopics: [
      { id: 'cpp-s1', title: 'Classes and Object Architecture', description: 'Encapsulate data and functions within objects.', content: 'Classes define blueprints for objects. Encapsulation protects member data.', difficulty: 'Beginner' },
      { id: 'cpp-s2', title: 'Standard Template Library (STL)', description: 'Utilize optimized containers.', content: 'STL provides powerful containers like std::vector and std::map.', difficulty: 'Intermediate' }
    ],
    videos: [
      { id: 'cpp-v1', title: 'C++ Full Course for Beginners', youtubeUrl: 'https://www.youtube.com/watch?v=vLnPwxZdW4w', thumbnailUrl: 'https://img.youtube.com/vi/vLnPwxZdW4w/maxresdefault.jpg', channelName: 'freeCodeCamp.org' },
      { id: 'cpp-v2', title: 'The Cherno C++ Series', youtubeUrl: 'https://www.youtube.com/watch?v=18c3MTX0PK0', thumbnailUrl: 'https://img.youtube.com/vi/18c3MTX0PK0/maxresdefault.jpg', channelName: 'The Cherno' },
      { id: 'cpp-v3', title: 'C++ STL Complete Tutorial', youtubeUrl: 'https://www.youtube.com/watch?v=g-1Cn355STQ', thumbnailUrl: 'https://img.youtube.com/vi/g-1Cn355STQ/maxresdefault.jpg', channelName: 'Luv' }
    ],
    websites: [
      { id: 'cpp-w1', name: 'CppReference.com', url: 'https://en.cppreference.com/w/', logoUrl: 'fa-book', description: 'The definitive online manual for standard C++ specifications.' },
      { id: 'cpp-w2', name: 'LearnCpp.com', url: 'https://www.learncpp.com/', logoUrl: 'fa-graduation-cap', description: 'Free comprehensive guide to learning C++.' },
      { id: 'cpp-w3', name: 'GeeksforGeeks C++', url: 'https://www.geeksforgeeks.org/cpp-tutorial/', logoUrl: 'fa-code', description: 'Structured C++ articles and practice problems.' }
    ]
  },
  {
    id: 'java-1',
    title: 'Java Programming',
    slug: 'java-programming',
    shortDescription: 'Build scalable enterprise software, Android apps, and web services with object-oriented Java & JVM.',
    overview: 'Java is a multi-platform, object-oriented programming language. Write once, run anywhere powers enterprise backends globally.',
    difficulty: 'Intermediate',
    estimatedDuration: '7 Weeks',
    prerequisites: 'Basic Logic',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pdfName: 'Java Programming & JVM Study Material.pdf',
    roadmapItems: [
      { id: 'j-r1', title: 'JVM & JDK Basics', description: 'Bytecode execution, JRE, JIT compiler', orderIndex: 0 },
      { id: 'j-r2', title: 'OOP Principles in Java', description: 'Classes, interfaces, encapsulation', orderIndex: 1 },
      { id: 'j-r3', title: 'Java Collections Framework', description: 'ArrayList, HashMap, HashSet', orderIndex: 2 }
    ],
    subtopics: [
      { id: 'j-s1', title: 'Java Collections Framework', description: 'Master essential data structures built into Java.', content: 'The Collections Framework provides interfaces like List, Set, and Map.', difficulty: 'Intermediate' },
      { id: 'j-s2', title: 'Inheritance & Interfaces', description: 'Design decoupled system contracts.', content: 'Interfaces define contracts without implementation details.', difficulty: 'Beginner' }
    ],
    videos: [
      { id: 'j-v1', title: 'Java Tutorial for Beginners', youtubeUrl: 'https://www.youtube.com/watch?v=eIrMbAQSU34', thumbnailUrl: 'https://img.youtube.com/vi/eIrMbAQSU34/maxresdefault.jpg', channelName: 'Programming with Mosh' },
      { id: 'j-v2', title: 'Java Full Course 12 Hours', youtubeUrl: 'https://www.youtube.com/watch?v=xk4_1vDrnnw', thumbnailUrl: 'https://img.youtube.com/vi/xk4_1vDrnnw/maxresdefault.jpg', channelName: 'Bro Code' },
      { id: 'j-v3', title: 'Java Collections Complete Guide', youtubeUrl: 'https://www.youtube.com/watch?v=viTHc_4XfCA', thumbnailUrl: 'https://img.youtube.com/vi/viTHc_4XfCA/maxresdefault.jpg', channelName: 'Telusko' }
    ],
    websites: [
      { id: 'j-w1', name: 'Oracle Java Documentation', url: 'https://docs.oracle.com/en/java/', logoUrl: 'fa-coffee', description: 'Official Java SE platform documentation.' },
      { id: 'j-w2', name: 'Baeldung Java Guides', url: 'https://www.baeldung.com/', logoUrl: 'fa-newspaper', description: 'In-depth guides on Java, Spring Boot, and collections.' },
      { id: 'j-w3', name: 'JavaTpoint Portal', url: 'https://www.javatpoint.com/java-tutorial', logoUrl: 'fa-book-open', description: 'Beginner tutorials covering core Java.' }
    ]
  },
  {
    id: 'py-1',
    title: 'Python Programming',
    slug: 'python-programming',
    shortDescription: 'Learn versatile, readable Python for web development, automation, data science, and AI.',
    overview: 'Python is a high-level, interpreted programming language renowned for its clean syntax and massive ecosystem. Used globally in machine learning, automation scripting, and web backends.',
    difficulty: 'Beginner',
    estimatedDuration: '5 Weeks',
    prerequisites: 'None',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pdfName: 'Python Full Course Lecture Notes & Cheat Sheet.pdf',
    roadmapItems: [
      { id: 'py-r1', title: 'Python Basics', description: 'Variables, print statements, dynamic typing', orderIndex: 0 },
      { id: 'py-r2', title: 'Variables & Data Types', description: 'Numbers, strings, lists, tuples, dictionaries', orderIndex: 1 },
      { id: 'py-r3', title: 'Operators & Conditionals', description: 'if/elif/else, logical operators', orderIndex: 2 },
      { id: 'py-r4', title: 'Functions & Modules', description: 'def keywords, args, kwargs, import statements', orderIndex: 3 },
      { id: 'py-r5', title: 'Object-Oriented Python', description: 'class, __init__, self parameter', orderIndex: 4 },
      { id: 'py-r6', title: 'File Handling & Exceptions', description: 'try/except/finally blocks', orderIndex: 5 }
    ],
    subtopics: [
      { id: 'py-s1', title: 'Variables and Data Types', description: 'Learn how Python manages dynamic memory and data types.', content: 'Python variables do not require explicit type declaration. Data types include integers, floats, strings, lists, tuples, and dictionaries.', difficulty: 'Beginner' },
      { id: 'py-s2', title: 'Functions & Lambdas', description: 'Write reusable code blocks and anonymous functions.', content: 'Functions are declared using the def keyword. Python supports positional arguments, keyword arguments, and lambda expressions.', difficulty: 'Beginner' },
      { id: 'py-s3', title: 'Object-Oriented Programming in Python', description: 'Build modular applications with classes.', content: 'Classes encapsulate data into objects. Python uses __init__ as constructor and self to reference instance attributes.', difficulty: 'Intermediate' }
    ],
    videos: [
      { id: 'py-v1', title: 'Python for Beginners Full Course', youtubeUrl: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc', thumbnailUrl: 'https://img.youtube.com/vi/_uQrJ0TkZlc/maxresdefault.jpg', channelName: 'Programming with Mosh' },
      { id: 'py-v2', title: 'Python Tutorial - Full Course', youtubeUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw', thumbnailUrl: 'https://img.youtube.com/vi/rfscVS0vtbw/maxresdefault.jpg', channelName: 'freeCodeCamp.org' },
      { id: 'py-v3', title: 'Python OOP Tutorial for Beginners', youtubeUrl: 'https://www.youtube.com/watch?v=JeznW_7DlB0', thumbnailUrl: 'https://img.youtube.com/vi/JeznW_7DlB0/maxresdefault.jpg', channelName: 'Corey Schafer' }
    ],
    websites: [
      { id: 'py-w1', name: 'Official Python Docs', url: 'https://docs.python.org/3/', logoUrl: 'fa-brands fa-python', description: 'Official standard library documentation and tutorials.' },
      { id: 'py-w2', name: 'Real Python Tutorials', url: 'https://realpython.com/', logoUrl: 'fa-globe', description: 'High-quality Python articles and hands-on project walkthroughs.' },
      { id: 'py-w3', name: 'W3Schools Python', url: 'https://www.w3schools.com/python/', logoUrl: 'fa-code', description: 'Simple interactive reference with live try-it code editors.' }
    ]
  },
  {
    id: 'ds-1',
    title: 'Data Structures',
    slug: 'data-structures',
    shortDescription: 'Master Arrays, Linked Lists, Stacks, Queues, Trees, Graphs, and Algorithmic Time Complexity.',
    overview: 'Data structures organize and store data to enable efficient computation. Critical for coding interviews and software engineering.',
    difficulty: 'Intermediate',
    estimatedDuration: '8 Weeks',
    prerequisites: 'Knowledge of any programming language',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pdfName: 'Data Structures & Algorithms Handbook.pdf',
    roadmapItems: [
      { id: 'ds-r1', title: 'Big-O Notation', description: 'Time & space complexity analysis', orderIndex: 0 },
      { id: 'ds-r2', title: 'Arrays & Linked Lists', description: 'Contiguous memory vs pointer node traversal', orderIndex: 1 },
      { id: 'ds-r3', title: 'Stacks & Queues', description: 'LIFO & FIFO data ordering', orderIndex: 2 },
      { id: 'ds-r4', title: 'Trees & Graphs', description: 'BST traversals, BFS, DFS algorithms', orderIndex: 3 }
    ],
    subtopics: [
      { id: 'ds-s1', title: 'Arrays and Linked Lists', description: 'Compare contiguous memory arrays against dynamic node pointers.', content: 'Arrays provide O(1) random access. Linked Lists allow dynamic insertion in O(1).', difficulty: 'Beginner' },
      { id: 'ds-s2', title: 'Graph Traversals (BFS & DFS)', description: 'Explore interconnected networks.', content: 'Breadth-First Search uses a queue. Depth-First Search uses a stack or recursion.', difficulty: 'Advanced' }
    ],
    videos: [
      { id: 'ds-v1', title: 'Data Structures and Algorithms', youtubeUrl: 'https://www.youtube.com/watch?v=8hly31xKLI0', thumbnailUrl: 'https://img.youtube.com/vi/8hly31xKLI0/maxresdefault.jpg', channelName: 'freeCodeCamp.org' },
      { id: 'ds-v2', title: 'Data Structures Course', youtubeUrl: 'https://www.youtube.com/watch?v=RBSGKlAvoiM', thumbnailUrl: 'https://img.youtube.com/vi/RBSGKlAvoiM/maxresdefault.jpg', channelName: 'WilliamFiset' },
      { id: 'ds-v3', title: 'Graph Algorithms Guide', youtubeUrl: 'https://www.youtube.com/watch?v=09_LlHjoEiY', thumbnailUrl: 'https://img.youtube.com/vi/09_LlHjoEiY/maxresdefault.jpg', channelName: 'freeCodeCamp.org' }
    ],
    websites: [
      { id: 'ds-w1', name: 'GeeksforGeeks DS', url: 'https://www.geeksforgeeks.org/data-structures/', logoUrl: 'fa-code', description: 'The ultimate repository of data structure implementations.' },
      { id: 'ds-w2', name: 'VisuAlgo Visualizations', url: 'https://visualgo.net/', logoUrl: 'fa-eye', description: 'Interactive visual animations of data structure operations.' },
      { id: 'ds-w3', name: 'LeetCode Problem Archive', url: 'https://leetcode.com/', logoUrl: 'fa-terminal', description: 'Practice real algorithmic coding problems.' }
    ]
  },
  {
    id: 'phys-1',
    title: 'Physics',
    slug: 'physics',
    shortDescription: 'Explore Classical Mechanics, Electromagnetism, Optics, and Quantum Physics principles.',
    overview: 'Physics is the foundational science studying matter, motion, energy, and force. Essential for engineering and scientific research.',
    difficulty: 'Intermediate',
    estimatedDuration: '10 Weeks',
    prerequisites: 'High School Calculus Basics',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pdfName: 'General Physics Principles & Formulas.pdf',
    roadmapItems: [
      { id: 'p-r1', title: 'Kinematics & Dynamics', description: '1D/2D Motion, Newton laws', orderIndex: 0 },
      { id: 'p-r2', title: 'Work & Energy', description: 'Conservation of energy, momentum', orderIndex: 1 },
      { id: 'p-r3', title: 'Electromagnetism', description: 'Coulomb law, Faraday induction', orderIndex: 2 }
    ],
    subtopics: [
      { id: 'p-s1', title: 'Newton Laws of Motion', description: 'Fundamental principles governing physical forces.', content: 'Newton 1st Law (Inertia), 2nd Law (F = ma), and 3rd Law (Action-Reaction).', difficulty: 'Beginner' }
    ],
    videos: [
      { id: 'p-v1', title: 'Physics Classical Mechanics', youtubeUrl: 'https://www.youtube.com/watch?v=ApUFtLCrU90', thumbnailUrl: 'https://img.youtube.com/vi/ApUFtLCrU90/maxresdefault.jpg', channelName: 'The Organic Chemistry Tutor' },
      { id: 'p-v2', title: 'Physics Concepts Visualized', youtubeUrl: 'https://www.youtube.com/watch?v=P1ww1IXRfTA', thumbnailUrl: 'https://img.youtube.com/vi/P1ww1IXRfTA/maxresdefault.jpg', channelName: '3Blue1Brown' },
      { id: 'p-v3', title: 'Electromagnetism Crash Course', youtubeUrl: 'https://www.youtube.com/watch?v=H7TbsVbN-Y8', thumbnailUrl: 'https://img.youtube.com/vi/H7TbsVbN-Y8/maxresdefault.jpg', channelName: 'CrashCourse' }
    ],
    websites: [
      { id: 'p-w1', name: 'PhET Interactive Sims', url: 'https://phet.colorado.edu/', logoUrl: 'fa-atom', description: 'Interactive simulations for physics and motion.' },
      { id: 'p-w2', name: 'The Physics Classroom', url: 'https://www.physicsclassroom.com/', logoUrl: 'fa-school', description: 'Online physics tutorials and concept builders.' },
      { id: 'p-w3', name: 'HyperPhysics Map', url: 'http://hyperphysics.phy-astr.gsu.edu/hbase/index.html', logoUrl: 'fa-project-diagram', description: 'Exploration map of physical science concepts.' }
    ]
  },
  {
    id: 'semi-1',
    title: 'Semiconductors',
    slug: 'semiconductors',
    shortDescription: 'Understand solid-state physics, P-N junctions, transistors, diodes, and microchip fabrication.',
    overview: 'Semiconductors form the backbone of modern electronic devices, microprocessors, and solar panels.',
    difficulty: 'Advanced',
    estimatedDuration: '6 Weeks',
    prerequisites: 'Basic Physics & Circuits',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pdfName: 'Semiconductor Physics & Device Notes.pdf',
    roadmapItems: [
      { id: 'sm-r1', title: 'Energy Band Theory', description: 'Valence & conduction bands', orderIndex: 0 },
      { id: 'sm-r2', title: 'P-N Junction Diodes', description: 'Depletion layer, forward bias', orderIndex: 1 },
      { id: 'sm-r3', title: 'MOSFET Transistors', description: 'CMOS gate logic and microchips', orderIndex: 2 }
    ],
    subtopics: [
      { id: 'sm-s1', title: 'P-N Junction Operation', description: 'Understand diode boundary dynamics.', content: 'P-type and N-type silicon junction creates a depletion region with built-in potential barrier.', difficulty: 'Intermediate' }
    ],
    videos: [
      { id: 'sm-v1', title: 'How a Semiconductor Works', youtubeUrl: 'https://www.youtube.com/watch?v=33vbFFFnKKc', thumbnailUrl: 'https://img.youtube.com/vi/33vbFFFnKKc/maxresdefault.jpg', channelName: 'Branch Education' },
      { id: 'sm-v2', title: 'Transistors & MOSFETs', youtubeUrl: 'https://www.youtube.com/watch?v=stM8d3fuvFw', thumbnailUrl: 'https://img.youtube.com/vi/stM8d3fuvFw/maxresdefault.jpg', channelName: 'Veritasium' },
      { id: 'sm-v3', title: 'Semiconductor Physics', youtubeUrl: 'https://www.youtube.com/watch?v=gT8jJgS10qQ', thumbnailUrl: 'https://img.youtube.com/vi/gT8jJgS10qQ/maxresdefault.jpg', channelName: 'NPTEL' }
    ],
    websites: [
      { id: 'sm-w1', name: 'EE Power Semiconductor', url: 'https://eepower.com/', logoUrl: 'fa-bolt', description: 'Technical articles on semiconductor operation.' },
      { id: 'sm-w2', name: 'Britannica Semiconductors', url: 'https://www.britannica.com/technology/semiconductor', logoUrl: 'fa-microchip', description: 'Scientific explanation of semiconductor materials.' },
      { id: 'sm-w3', name: 'Semiconductor Engineering', url: 'https://semiengineering.com/', logoUrl: 'fa-cogs', description: 'Industry insights into chip design and lithography.' }
    ]
  },
  {
    id: 'thermo-1',
    title: 'Thermodynamics',
    slug: 'thermodynamics',
    shortDescription: 'Master the laws of heat transfer, entropy, enthalpy, heat engines, and Carnot efficiency.',
    overview: 'Thermodynamics is the study of heat, work, energy transformations, and thermal properties.',
    difficulty: 'Intermediate',
    estimatedDuration: '7 Weeks',
    prerequisites: 'General Physics & Calculus',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    pdfName: 'Thermodynamics Laws & Cycle Formulas.pdf',
    roadmapItems: [
      { id: 'th-r1', title: 'Zeroth & First Laws', description: 'Internal energy, heat Q, work W', orderIndex: 0 },
      { id: 'th-r2', title: 'Second Law & Entropy', description: 'Spontaneity & Carnot cycle', orderIndex: 1 },
      { id: 'th-r3', title: 'Enthalpy & Cycles', description: 'Otto, Rankine & Diesel power cycles', orderIndex: 2 }
    ],
    subtopics: [
      { id: 'th-s1', title: 'First Law of Thermodynamics', description: 'Energy conservation (Delta U = Q - W).', content: 'Internal energy change equals net heat added minus work performed by system.', difficulty: 'Beginner' }
    ],
    videos: [
      { id: 'th-v1', title: 'First Law of Thermodynamics', youtubeUrl: 'https://www.youtube.com/watch?v=NYg62jK7vJg', thumbnailUrl: 'https://img.youtube.com/vi/NYg62jK7vJg/maxresdefault.jpg', channelName: 'The Organic Chemistry Tutor' },
      { id: 'th-v2', title: 'What is Entropy?', youtubeUrl: 'https://www.youtube.com/watch?v=YM-uykVfq_E', thumbnailUrl: 'https://img.youtube.com/vi/YM-uykVfq_E/maxresdefault.jpg', channelName: 'Kurzgesagt' },
      { id: 'th-v3', title: 'Carnot Heat Engine Guide', youtubeUrl: 'https://www.youtube.com/watch?v=4i1MUWJoI0U', thumbnailUrl: 'https://img.youtube.com/vi/4i1MUWJoI0U/maxresdefault.jpg', channelName: 'Doc Schuster' }
    ],
    websites: [
      { id: 'th-w1', name: 'NASA Thermodynamics', url: 'https://www.grc.nasa.gov/www/k-12/airplane/thermo.html', logoUrl: 'fa-rocket', description: 'NASA Glenn Research guide to gas dynamics.' },
      { id: 'th-w2', name: 'Engineering Toolbox', url: 'https://www.engineeringtoolbox.com/', logoUrl: 'fa-wrench', description: 'Resource tables and formulas for thermal engineering.' },
      { id: 'th-w3', name: 'LibreTexts Physics', url: 'https://phys.libretexts.org/', logoUrl: 'fa-book-reader', description: 'Open textbook chapters on thermal mechanics.' }
    ]
  }
];

// Helper Toast Notification
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let iconClass = 'fa-circle-info';
  if (type === 'success') iconClass = 'fa-circle-check';
  if (type === 'error') iconClass = 'fa-circle-exclamation';

  toast.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// Global App Initialization
document.addEventListener('DOMContentLoaded', async () => {
  await fetchCourses();
  renderApp();

  const closeVideoBtn = document.getElementById('close-video-modal');
  if (closeVideoBtn) {
    closeVideoBtn.addEventListener('click', closeVideoModal);
  }
});

// Fetch Courses from REST API or Fallback
async function fetchCourses(query = '') {
  try {
    const url = query ? `${API_BASE_URL}/search?q=${encodeURIComponent(query)}` : `${API_BASE_URL}/courses`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        state.courses = data.data;
        state.filteredCourses = data.data;
        return;
      }
    }
  } catch (err) {
    console.warn('API Connection offline, using fallback dataset.');
  }

  state.courses = FALLBACK_COURSES;
  if (query) {
    const q = query.toLowerCase();
    state.filteredCourses = FALLBACK_COURSES.filter(c => 
      c.title.toLowerCase().includes(q) || 
      c.shortDescription.toLowerCase().includes(q) ||
      (c.subtopics && c.subtopics.some(s => s.title.toLowerCase().includes(q)))
    );
  } else {
    state.filteredCourses = FALLBACK_COURSES;
  }
}

// Master Render Loop
function renderApp() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  appContainer.innerHTML = `
    ${renderNavbar()}
    <main id="main-content">
      ${renderCurrentView()}
    </main>
    ${renderFooter()}
    ${renderChatbot()}
    ${renderAddSubjectModal()}
  `;

  attachEventListeners();
}

// Render Navbar Component
function renderNavbar() {
  const isStudent = state.role === 'STUDENT';
  const isTeacher = state.role === 'TEACHER';
  const isLoggedIn = isStudent || isTeacher;
  const userName = state.currentUser?.name || (isTeacher ? 'Prof. Teacher' : 'Alex Student');

  return `
    <nav class="navbar">
      <div class="navbar-container">
        <a href="#" class="logo" onclick="navigateTo('LANDING')">
          <i class="fa-solid fa-lightbulb"></i> CLARITY
        </a>

        <ul class="nav-links ${state.mobileNavOpen ? 'active' : ''}">
          <li class="nav-item ${state.currentView === 'LANDING' ? 'active' : ''}">
            <a href="#" onclick="navigateTo('LANDING')">Home</a>
          </li>
          
          ${isLoggedIn ? `
            <li class="nav-item ${state.currentView === 'STUDENT_DASHBOARD' || state.currentView === 'TEACHER_DASHBOARD' ? 'active' : ''}">
              <a href="#" onclick="navigateTo('${isTeacher ? 'TEACHER_DASHBOARD' : 'STUDENT_DASHBOARD'}')">Dashboard</a>
            </li>
          ` : `
            <li class="nav-item">
              <a href="#" onclick="scrollToSection('popular-subjects')">Courses</a>
            </li>
            <li class="nav-item">
              <a href="#" onclick="scrollToSection('features-section')">About</a>
            </li>
          `}
          
          ${isTeacher ? `
            <li class="nav-item">
              <a href="#" onclick="openAddSubjectModal()"><i class="fa-solid fa-plus-circle"></i> Add Subject</a>
            </li>
          ` : ''}

          <li class="nav-item">
            <a href="#" onclick="toggleChatbot()"><i class="fa-solid fa-robot"></i> CLARITY AI</a>
          </li>
        </ul>

        <div class="nav-actions">
          ${isLoggedIn ? `
            <div class="flex items-center gap-2">
              <span class="role-badge ${isTeacher ? 'teacher' : 'student'}">
                <i class="fa-solid ${isTeacher ? 'fa-chalkboard-user' : 'fa-user-graduate'}"></i>
                ${isTeacher ? 'Teacher' : 'Student'}
              </span>
              <span style="font-weight: 600; font-size: 0.9rem; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${userName}</span>
              <button class="btn btn-outline" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" onclick="logout()">Logout</button>
            </div>
          ` : `
            <button class="btn btn-secondary" onclick="navigateTo('LOGIN')">Login</button>
            <button class="btn btn-primary" onclick="navigateTo('LOGIN')">Get Started</button>
          `}
          <button class="mobile-toggle" onclick="toggleMobileNav()"><i class="fa-solid fa-bars"></i></button>
        </div>
      </div>
    </nav>
  `;
}

// Render Current View
function renderCurrentView() {
  switch (state.currentView) {
    case 'LANDING': return renderLandingPage();
    case 'LOGIN': return renderLoginPage();
    case 'STUDENT_DASHBOARD': return renderStudentDashboard();
    case 'TEACHER_DASHBOARD': return renderTeacherDashboard();
    case 'SUBJECT_DETAIL': return renderSubjectPage();
    default: return renderLandingPage();
  }
}

// 1. LANDING PAGE
function renderLandingPage() {
  return `
    <section class="hero-section">
      <div class="hero-content">
        <h1>Learn Smarter. <span>Explore Better.</span> Build Your Future.</h1>
        <p>Discover courses, interactive roadmaps, PDF notes, educational videos, trusted websites, and real-time AI web search assistance with CLARITY.</p>
        <div class="hero-buttons">
          <button class="btn btn-primary" onclick="navigateTo('${state.role === 'TEACHER' ? 'TEACHER_DASHBOARD' : 'STUDENT_DASHBOARD'}')">
            Explore Courses <i class="fa-solid fa-arrow-right"></i>
          </button>
          <button class="btn btn-secondary" onclick="navigateTo('LOGIN')">Get Started</button>
        </div>
      </div>

      <div class="hero-illustration">
        <div class="hero-card-preview">
          <div class="hero-card-header">
            <div class="hero-icon-box"><i class="fa-brands fa-python"></i></div>
            <div>
              <h4 style="font-size: 1.15rem;">Python Programming</h4>
              <p style="font-size: 0.85rem; color: var(--color-text-muted);">Master AI, Data Science & Web</p>
            </div>
          </div>
          <div style="background: var(--color-bg); padding: 1rem; border-radius: 12px; margin-bottom: 1rem;">
            <div class="flex justify-between items-center" style="font-size: 0.85rem; font-weight: 600;">
              <span>Interactive Roadmap Progress</span>
              <span style="color: var(--color-primary);">75%</span>
            </div>
            <div style="width: 100%; height: 8px; background: #E2E8F0; border-radius: 4px; margin-top: 0.5rem; overflow: hidden;">
              <div style="width: 75%; height: 100%; background: linear-gradient(90deg, var(--color-primary), var(--color-accent));"></div>
            </div>
          </div>
        </div>

        <div class="floating-chip floating-chip-1">
          <i class="fa-solid fa-brain" style="color: var(--color-accent);"></i> CLARITY Web-Search AI
        </div>
        <div class="floating-chip floating-chip-2">
          <i class="fa-solid fa-globe" style="color: #0EA5E9;"></i> Live Web Search
        </div>
      </div>
    </section>

    <!-- Popular Subjects -->
    <section class="section-container" id="popular-subjects">
      <div class="section-header">
        <h2>Popular Subjects</h2>
        <p>Explore structured learning paths curated by academic teachers and professors.</p>
      </div>

      <div class="subject-grid">
        ${state.courses.map(course => `
          <div class="subject-card">
            <div>
              <div class="subject-card-icon">
                <i class="${getSubjectIcon(course.title)}"></i>
              </div>
              <h3>${course.title}</h3>
              <p>${course.shortDescription}</p>
            </div>
            <button class="btn btn-outline" style="width: 100%;" onclick="openSubject('${course.id}')">
              Explore Roadmap <i class="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Features Section -->
    <section class="section-container" id="features-section" style="background: white; border-radius: 24px; padding: 4rem 2rem; margin: 3rem auto; max-width: 1240px; border: 1px solid var(--color-border);">
      <div class="section-header">
        <h2>Why Choose CLARITY?</h2>
        <p>Everything you need for comprehensive academic and technical subject mastery.</p>
      </div>

      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon"><i class="fa-solid fa-map-location-dot"></i></div>
          <h3>Course Roadmaps</h3>
          <p>Visually structured step-by-step learning paths connecting beginner fundamentals to advanced concepts.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon"><i class="fa-solid fa-file-pdf" style="color: #EF4444;"></i></div>
          <h3>Subject PDF Notes</h3>
          <p>Downloadable lecture notes and PDF references attached directly by subject teachers.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon"><i class="fa-brands fa-youtube" style="color: #FF0000;"></i></div>
          <h3>Curated YouTube Videos</h3>
          <p>Top video recommendations per subject from leading global educators and tech creators.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon"><i class="fa-solid fa-globe"></i></div>
          <h3>Real-Time Web Search AI</h3>
          <p>Searches official documentation, universities, and technical web sources dynamically.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon"><i class="fa-solid fa-robot"></i></div>
          <h3>CLARITY Web-Search AI</h3>
          <p>Understands natural language questions, code debugging, math/physics step-by-step numerical solutions.</p>
        </div>
      </div>
    </section>
  `;
}

// 2. LOGIN PAGE
function renderLoginPage() {
  return `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo justify-center" style="margin-bottom: 1rem;">
            <i class="fa-solid fa-lightbulb"></i> CLARITY
          </div>
          <h2>Welcome Back</h2>
          <p style="color: var(--color-text-muted); font-size: 0.9rem;">Select your role & enter your display name to continue</p>
        </div>

        <div class="role-switcher">
          <button class="role-tab ${state.role === 'STUDENT' || state.role === 'GUEST' ? 'active' : ''}" onclick="setLoginRole('STUDENT')">
            <i class="fa-solid fa-user-graduate"></i> Student Login
          </button>
          <button class="role-tab ${state.role === 'TEACHER' ? 'active' : ''}" onclick="setLoginRole('TEACHER')">
            <i class="fa-solid fa-chalkboard-user"></i> Teacher Login
          </button>
        </div>

        <form onsubmit="handleLoginSubmit(event)">
          <div class="form-group">
            <label>Your Full Name / Display Name</label>
            <input type="text" id="login-name" class="form-input" 
                   placeholder="${state.role === 'TEACHER' ? 'e.g. Prof. Robert Smith' : 'e.g. Alex Johnson'}" 
                   value="${state.currentUser?.name || ''}" required>
          </div>

          <div class="form-group">
            <label>Email Address</label>
            <input type="email" id="login-email" class="form-input" 
                   placeholder="${state.role === 'TEACHER' ? 'teacher@clarity.com' : 'student@clarity.com'}" required>
          </div>

          <div class="form-group">
            <label>Password</label>
            <input type="password" id="login-password" class="form-input" placeholder="••••••••" required>
          </div>

          <div class="form-options">
            <label><input type="checkbox" checked> Remember me</label>
            <a href="#" onclick="showToast('Password reset link sent to email', 'info')">Forgot password?</a>
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; margin-bottom: 1rem;">
            Login as ${state.role === 'TEACHER' ? 'Teacher' : 'Student'}
          </button>
        </form>

        <div class="demo-buttons-divider">
          <span>Quick Demo Access</span>
        </div>

        <div style="display: flex; gap: 0.75rem;">
          <button class="btn btn-secondary" style="flex: 1; font-size: 0.85rem;" onclick="quickLogin('STUDENT')">
            <i class="fa-solid fa-user-graduate"></i> Student Demo
          </button>
          <button class="btn btn-secondary" style="flex: 1; font-size: 0.85rem;" onclick="quickLogin('TEACHER')">
            <i class="fa-solid fa-chalkboard-user"></i> Teacher Demo
          </button>
        </div>
      </div>
    </div>
  `;
}

// 3. STUDENT DASHBOARD
function renderStudentDashboard() {
  const userName = state.currentUser?.name || 'Student';

  return `
    <div class="dashboard-header">
      <div class="dashboard-header-container">
        <div class="welcome-banner">
          <div class="welcome-text">
            <h1>Welcome back, ${userName}! 👋</h1>
            <p>Explore your subjects, interactive roadmaps, PDF lecture notes, and video tutorials.</p>
          </div>
          <span class="role-badge student" style="padding: 0.5rem 1rem; font-size: 0.85rem;">
            <i class="fa-solid fa-user-graduate"></i> Student Portal
          </span>
        </div>

        <div class="search-bar-wrapper">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input type="text" class="search-input" id="search-bar-input" 
                 placeholder="Search C, Python, Physics, Data Structures..." 
                 value="${state.searchQuery}"
                 oninput="handleSearchInput(event)">
        </div>
      </div>
    </div>

    <section class="section-container">
      <div class="flex justify-between items-center" style="margin-bottom: 1.5rem;">
        <h2>Available Courses (${state.filteredCourses.length})</h2>
        <span style="color: var(--color-text-muted); font-size: 0.9rem;">Updated with Teacher Resources</span>
      </div>

      ${state.filteredCourses.length === 0 ? `
        <div style="text-align: center; padding: 4rem 2rem; background: white; border-radius: 16px; border: 1px solid var(--color-border);">
          <i class="fa-solid fa-folder-open" style="font-size: 3rem; color: var(--color-text-light); margin-bottom: 1rem;"></i>
          <h3>No subjects found</h3>
          <p style="color: var(--color-text-muted); margin-top: 0.5rem;">Try searching for another subject like "Python", "Physics", or "Data Structures".</p>
          <button class="btn btn-primary" style="margin-top: 1.5rem;" onclick="resetSearch()">Clear Search</button>
        </div>
      ` : `
        <div class="course-grid">
          ${state.filteredCourses.map(course => `
            <div class="course-card">
              <div>
                <div class="course-card-top">
                  <div class="subject-card-icon" style="margin-bottom: 0;">
                    <i class="${getSubjectIcon(course.title)}"></i>
                  </div>
                  <span class="difficulty-pill ${course.difficulty ? course.difficulty.toLowerCase() : 'beginner'}">${course.difficulty || 'Beginner'}</span>
                </div>
                <h3 style="font-size: 1.25rem; margin-top: 1rem; margin-bottom: 0.5rem;">${course.title}</h3>
                <p style="color: var(--color-text-muted); font-size: 0.9rem;">${course.shortDescription}</p>
                
                <div class="course-meta">
                  <span><i class="fa-solid fa-route"></i> ${course.roadmapItems?.length || 5} Topics</span>
                  <span><i class="fa-brands fa-youtube" style="color: #FF0000;"></i> ${course.videos?.length || 3} Videos</span>
                  ${course.pdfUrl ? `<span style="color: #EF4444;"><i class="fa-solid fa-file-pdf"></i> Notes PDF</span>` : ''}
                </div>
              </div>

              <button class="btn btn-primary" style="width: 100%; margin-top: 1rem;" onclick="openSubject('${course.id}')">
                Explore Course <i class="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          `).join('')}
        </div>
      `}
    </section>
  `;
}

// 4. TEACHER DASHBOARD
function renderTeacherDashboard() {
  const teacherName = state.currentUser?.name || 'Prof. Teacher';

  return `
    <div class="dashboard-header" style="background: linear-gradient(135deg, #ECFDF5 0%, #E0F2FE 100%);">
      <div class="dashboard-header-container">
        <div class="welcome-banner">
          <div class="welcome-text">
            <h1>Teacher Portal: ${teacherName} 👨‍🏫</h1>
            <p>Create, update existing subjects, upload PDFs, and add YouTube/Website links. Changes are instantly visible to students!</p>
          </div>
          
          <button class="btn btn-primary" style="background: linear-gradient(135deg, #059669, #0EA5E9);" onclick="openAddSubjectModal()">
            <i class="fa-solid fa-plus-circle"></i> + Add New Subject
          </button>
        </div>
      </div>
    </div>

    <section class="section-container">
      <div class="flex justify-between items-center" style="margin-bottom: 1.5rem;">
        <h2>Manage Academic Subjects (${state.courses.length})</h2>
        <span style="color: var(--color-text-muted); font-size: 0.9rem;">Click "Edit / Add Resources" to add PDFs, Videos, or Websites to any subject</span>
      </div>

      <div class="course-grid">
        ${state.courses.map(course => `
          <div class="course-card">
            <div>
              <div class="course-card-top">
                <div class="subject-card-icon" style="margin-bottom: 0; background: #ECFDF5; color: #059669;">
                  <i class="${getSubjectIcon(course.title)}"></i>
                </div>
                <span class="role-badge teacher">Published</span>
              </div>
              <h3 style="font-size: 1.25rem; margin-top: 1rem; margin-bottom: 0.5rem;">${course.title}</h3>
              <p style="color: var(--color-text-muted); font-size: 0.9rem;">${course.shortDescription}</p>

              <div class="course-meta">
                <span><i class="fa-solid fa-layer-group"></i> ${course.subtopics?.length || 0} Subtopics</span>
                <span><i class="fa-brands fa-youtube"></i> ${course.videos?.length || 0} Videos</span>
                <span><i class="fa-solid fa-globe"></i> ${course.websites?.length || 0} Sites</span>
              </div>

              ${course.pdfUrl ? `
                <div style="background: #FEF2F2; padding: 0.5rem 0.75rem; border-radius: 8px; font-size: 0.8rem; color: #DC2626; margin-top: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                  <i class="fa-solid fa-file-pdf"></i> PDF Attached: ${course.pdfName || 'Subject Notes.pdf'}
                </div>
              ` : ''}
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem;">
              <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-outline" style="flex: 1; padding: 0.5rem;" onclick="openSubject('${course.id}')">
                  <i class="fa-solid fa-eye"></i> View Student Page
                </button>
                <button class="btn btn-danger" style="padding: 0.5rem 0.75rem;" onclick="deleteCourseConfirm('${course.id}')">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>

              <button class="btn btn-secondary" style="width: 100%; background: #EEF2FF; color: var(--color-primary); border-color: #C7D2FE;" 
                      onclick="openEditSubjectModal('${course.id}')">
                <i class="fa-solid fa-pen-to-square"></i> Edit / Add Videos, Sites & PDF
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

// 5. SUBJECT LEARNING PAGE
function renderSubjectPage() {
  const course = state.selectedCourse || state.courses[0];
  if (!course) return '<div class="section-container">No course selected</div>';

  const roadmapItems = course.roadmapItems || [];
  const subtopics = course.subtopics || [];
  const videos = course.videos || [];
  const websites = course.websites || [];

  return `
    <div class="subject-hero">
      <div class="subject-hero-container">
        <button class="btn btn-secondary" style="margin-bottom: 1.5rem;" onclick="navigateTo('${state.role === 'TEACHER' ? 'TEACHER_DASHBOARD' : 'STUDENT_DASHBOARD'}')">
          <i class="fa-solid fa-arrow-left"></i> Back to Dashboard
        </button>

        <div class="flex items-center gap-4">
          <div class="subject-card-icon" style="width: 64px; height: 64px; font-size: 2rem;">
            <i class="${getSubjectIcon(course.title)}"></i>
          </div>
          <div>
            <h1 style="font-size: 2.75rem; font-weight: 800;">${course.title}</h1>
            <p style="color: var(--color-text-muted); font-size: 1.1rem; max-width: 800px;">${course.shortDescription}</p>
          </div>
        </div>

        <div class="subject-overview-card">
          <div class="overview-item">
            <div class="overview-icon"><i class="fa-solid fa-signal"></i></div>
            <div>
              <span style="font-size: 0.8rem; color: var(--color-text-muted);">Difficulty</span>
              <h4 style="font-size: 1rem;">${course.difficulty}</h4>
            </div>
          </div>
          <div class="overview-item">
            <div class="overview-icon"><i class="fa-solid fa-hourglass-half"></i></div>
            <div>
              <span style="font-size: 0.8rem; color: var(--color-text-muted);">Estimated Duration</span>
              <h4 style="font-size: 1rem;">${course.estimatedDuration}</h4>
            </div>
          </div>
          <div class="overview-item">
            <div class="overview-icon"><i class="fa-solid fa-list-check"></i></div>
            <div>
              <span style="font-size: 0.8rem; color: var(--color-text-muted);">Prerequisites</span>
              <h4 style="font-size: 1rem;">${course.prerequisites}</h4>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="section-container">
      <!-- Section 0: PDF Notes & Study Material -->
      <div style="background: linear-gradient(135deg, #FEF2F2 0%, #FFF5F5 100%); border: 1.5px solid #FECACA; border-radius: 20px; padding: 2rem; margin-bottom: 3rem; box-shadow: var(--shadow-sm);">
        <div class="flex justify-between items-center flex-col md:flex-row" style="gap: 1.5rem;">
          <div class="flex items-center gap-4">
            <div style="width: 56px; height: 56px; border-radius: 14px; background: #EF4444; color: white; display: flex; align-items: center; justify-content: center; font-size: 1.75rem;">
              <i class="fa-solid fa-file-pdf"></i>
            </div>
            <div>
              <h3 style="font-size: 1.35rem; color: #991B1B;">${course.pdfName || `${course.title} Lecture Notes & Complete Study PDF.pdf`}</h3>
              <p style="color: #7F1D1D; font-size: 0.92rem;">Teacher-uploaded study material, formula sheets, and textbook notes.</p>
            </div>
          </div>

          <a href="${course.pdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'}" 
             target="_blank" rel="noopener noreferrer" 
             class="btn btn-primary" style="background: #EF4444; box-shadow: 0 4px 14px rgba(239,68,68,0.35);">
            <i class="fa-solid fa-download"></i> View / Download PDF Notes
          </a>
        </div>
      </div>

      <!-- Section 1: Interactive Subject Roadmap -->
      <div style="margin-bottom: 4rem;">
        <div class="section-header" style="text-align: left; margin: 0 0 2rem 0;">
          <h2>Subject Roadmap</h2>
          <p>Click on any topic node along the learning path to explore lesson details.</p>
        </div>

        <div class="roadmap-container">
          <div class="roadmap-timeline">
            ${roadmapItems.map((item, index) => `
              <div class="roadmap-node ${state.activeRoadmapIndex === index ? 'active' : ''}" onclick="selectRoadmapTopic(${index})">
                <div class="flex items-center gap-4">
                  <div class="roadmap-node-badge">${index + 1}</div>
                  <div>
                    <h4 style="font-size: 1.1rem; margin-bottom: 0.2rem;">${item.title}</h4>
                    <p style="font-size: 0.85rem; color: var(--color-text-muted);">${item.description || 'Core concept lesson node'}</p>
                  </div>
                </div>
                <i class="fa-solid fa-circle-chevron-right" style="color: var(--color-primary); font-size: 1.25rem;"></i>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Section 2: Subtopics -->
      <div style="margin-bottom: 4rem;">
        <div class="section-header" style="text-align: left; margin: 0 0 2rem 0;">
          <h2>Key Subtopics</h2>
          <p>Detailed modules and breakdown of underlying mechanisms.</p>
        </div>

        <div class="course-grid">
          ${subtopics.map(sub => `
            <div class="course-card">
              <div>
                <span class="difficulty-pill ${sub.difficulty ? sub.difficulty.toLowerCase() : 'beginner'}" style="margin-bottom: 0.75rem; display: inline-block;">
                  ${sub.difficulty || 'Beginner'}
                </span>
                <h3 style="font-size: 1.2rem; margin-bottom: 0.5rem;">${sub.title}</h3>
                <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 1rem;">${sub.description}</p>
                <div style="background: var(--color-bg); padding: 1rem; border-radius: 8px; font-size: 0.85rem; line-height: 1.5; color: var(--color-text-main);">
                  ${sub.content}
                </div>
              </div>
              <button class="btn btn-outline" style="width: 100%; margin-top: 1.25rem;" onclick="showToast('Lesson module complete!', 'success')">
                <i class="fa-solid fa-check"></i> Mark Complete
              </button>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Section 3: Best YouTube Videos -->
      <div style="margin-bottom: 4rem;">
        <div class="section-header" style="text-align: left; margin: 0 0 1.5rem 0;">
          <h2><i class="fa-brands fa-youtube" style="color: #FF0000;"></i> Recommended YouTube Videos (${videos.length})</h2>
          <p>Teacher recommended video lectures for ${course.title}.</p>
        </div>

        <div class="resource-grid">
          ${videos.map(vid => `
            <div class="video-card">
              <div class="video-thumbnail-wrapper" onclick="openVideoModal('${vid.youtubeUrl}', '${vid.title}')">
                <img src="${vid.thumbnailUrl || 'https://img.youtube.com/vi/KJgsSFOSQv0/hqdefault.jpg'}" alt="${vid.title}">
                <div class="play-overlay"><i class="fa-solid fa-circle-play"></i></div>
              </div>
              <div class="video-card-body">
                <div>
                  <h4>${vid.title}</h4>
                  <div class="channel-name">
                    <i class="fa-solid fa-user-circle"></i> ${vid.channelName || 'Instructor Video'}
                  </div>
                </div>
                <button class="btn btn-primary" style="width: 100%; margin-top: 1rem;" onclick="openVideoModal('${vid.youtubeUrl}', '${vid.title}')">
                  <i class="fa-solid fa-play"></i> Watch Video
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Section 4: Best Websites Section -->
      <div style="margin-bottom: 2rem;">
        <div class="section-header" style="text-align: left; margin: 0 0 1.5rem 0;">
          <h2><i class="fa-solid fa-globe" style="color: var(--color-primary);"></i> Top Learning Websites (${websites.length})</h2>
          <p>Trusted external documentation, guides, and interactive sandboxes.</p>
        </div>

        <div class="resource-grid">
          ${websites.map(site => `
            <div class="website-card">
              <div>
                <div class="website-logo-header">
                  <div class="website-logo">
                    <i class="${site.logoUrl?.startsWith('fa') ? site.logoUrl : 'fa-solid fa-earth-americas'}"></i>
                  </div>
                  <h4 style="font-size: 1.1rem;">${site.name}</h4>
                </div>
                <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 1.25rem;">${site.description || 'Reference link'}</p>
              </div>

              <a href="${site.url}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="width: 100%; text-align: center;">
                Visit Website <i class="fa-solid fa-arrow-up-right-from-square"></i>
              </a>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// 6. FLOATING AI CHATBOT (CLARITY WEB-SEARCH AI)
function renderChatbot() {
  const currentSubjectName = state.selectedCourse ? state.selectedCourse.title : 'All Subjects';
  const dynamicQuestions = getSubjectSuggestedQuestions(currentSubjectName);

  return `
    <div class="chatbot-fab" onclick="toggleChatbot()">
      <i class="fa-solid ${state.isChatOpen ? 'fa-xmark' : 'fa-wand-magic-sparkles'}"></i>
    </div>

    <div class="chatbot-panel ${state.isChatOpen ? '' : 'hidden'}">
      <div class="chatbot-header">
        <div class="chatbot-title">
          <h4><i class="fa-solid fa-sparkles"></i> CLARITY Web-Search AI</h4>
          <div class="chatbot-subtitle">Real-time Web Search & AI Synthesis for ${currentSubjectName}</div>
        </div>
        <button onclick="toggleChatbot()" style="color: white; font-size: 1.2rem;"><i class="fa-solid fa-minus"></i></button>
      </div>

      <div class="chatbot-messages" id="chat-messages-container">
        <div class="chat-msg ai">
          Hello! I am your <strong>CLARITY Web-Search AI Tutor</strong>. Ask me any question about <strong>${currentSubjectName}</strong> — I perform live web searches across official documentation, universities, and reliable technical sources to synthesize your answer!
        </div>

        ${state.chatMessages.map(msg => `
          <div class="chat-msg ${msg.sender === 'USER' ? 'user' : 'ai'}">
            ${formatChatMessage(msg.text)}
          </div>
        `).join('')}

        ${state.chatLoadingState ? `
          <div class="chat-msg ai" style="background: #EEF2FF; color: #4F46E5; border-color: #C7D2FE;">
            <i class="fa-solid fa-spinner fa-spin" style="margin-right: 0.5rem;"></i> <em>${state.chatLoadingState}</em>
          </div>
        ` : ''}
      </div>

      <!-- Suggested Question Chips -->
      <div class="suggested-questions">
        ${dynamicQuestions.map(q => `
          <button class="suggested-btn" onclick="sendPresetChat('${q.replace(/'/g, "\\'")}')">${q}</button>
        `).join('')}
      </div>

      <form class="chatbot-input-container" onsubmit="handleChatSubmit(event)">
        <input type="text" id="chat-input-text" class="chatbot-input" placeholder="Ask any question about ${currentSubjectName}..." required>
        <button type="submit" class="btn btn-primary" style="padding: 0.5rem 0.85rem;"><i class="fa-solid fa-paper-plane"></i></button>
      </form>
    </div>
  `;
}

function getSubjectSuggestedQuestions(subjectTitle) {
  const t = subjectTitle.toLowerCase();
  if (t.includes('python')) {
    return ['Why is Python indentation important?', 'How does garbage collection work?', 'What are Python generators?', 'Explain decorators with an example.', 'Why are tuples immutable?', 'How does async programming work?'];
  }
  if (t.includes('data structure')) {
    return ['Why is binary search faster?', 'When should I use a linked list?', 'Explain AVL tree rotations.', 'Why does a stack use LIFO?', 'Compare BFS and DFS.'];
  }
  if (t.includes('physics')) {
    return ['What is force?', "Explain Newton's laws.", 'Give me physics formulas.', 'Solve a numerical.', 'Give me exam questions.'];
  }
  if (t.includes('semiconductor')) {
    return ['Why does doping increase conductivity?', 'How does a PN junction work?', 'Why is silicon commonly used?', 'Explain depletion region.', 'What happens when temperature increases?'];
  }
  if (t.includes('thermodynamics')) {
    return ['What is entropy?', "Why can't a heat engine be 100% efficient?", 'Explain the second law.', 'Solve a thermodynamics numerical.', 'What is reversible process?'];
  }
  if (t.includes('c++')) {
    return ['What is C++?', 'C vs C++?', 'Explain classes & objects.', 'Give C++ code for inheritance.', 'Give me C++ MCQs.'];
  }
  if (t.includes('java')) {
    return ['What is Java?', 'Explain OOP in Java.', 'Java Collections Framework?', 'Difference between C++ and Java?', 'Give Java code example.'];
  }
  return ['What is pointers?', 'Explain pointers in simple words.', 'Give me code example.', 'Give me 8-mark exam notes.', 'Give me a quiz.'];
}

function formatChatMessage(text) {
  if (!text) return '';
  let formatted = text
    .replace(/```([\s\S]*?)```/g, '<pre style="background:#1E293B; color:#F8FAFC; padding:0.75rem; border-radius:8px; overflow-x:auto; font-family:monospace; font-size:0.8rem; margin:0.5rem 0;"><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code style="background:#EEF2FF; color:#4F46E5; padding:0.1rem 0.3rem; border-radius:4px; font-family:monospace;">$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:#4F46E5; text-decoration:underline; font-weight:600;">$1 <i class="fa-solid fa-up-right-from-square" style="font-size:0.75rem;"></i></a>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
  return formatted;
}

// 7. ADD / EDIT SUBJECT MODAL FOR TEACHER
function renderAddSubjectModal() {
  if (!state.isAddSubjectModalOpen) return '';

  const isEdit = Boolean(state.editingCourseId);
  const courseToEdit = isEdit ? state.courses.find(c => c.id === state.editingCourseId) : null;

  return `
    <div class="modal-backdrop">
      <div class="modal-card">
        <button class="modal-close-btn" onclick="closeAddSubjectModal()"><i class="fa-solid fa-xmark"></i></button>

        <h2 style="margin-bottom: 0.5rem;">
          <i class="fa-solid ${isEdit ? 'fa-pen-to-square' : 'fa-plus-circle'}" style="color: var(--color-primary);"></i> 
          ${isEdit ? `Edit "${courseToEdit?.title}" & Add Resources` : '+ Add New Subject'}
        </h2>
        <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 1.75rem;">
          ${isEdit ? 'Upload PDF notes, add YouTube video links, or website links. Changes appear immediately on the student page.' : 'Create a new subject complete with PDF notes, roadmap, and learning links.'}
        </p>

        <form onsubmit="handleAddSubjectSubmit(event)">
          <h4 style="margin-bottom: 0.75rem; color: var(--color-primary);">1. Subject Basic Info</h4>
          
          <div class="form-group">
            <label>Subject Name</label>
            <input type="text" id="new-course-title" class="form-input" 
                   value="${courseToEdit?.title || ''}" placeholder="e.g. Machine Learning & AI" required>
          </div>

          <div class="form-group">
            <label>Short Description</label>
            <input type="text" id="new-course-short" class="form-input" 
                   value="${courseToEdit?.shortDescription || ''}" placeholder="Brief summary of what students will learn" required>
          </div>

          <div class="form-group">
            <label>Full Overview</label>
            <textarea id="new-course-overview" class="form-input" rows="3" placeholder="Detailed subject overview..." required>${courseToEdit?.overview || ''}</textarea>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label>Difficulty</label>
              <select id="new-course-difficulty" class="form-input">
                <option value="Beginner" ${courseToEdit?.difficulty === 'Beginner' ? 'selected' : ''}>Beginner</option>
                <option value="Intermediate" ${courseToEdit?.difficulty === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
                <option value="Advanced" ${courseToEdit?.difficulty === 'Advanced' ? 'selected' : ''}>Advanced</option>
              </select>
            </div>
            <div class="form-group">
              <label>Duration</label>
              <input type="text" id="new-course-duration" class="form-input" value="${courseToEdit?.estimatedDuration || '6 Weeks'}">
            </div>
            <div class="form-group">
              <label>Prerequisites</label>
              <input type="text" id="new-course-prereq" class="form-input" value="${courseToEdit?.prerequisites || 'None'}">
            </div>
          </div>

          <h4 style="margin: 1.5rem 0 0.75rem 0; color: #DC2626;"><i class="fa-solid fa-file-pdf"></i> 2. Subject PDF Notes & Study Material</h4>
          <div class="form-group">
            <label>PDF Notes File Name</label>
            <input type="text" id="new-pdf-name" class="form-input" 
                   value="${courseToEdit?.pdfName || ''}" placeholder="e.g. Complete Lecture Notes & Formula Sheet.pdf">
          </div>
          <div class="form-group">
            <label>PDF URL / File Link</label>
            <input type="url" id="new-pdf-url" class="form-input" 
                   value="${courseToEdit?.pdfUrl || ''}" placeholder="https://example.com/notes.pdf">
          </div>

          <h4 style="margin: 1.5rem 0 0.75rem 0; color: #FF0000;"><i class="fa-brands fa-youtube"></i> 3. Add YouTube Video Link</h4>
          <div class="form-group">
            <label>Video Title</label>
            <input type="text" id="video-title" class="form-input" placeholder="e.g. Complete Crash Course Tutorial">
          </div>
          <div class="form-group">
            <label>YouTube URL</label>
            <input type="url" id="video-url" class="form-input" placeholder="https://www.youtube.com/watch?v=...">
          </div>

          <h4 style="margin: 1.5rem 0 0.75rem 0; color: #0EA5E9;"><i class="fa-solid fa-globe"></i> 4. Add Website Resource</h4>
          <div class="form-group">
            <label>Website Name</label>
            <input type="text" id="website-name" class="form-input" placeholder="e.g. Official Documentation Portal">
          </div>
          <div class="form-group">
            <label>Website URL</label>
            <input type="url" id="website-url" class="form-input" placeholder="https://...">
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem;">
            <button type="button" class="btn btn-secondary" onclick="closeAddSubjectModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">
              <i class="fa-solid fa-floppy-disk"></i> ${isEdit ? 'Save Changes & Update Student Page' : 'Create Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

// 8. FOOTER COMPONENT
function renderFooter() {
  return `
    <footer class="footer">
      <div class="footer-container">
        <div>
          <div class="footer-logo">
            <i class="fa-solid fa-lightbulb"></i> CLARITY
          </div>
          <p style="font-size: 0.9rem; line-height: 1.6; max-width: 320px;">
            The modern SaaS educational platform for college students and teachers. Explore roadmaps, PDF notes, video tutorials, websites, and real-time AI assistance.
          </p>
        </div>

        <div class="footer-column">
          <h4>Navigation</h4>
          <ul>
            <li><a href="#" onclick="navigateTo('LANDING')">Home</a></li>
            <li><a href="#" onclick="navigateTo('STUDENT_DASHBOARD')">Courses</a></li>
            <li><a href="#" onclick="scrollToSection('popular-subjects')">Popular Subjects</a></li>
            <li><a href="#" onclick="scrollToSection('features-section')">About CLARITY</a></li>
          </ul>
        </div>

        <div class="footer-column">
          <h4>Portal Roles</h4>
          <ul>
            <li><a href="#" onclick="quickLogin('STUDENT')">Student Portal</a></li>
            <li><a href="#" onclick="quickLogin('TEACHER')">Teacher Portal</a></li>
            <li><a href="#" onclick="openAddSubjectModal()">+ Add Subject</a></li>
            <li><a href="#" onclick="toggleChatbot()">CLARITY AI Assistant</a></li>
          </ul>
        </div>

        <div class="footer-column">
          <h4>Legal & Terms</h4>
          <ul>
            <li><a href="#" onclick="showToast('Privacy policy loaded', 'info')">Privacy Policy</a></li>
            <li><a href="#" onclick="showToast('Terms of service loaded', 'info')">Terms of Use</a></li>
            <li><a href="#" onclick="showToast('Contact support@clarity.com', 'info')">Contact Us</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2026 CLARITY Platform. All rights reserved.</p>
      </div>
    </footer>
  `;
}

// NAVIGATION & STATE LOGIC
function navigateTo(viewName) {
  state.currentView = viewName;
  state.mobileNavOpen = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  renderApp();
}

function scrollToSection(elementId) {
  state.currentView = 'LANDING';
  renderApp();
  setTimeout(() => {
    const el = document.getElementById(elementId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

function openSubject(courseId) {
  const found = state.courses.find(c => c.id === courseId || c.slug === courseId);
  if (found) {
    state.selectedCourse = found;
    state.activeRoadmapIndex = 0;
    state.currentView = 'SUBJECT_DETAIL';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderApp();
  }
}

function selectRoadmapTopic(index) {
  state.activeRoadmapIndex = index;
  renderApp();
}

function setLoginRole(role) {
  state.role = role;
  renderApp();
}

function quickLogin(role) {
  state.role = role;
  const nameInput = document.getElementById('login-name');
  const enteredName = nameInput ? nameInput.value.trim() : '';

  state.currentUser = role === 'TEACHER' 
    ? { id: 'teacher-1', name: enteredName || 'Prof. Sarah Jenkins', email: 'teacher@clarity.com', role: 'TEACHER' }
    : { id: 'student-1', name: enteredName || 'Alex Johnson', email: 'student@clarity.com', role: 'STUDENT' };
  
  localStorage.setItem('clarity_role', role);
  localStorage.setItem('clarity_user', JSON.stringify(state.currentUser));

  showToast(`Welcome ${state.currentUser.name}! Logged in as ${role === 'TEACHER' ? 'Teacher' : 'Student'}`, 'success');
  navigateTo(role === 'TEACHER' ? 'TEACHER_DASHBOARD' : 'STUDENT_DASHBOARD');
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('login-name').value.trim();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success) {
      state.token = data.data.token;
      state.currentUser = { ...data.data.user, name: name || data.data.user.name };
      state.role = data.data.user.role;
      localStorage.setItem('clarity_token', state.token);
      localStorage.setItem('clarity_user', JSON.stringify(state.currentUser));
      localStorage.setItem('clarity_role', state.role);
      showToast(`Welcome back, ${state.currentUser.name}!`, 'success');
      navigateTo(state.role === 'TEACHER' ? 'TEACHER_DASHBOARD' : 'STUDENT_DASHBOARD');
      return;
    }
  } catch (err) {
    console.warn('API error, executing local auth');
  }

  quickLogin(state.role === 'TEACHER' ? 'TEACHER' : 'STUDENT');
}

function logout() {
  state.currentUser = null;
  state.token = null;
  state.role = 'GUEST';
  localStorage.removeItem('clarity_user');
  localStorage.removeItem('clarity_token');
  localStorage.removeItem('clarity_role');
  showToast('Logged out successfully', 'info');
  navigateTo('LANDING');
}

function handleSearchInput(e) {
  state.searchQuery = e.target.value;
  fetchCourses(state.searchQuery).then(() => {
    renderApp();
    const input = document.getElementById('search-bar-input');
    if (input) {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  });
}

function resetSearch() {
  state.searchQuery = '';
  fetchCourses('').then(() => renderApp());
}

function toggleChatbot() {
  state.isChatOpen = !state.isChatOpen;
  renderApp();
}

async function handleChatSubmit(e) {
  e.preventDefault();
  const textInput = document.getElementById('chat-input-text');
  const userQuestion = textInput.value.trim();
  if (!userQuestion) return;

  state.chatMessages.push({ sender: 'USER', text: userQuestion });
  textInput.value = '';

  // Progressive Loading State 1
  state.chatLoadingState = 'Understanding your question...';
  renderApp();

  const currentCourse = state.selectedCourse;

  // Progressive Loading State 2
  setTimeout(() => {
    state.chatLoadingState = 'Searching the web for reliable educational sources...';
    renderApp();
  }, 400);

  // Progressive Loading State 3
  setTimeout(() => {
    state.chatLoadingState = 'Analyzing sources & preparing answer...';
    renderApp();
  }, 800);

  try {
    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token || ''}`,
      },
      body: JSON.stringify({
        question: userQuestion,
        message: userQuestion,
        courseId: currentCourse?.id || null,
        currentTopic: currentCourse?.roadmapItems?.[state.activeRoadmapIndex]?.title || '',
      }),
    });
    const data = await res.json();
    state.chatLoadingState = '';

    if (data.success && data.data.answer) {
      let finalAns = data.data.answer;
      if (Array.isArray(data.data.sources) && data.data.sources.length > 0 && !finalAns.includes('### Sources')) {
        finalAns += '\n\n### Sources\n' + data.data.sources.map((s, i) => `${i + 1}. [${s.title}](${s.url})`).join('\n');
      }

      state.chatMessages.push({ sender: 'AI', text: finalAns });
      renderApp();
      return;
    }
  } catch (err) {
    console.warn('API connection offline, using client-side open-source search');
  }

  // Client Open Source Search Fallback
  const openSourceResult = await fetchClientOpenSourceKnowledge(userQuestion);
  state.chatLoadingState = '';

  let aiText = `### Answer for ${currentCourse?.title || 'Subject'}\n\nUnderstanding **"${userQuestion}"** dynamically using web-search research.`;

  if (openSourceResult) {
    aiText += `\n\n🌐 **Open Source Search Result (${openSourceResult.title}):**\n> "${openSourceResult.extract}"\n\n### Sources\n1. [${openSourceResult.title}](${openSourceResult.url})`;
  }

  state.chatMessages.push({ sender: 'AI', text: aiText });
  renderApp();
}

async function fetchClientOpenSourceKnowledge(query) {
  try {
    const cleanQuery = query.toLowerCase()
      .replace(/what is a?/g, '')
      .replace(/explain/g, '')
      .replace(/in simple words/g, '')
      .trim();

    const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(cleanQuery)}&limit=1&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const title = searchData[1]?.[0];
      const link = searchData[3]?.[0];

      if (title && link) {
        const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
        const summaryRes = await fetch(summaryUrl);
        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          if (summaryData.extract) {
            return {
              title: summaryData.title || title,
              extract: summaryData.extract,
              url: link
            };
          }
        }
      }
    }
  } catch (e) {
    console.warn('Client open source search error:', e);
  }
  return null;
}

function sendPresetChat(questionText) {
  const textInput = document.getElementById('chat-input-text');
  if (textInput) textInput.value = questionText;
  const form = document.querySelector('.chatbot-input-container');
  if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
}

function openAddSubjectModal() {
  if (state.role !== 'TEACHER') {
    quickLogin('TEACHER');
  }
  state.editingCourseId = null;
  state.isAddSubjectModalOpen = true;
  renderApp();
}

function openEditSubjectModal(courseId) {
  state.editingCourseId = courseId;
  state.isAddSubjectModalOpen = true;
  renderApp();
}

function closeAddSubjectModal() {
  state.isAddSubjectModalOpen = false;
  state.editingCourseId = null;
  renderApp();
}

async function handleAddSubjectSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('new-course-title').value;
  const shortDescription = document.getElementById('new-course-short').value;
  const overview = document.getElementById('new-course-overview').value;
  const difficulty = document.getElementById('new-course-difficulty').value;
  const estimatedDuration = document.getElementById('new-course-duration').value;
  const prerequisites = document.getElementById('new-course-prereq').value;

  const pdfName = document.getElementById('new-pdf-name').value.trim();
  const pdfUrl = document.getElementById('new-pdf-url').value.trim();

  const videoTitle = document.getElementById('video-title').value.trim();
  const videoUrl = document.getElementById('video-url').value.trim();

  const websiteName = document.getElementById('website-name').value.trim();
  const websiteUrl = document.getElementById('website-url').value.trim();

  if (state.editingCourseId) {
    const courseIndex = state.courses.findIndex(c => c.id === state.editingCourseId);
    if (courseIndex !== -1) {
      const course = state.courses[courseIndex];
      course.title = title;
      course.shortDescription = shortDescription;
      course.overview = overview;
      course.difficulty = difficulty;
      course.estimatedDuration = estimatedDuration;
      course.prerequisites = prerequisites;

      if (pdfUrl) {
        course.pdfUrl = pdfUrl;
        course.pdfName = pdfName || `${title} Study Notes.pdf`;
      }

      if (videoUrl) {
        if (!course.videos) course.videos = [];
        course.videos.push({
          id: `v-${Date.now()}`,
          title: videoTitle || `${title} Recommended Video`,
          youtubeUrl: videoUrl,
          thumbnailUrl: `https://img.youtube.com/vi/${getYouTubeId(videoUrl)}/mqdefault.jpg`,
          channelName: 'Instructor Recommended'
        });
      }

      if (websiteUrl) {
        if (!course.websites) course.websites = [];
        course.websites.push({
          id: `w-${Date.now()}`,
          name: websiteName || `${title} Portal`,
          url: websiteUrl,
          logoUrl: 'fa-globe',
          description: 'Added by subject teacher'
        });
      }

      try {
        await fetch(`${API_BASE_URL}/courses/${course.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.token || ''}`
          },
          body: JSON.stringify({
            title,
            shortDescription,
            overview,
            difficulty,
            estimatedDuration,
            prerequisites,
            pdfUrl: course.pdfUrl,
            pdfName: course.pdfName,
            videos: videoUrl ? [{ title: videoTitle || `${title} Video`, youtubeUrl: videoUrl }] : [],
            websites: websiteUrl ? [{ name: websiteName || `${title} Site`, url: websiteUrl }] : []
          })
        });
      } catch (err) {
        console.warn('API sync offline, local state updated');
      }

      showToast(`Subject "${title}" updated! Changes are now live on the Student page.`, 'success');
    }
  } else {
    const newCourse = {
      id: `custom-${Date.now()}`,
      title,
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      shortDescription,
      overview,
      difficulty,
      estimatedDuration,
      prerequisites,
      pdfUrl: pdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      pdfName: pdfName || `${title} Master Lecture Notes.pdf`,
      createdBy: state.currentUser?.id || 'teacher-1',
      roadmapItems: [
        { id: `r1-${Date.now()}`, title: 'Topic 1: Fundamentals', description: 'Core introduction' },
        { id: `r2-${Date.now()}`, title: 'Topic 2: Applied Concepts', description: 'Practical implementations' },
        { id: `r3-${Date.now()}`, title: 'Topic 3: Advanced Projects', description: 'Real-world problem solving' }
      ],
      subtopics: [
        { id: `s1-${Date.now()}`, title: `${title} Fundamentals`, description: shortDescription, content: overview, difficulty }
      ],
      videos: videoUrl ? [{ id: `v-${Date.now()}`, title: videoTitle || `${title} Lecture`, youtubeUrl: videoUrl, thumbnailUrl: `https://img.youtube.com/vi/${getYouTubeId(videoUrl)}/mqdefault.jpg`, channelName: 'CLARITY Instructor' }] : [],
      websites: websiteUrl ? [{ id: `w-${Date.now()}`, name: websiteName || `${title} Reference`, url: websiteUrl, logoUrl: 'fa-globe', description: 'Recommended portal' }] : []
    };

    state.courses.unshift(newCourse);
    state.filteredCourses.unshift(newCourse);

    try {
      await fetch(`${API_BASE_URL}/teacher/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token || ''}`
        },
        body: JSON.stringify({
          title,
          shortDescription,
          overview,
          difficulty,
          estimatedDuration,
          prerequisites,
          pdfUrl: newCourse.pdfUrl,
          pdfName: newCourse.pdfName,
          roadmap: newCourse.roadmapItems,
          subtopics: newCourse.subtopics,
          videos: newCourse.videos,
          websites: newCourse.websites
        })
      });
    } catch (err) {
      console.warn('API sync offline, created locally');
    }

    showToast(`Subject "${title}" created successfully! Visible on Student page.`, 'success');
  }

  closeAddSubjectModal();
  navigateTo('TEACHER_DASHBOARD');
}

function deleteCourseConfirm(courseId) {
  if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
    state.courses = state.courses.filter(c => c.id !== courseId);
    state.filteredCourses = state.filteredCourses.filter(c => c.id !== courseId);
    showToast('Course deleted successfully', 'success');
    renderApp();
  }
}

function openVideoModal(url, title) {
  const modal = document.getElementById('video-modal');
  const wrapper = document.getElementById('video-iframe-wrapper');
  const titleEl = document.getElementById('video-modal-title');
  if (!modal || !wrapper) return;

  const embedId = getYouTubeId(url);
  titleEl.innerText = title;
  wrapper.innerHTML = `<iframe src="https://www.youtube.com/embed/${embedId}?autoplay=1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  modal.classList.remove('hidden');
}

function closeVideoModal() {
  const modal = document.getElementById('video-modal');
  const wrapper = document.getElementById('video-iframe-wrapper');
  if (modal && wrapper) {
    wrapper.innerHTML = '';
    modal.classList.add('hidden');
  }
}

function toggleMobileNav() {
  state.mobileNavOpen = !state.mobileNavOpen;
  renderApp();
}

function getSubjectIcon(title) {
  const t = title.toLowerCase();
  if (t.includes('c++')) return 'fa-brands fa-cpp';
  if (t.includes('python')) return 'fa-brands fa-python';
  if (t.includes('java')) return 'fa-brands fa-java';
  if (t.includes('c programming') || t.includes(' c ')) return 'fa-solid fa-code';
  if (t.includes('data structure')) return 'fa-solid fa-network-wired';
  if (t.includes('physics')) return 'fa-solid fa-atom';
  if (t.includes('semiconductor')) return 'fa-solid fa-microchip';
  if (t.includes('thermodynamics')) return 'fa-solid fa-fire-flame-curved';
  return 'fa-solid fa-book-bookmark';
}

function getYouTubeId(url) {
  if (!url) return 'dQw4w9WgXcQ';
  const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
  return match && match[2].length === 11 ? match[2] : 'dQw4w9WgXcQ';
}

function attachEventListeners() {}
