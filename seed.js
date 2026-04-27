require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'productivity_hub';

async function seed() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB at', uri, 'database:', dbName);

    const db = client.db(dbName);

    console.log('Clearing existing collections...');
    await db.collection('users').deleteMany({});
    await db.collection('projects').deleteMany({});
    await db.collection('tasks').deleteMany({});
    await db.collection('notes').deleteMany({});

    // ── Users ──────────────────────────────────────────────
    const hash = await bcrypt.hash('password123', 10);

    const userResult = await db.collection('users').insertMany([
      {
        email: 'john@example.com',
        passwordHash: hash,
        name: 'John Doe',
        createdAt: new Date()
      },
      {
        email: 'jane@example.com',
        passwordHash: hash,
        name: 'Jane Smith',
        createdAt: new Date()
      }
    ]);
    console.log(`Inserted ${userResult.insertedCount} users`);

    const johnId = userResult.insertedIds[0];
    const janeId = userResult.insertedIds[1];

    // ── Projects ───────────────────────────────────────────
    const projectResult = await db.collection('projects').insertMany([
      {
        ownerId: johnId,
        name: 'Website Redesign',
        description: 'Complete company website overhaul with modern design',
        archived: false,
        createdAt: new Date('2024-01-10')
      },
      {
        ownerId: johnId,
        name: 'Mobile App Development',
        description: 'Build React Native mobile app for iOS and Android',
        archived: false,
        createdAt: new Date('2024-02-05')
      },
      {
        ownerId: johnId,
        name: 'Marketing Campaign',
        description: 'Q4 digital marketing campaign',
        archived: true,
        createdAt: new Date('2023-06-01')
      },
      {
        ownerId: janeId,
        name: 'Database Migration',
        description: 'Migrate from SQL to MongoDB Atlas',
        archived: false,
        createdAt: new Date('2024-01-20')
      }
    ]);
    console.log(`Inserted ${projectResult.insertedCount} projects`);

    const websiteId    = projectResult.insertedIds[0];
    const appId        = projectResult.insertedIds[1];
    const marketingId  = projectResult.insertedIds[2];
    const migrationId  = projectResult.insertedIds[3];

    // ── Tasks ──────────────────────────────────────────────
    const taskResult = await db.collection('tasks').insertMany([
      {
        ownerId: johnId,
        projectId: websiteId,
        title: 'Design homepage mockup',
        description: 'Create high-fidelity designs for homepage',
        status: 'done',
        priority: 5,
        tags: ['design', 'frontend', 'ui/ux'],
        subtasks: [
          { title: 'Research competitors', done: true },
          { title: 'Create wireframes', done: true },
          { title: 'Get client approval', done: true }
        ],
        createdAt: new Date('2024-01-12')
      },
      {
        ownerId: johnId,
        projectId: websiteId,
        title: 'Implement responsive navigation',
        description: 'Mobile-first navigation with hamburger menu',
        status: 'in-progress',
        priority: 4,
        tags: ['frontend', 'responsive', 'css'],
        subtasks: [
          { title: 'HTML structure', done: true },
          { title: 'CSS styling', done: false },
          { title: 'JavaScript interactivity', done: false }
        ],
        dueDate: new Date('2026-06-01'),   // optional field — schema flexibility
        createdAt: new Date('2024-01-15')
      },
      {
        ownerId: johnId,
        projectId: appId,
        title: 'Setup authentication API',
        description: 'JWT authentication endpoints for mobile app',
        status: 'todo',
        priority: 5,
        tags: ['backend', 'security', 'api'],
        subtasks: [
          { title: 'Design database schema', done: false },
          { title: 'Implement JWT', done: false },
          { title: 'Add rate limiting', done: false }
        ],
        createdAt: new Date('2024-02-06')
      },
      {
        ownerId: johnId,
        projectId: appId,
        title: 'Write unit tests',
        description: 'Test user service and authentication',
        status: 'todo',
        priority: 3,
        tags: ['testing', 'backend'],
        subtasks: [
          { title: 'Setup Jest', done: false },
          { title: 'Write user tests', done: false }
        ],
        dueDate: new Date('2026-07-01'),   // optional field — schema flexibility
        createdAt: new Date('2024-02-10')
      },
      {
        ownerId: johnId,
        projectId: marketingId,
        title: 'Create social media posts',
        description: 'Schedule Instagram and Facebook posts',
        status: 'done',
        priority: 4,
        tags: ['marketing', 'social', 'content'],
        subtasks: [
          { title: 'Design graphics', done: true },
          { title: 'Write captions', done: true },
          { title: 'Schedule posts', done: true }
        ],
        createdAt: new Date('2024-01-22')
      }
    ]);
    console.log(`Inserted ${taskResult.insertedCount} tasks`);

    // ── Notes ──────────────────────────────────────────────
    const noteResult = await db.collection('notes').insertMany([
      {
        ownerId: johnId,
        projectId: websiteId,
        title: 'Meeting notes - Design review',
        body: 'Client wants blue theme, more whitespace, and larger buttons',
        tags: ['meeting', 'design', 'feedback'],
        createdAt: new Date('2024-01-13')
      },
      {
        ownerId: johnId,
        projectId: appId,
        title: 'API documentation',
        body: 'Endpoints: /auth/login, /auth/register, /auth/logout',
        tags: ['backend', 'docs', 'api'],
        createdAt: new Date('2024-02-07')
      },
      {
        ownerId: johnId,
        // No projectId — standalone note (schema flexibility)
        title: 'Marketing ideas',
        body: 'Consider TikTok campaign for younger audience',
        tags: ['marketing', 'ideas', 'social'],
        createdAt: new Date('2024-02-10')
      },
      {
        ownerId: janeId,
        // No projectId — standalone note
        title: 'MongoDB tips',
        body: 'Use indexes for better performance, avoid large embedded arrays',
        tags: ['database', 'tips', 'performance'],
        createdAt: new Date('2024-01-23')
      },
      {
        ownerId: janeId,
        projectId: migrationId,
        title: 'Standup notes - Sprint 3',
        body: 'Complete authentication this week, start testing next week',
        tags: ['meeting', 'agile', 'sprint'],
        pinned: true,                      // optional field — schema flexibility
        createdAt: new Date('2024-01-25')
      }
    ]);
    console.log(`Inserted ${noteResult.insertedCount} notes`);

    console.log('\n Seeding completed successfully!');
    console.log('Login with:');
    console.log('  john@example.com / password123');
    console.log('  jane@example.com / password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;
