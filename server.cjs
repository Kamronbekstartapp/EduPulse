const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:Kamronbek2012@localhost:5432/edupulse',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Barcha jadvallarni yaratish
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS school_admins (
        id SERIAL PRIMARY KEY,
        admin_id VARCHAR(50) UNIQUE,
        name TEXT,
        title TEXT,
        category TEXT,
        phone TEXT,
        experience TEXT
      );
      CREATE TABLE IF NOT EXISTS teachers (
        id SERIAL PRIMARY KEY,
        teacher_id VARCHAR(50) UNIQUE,
        full_name TEXT,
        phone TEXT,
        teacher_type TEXT,
        assigned_class TEXT,
        subject TEXT
      );
      CREATE TABLE IF NOT EXISTS teacher_accounts (
        id SERIAL PRIMARY KEY,
        acc_id VARCHAR(50) UNIQUE,
        full_name TEXT,
        username VARCHAR(100) UNIQUE,
        password TEXT,
        position TEXT,
        can_download_report BOOLEAN DEFAULT false
      );
      CREATE TABLE IF NOT EXISTS classes (
        id SERIAL PRIMARY KEY,
        class_id VARCHAR(50) UNIQUE,
        name TEXT,
        teacher TEXT,
        teacher_phone TEXT
      );
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(50) UNIQUE,
        full_name TEXT,
        grade TEXT,
        phone TEXT
      );
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        record_key VARCHAR(100) UNIQUE,
        data JSONB
      );
      CREATE TABLE IF NOT EXISTS timetable (
        id SERIAL PRIMARY KEY,
        schedule_id VARCHAR(50) UNIQUE,
        day_of_week TEXT,
        class_id TEXT,
        subject TEXT,
        teacher_name TEXT,
        start_time TEXT,
        end_time TEXT,
        lesson_number INT
      );
      CREATE TABLE IF NOT EXISTS book_notebook_records (
        id SERIAL PRIMARY KEY,
        record_key VARCHAR(150) UNIQUE,
        data JSONB
      );
    `);
    console.log("Barcha jadvallar bazada muvaffaqiyatli yaratildi!");
  } catch (err) {
    console.error("DB Init Error:", err);
  }
};
initDb();

// --- 1. MA'MURIYAT API ---
app.get('/api/admins', async (req, res) => {
  const result = await pool.query('SELECT * FROM school_admins ORDER BY id ASC');
  res.json(result.rows);
});
app.post('/api/admins', async (req, res) => {
  const { admin_id, name, title, category, phone, experience } = req.body;
  const result = await pool.query(
    'INSERT INTO school_admins (admin_id, name, title, category, phone, experience) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (admin_id) DO UPDATE SET name=$2, title=$3, category=$4, phone=$5, experience=$6 RETURNING *',
    [admin_id, name, title, category, phone, experience]
  );
  res.json(result.rows[0]);
});
app.delete('/api/admins/:id', async (req, res) => {
  await pool.query('DELETE FROM school_admins WHERE admin_id = $1', [req.params.id]);
  res.json({ success: true });
});

// --- 2. O'QITUVCHILAR API ---
app.get('/api/teachers', async (req, res) => {
  const result = await pool.query('SELECT * FROM teachers ORDER BY id ASC');
  res.json(result.rows);
});
app.post('/api/teachers', async (req, res) => {
  const { teacher_id, full_name, phone, teacher_type, assigned_class, subject } = req.body;
  const result = await pool.query(
    'INSERT INTO teachers (teacher_id, full_name, phone, teacher_type, assigned_class, subject) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (teacher_id) DO UPDATE SET full_name=$2, phone=$3, teacher_type=$4, assigned_class=$5, subject=$6 RETURNING *',
    [teacher_id, full_name, phone, teacher_type, assigned_class, subject]
  );
  res.json(result.rows[0]);
});
app.delete('/api/teachers/:id', async (req, res) => {
  await pool.query('DELETE FROM teachers WHERE teacher_id = $1', [req.params.id]);
  res.json({ success: true });
});

// --- 3. O'QITUVCHI AKKAUNTLARI API ---
app.get('/api/teacher-accounts', async (req, res) => {
  const result = await pool.query('SELECT * FROM teacher_accounts ORDER BY id ASC');
  res.json(result.rows);
});
app.post('/api/teacher-accounts', async (req, res) => {
  const { acc_id, full_name, username, password, position, can_download_report } = req.body;
  const result = await pool.query(
    'INSERT INTO teacher_accounts (acc_id, full_name, username, password, position, can_download_report) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (acc_id) DO UPDATE SET full_name=$2, username=$3, password=$4, position=$5, can_download_report=$6 RETURNING *',
    [acc_id, full_name, username, password, position, can_download_report]
  );
  res.json(result.rows[0]);
});
app.delete('/api/teacher-accounts/:id', async (req, res) => {
  await pool.query('DELETE FROM teacher_accounts WHERE acc_id = $1', [req.params.id]);
  res.json({ success: true });
});

// --- 4. O'QUVCHILAR API ---
app.get('/api/students', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/students', async (req, res) => {
  const { student_id, full_name, grade, phone } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO students (student_id, full_name, grade, phone) VALUES ($1, $2, $3, $4) ON CONFLICT (student_id) DO UPDATE SET full_name=$2, grade=$3, phone=$4 RETURNING *',
      [student_id, full_name, grade, phone]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- 5. DARS JADVALI (TIMETABLE) API ---
app.get('/api/timetable', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM timetable ORDER BY lesson_number ASC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/timetable', async (req, res) => {
  const { schedule_id, day_of_week, class_id, subject, teacher_name, start_time, end_time, lesson_number } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO timetable (schedule_id, day_of_week, class_id, subject, teacher_name, start_time, end_time, lesson_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (schedule_id) DO UPDATE 
       SET day_of_week=$2, class_id=$3, subject=$4, teacher_name=$5, start_time=$6, end_time=$7, lesson_number=$8
       RETURNING *`,
      [schedule_id, day_of_week, class_id, subject, teacher_name, start_time, end_time, lesson_number]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/timetable/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM timetable WHERE schedule_id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- 6. KITOB VA DAFTAR NAZORATI API ---
app.get('/api/book-records', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM book_notebook_records');
    const recordsObj = {};
    result.rows.forEach(row => {
      recordsObj[row.record_key] = row.data;
    });
    res.json(recordsObj);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/book-records', async (req, res) => {
  const { record_key, data } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO book_notebook_records (record_key, data)
       VALUES ($1, $2)
       ON CONFLICT (record_key) DO UPDATE 
       SET data = $2
       RETURNING *`,
      [record_key, JSON.stringify(data)]
    );
  
   res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- 7. FRONTEND (REACT) FAYLLARINI ULASH (Cannot GET / xatoligini oldini olish uchun) ---
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server ${PORT}-portda ishlamoqda!`));
