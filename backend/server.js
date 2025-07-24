
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const adminUserRoutes = require('./routes/adminUser');
const jobRoutes = require('./routes/job');
const shortlistRoutes = require('./routes/shortlist');
const adminUserActivityLogRoutes = require('./routes/adminUserActivityLog');
const interviewRoutes = require('./routes/interview');
const sessionRoutes = require('./routes/session');
const shortlistCandidateRoutes = require('./routes/shortlistCandidate');
const reportRoutes = require('./routes/report');
const hrListRoutes = require('./routes/hrList');
const hrMetricsRoutes = require('./routes/hrMetrics');
const exportHistoryRoutes = require('./routes/exportHistory');
const db = require('./config/db');
const usersRoutes = require('./routes/users');
const jobPostingRoutes = require('./routes/jobPosting');
const postJobRoutes = require('./routes/postJob');
const contentManagementRoutes = require('./routes/contentManagement');
const contentJobsRoutes = require('./routes/contentJobs');
const contentNotificationsRoutes = require('./routes/contentNotifications');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());


// ✅ Serve uploads directory as static files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Test DB connection
app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    res.json({ message: 'DB is working', result: rows[0].result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Mount Auth Routes
app.use('/api/auth', authRoutes);
// Mount Admin User Routes
app.use('/api/admin-users', adminUserRoutes);
// Mount Job Management Routes
app.use('/api/jobs-management', jobRoutes);
// Mount Shortlist Routes
app.use('/api/shortlist', shortlistRoutes);
// Mount Admin User Activity Log Routes
app.use('/api/admin-user-activity-log', adminUserActivityLogRoutes);
// Mount Session Routes
app.use('/api/sessions', sessionRoutes);
// Mount Shortlist Candidate Routes
app.use('/api/shortlist-candidates', shortlistCandidateRoutes);
// Mount Interview Routes
console.log('Mounting /api/interviews route...');
app.use('/api/interviews', interviewRoutes);
// Mount Admin Report Management Routes
app.use('/api/reports', reportRoutes);
app.use('/api/hr-list', hrListRoutes);
app.use('/api/hr-metrics', hrMetricsRoutes);
app.use('/api/export-history', exportHistoryRoutes);

// Mount Users Routes
app.use('/api/users', usersRoutes);

// Mount Job Postings Routes
app.use('/api/job-postings', jobPostingRoutes);

// Mount legacy Post Job table route
app.use('/api/post-job', postJobRoutes);

// Mount Content Management Routes
app.use('/api/content', contentManagementRoutes);

// Mount Content Jobs and Notifications Routes
app.use('/api/content-jobs', contentJobsRoutes);
app.use('/api/content-notifications', contentNotificationsRoutes);

// ✅ Optional root route
app.get('/', (req, res) => {
  res.send('✅ Backend is running...');
});


// (Removed duplicate route and middleware mounting)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
