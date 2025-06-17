import axios from 'axios';
import { Students } from '../models/student.js';
import { Parser } from 'json2csv';

// Add Student
const addStudent = async (req, res) => {
  try {
    const { name, email, phone, codeforcesHandle } = req.body;
    if (!name || !email || !codeforcesHandle) {
      return res.status(400).json({ message: 'Name, Email & CF Handle required' });
    }

    const existing = await Students.findOne({ codeforcesHandle });
    if (existing) return res.status(400).json({ message: 'Student with this CF handle already exists' });

    const cfUrl = `https://codeforces.com/api/user.info?handles=${codeforcesHandle}`;
    const { data } = await axios.get(cfUrl);

    if (data.status !== 'OK') {
      return res.status(400).json({ message: 'Invalid Codeforces handle' });
    }

    const cfUser = data.result[0];

    const student = await Students.create({
      name,
      email,
      phone,
      codeforcesHandle,
      currentRating: cfUser.rating || 0,
      maxRating: cfUser.maxRating || 0,
      lastSynced: new Date(),
    });

    return res.status(201).json({ message: 'Student added successfully', student });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get All Students
const getAllStudents = async (req, res) => {
  try {
    const students = await Students.find();
    return res.status(200).json({ students });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Delete Student
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Students.findByIdAndDelete(id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    return res.status(200).json({ message: 'Student deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update Student
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, codeforcesHandle } = req.body;

    const student = await Students.findById(id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const oldHandle = student.codeforcesHandle;

    student.name = name ?? student.name;
    student.email = email ?? student.email;
    student.phone = phone ?? student.phone;

    // Handle update logic
    if (codeforcesHandle && codeforcesHandle !== oldHandle) {
      // Check if new handle is valid
      const { data } = await axios.get(`https://codeforces.com/api/user.info?handles=${codeforcesHandle}`);
      if (data.status !== 'OK') {
        return res.status(400).json({ message: 'Invalid Codeforces handle' });
      }

      student.codeforcesHandle = codeforcesHandle;
      student.cfStats = undefined; // Clear old data
      student.lastSynced = undefined;
    }

    await student.save();

    
    if (codeforcesHandle && codeforcesHandle !== oldHandle) {
     
      await axios.post(`http://localhost:4000/api/v1/student/sync/${codeforcesHandle}`);
    }

    return res.status(200).json({ message: 'Student updated successfully', student });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};


// Download CSV
const downloadStudentsCSV = async (req, res) => {
  try {
    const students = await Students.find();

    const fields = [
      'name',
      'email',
      'phone',
      'codeforcesHandle',
      'currentRating',
      'maxRating',
      'lastSynced'
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(students);

    res.header('Content-Type', 'text/csv');
    res.attachment('students.csv');
    return res.send(csv);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to download CSV' });
  }
};

// Helper
const getDaysAgoTimestamp = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.getTime() / 1000;
};

const syncStudentData = async (req, res) => {
  const { handle } = req.params;

  try {
    const student = await Students.findOne({ codeforcesHandle: handle });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // If already , return from DB
    if (student.cfStats && student.cfStats.contestHistory?.length > 0) {
      return res.status(200).json({ message: 'Data from DB', student });
    }

    // Fetch from Codeforces
    const [userInfoRes, ratingRes, submissionsRes] = await Promise.all([
      axios.get(`https://codeforces.com/api/user.info?handles=${handle}`),
      axios.get(`https://codeforces.com/api/user.rating?handle=${handle}`),
      axios.get(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=10000`),
    ]);

    const userInfo = userInfoRes.data.result[0];

    const contestHistory = ratingRes.data.result.map(c => ({
      contestId: c.contestId,
      contestName: c.contestName,
      rank: c.rank,
      oldRating: c.oldRating,
      newRating: c.newRating,
      ratingChange: c.newRating - c.oldRating,
      contestDate: new Date(c.ratingUpdateTimeSeconds * 1000),
      problemsUnsolved: 0,
    }));

    const submissions = submissionsRes.data.result;
    const solvedSet = new Set();
    const problemsMap = new Map();
    const heatmap = {};

    submissions.forEach(sub => {
      if (sub.verdict === 'OK') {
        const key = `${sub.problem.contestId}-${sub.problem.index}`;
        if (!solvedSet.has(key)) {
          solvedSet.add(key);

          const date = new Date(sub.creationTimeSeconds * 1000);
          const day = date.toISOString().split('T')[0];
          heatmap[day] = (heatmap[day] || 0) + 1;

          problemsMap.set(key, {
            problemId: key,
            name: sub.problem.name,
            rating: sub.problem.rating || 0,
            tags: sub.problem.tags || [],
            solvedAt: date,
          });
        }
      }
    });

    const solvedProblems = Array.from(problemsMap.values());
    const totalSolved = solvedProblems.length;
    const avgRating = totalSolved > 0
      ? solvedProblems.reduce((sum, p) => sum + (p.rating || 0), 0) / totalSolved
      : 0;

    const mostDifficultProblem = solvedProblems.reduce(
      (max, p) => (!max || p.rating > max.rating) ? p : max,
      null
    );

    const ratingBuckets = {};
    solvedProblems.forEach(p => {
      const bucket = Math.floor((p.rating || 0) / 100) * 100;
      ratingBuckets[bucket] = (ratingBuckets[bucket] || 0) + 1;
    });

    const heatmapArray = Object.entries(heatmap).map(([date, count]) => ({ date, count }));

    // === Compute stats for 7, 30, 90 days ===
    const computeStatsForDays = (days) => {
      const cutoff = getDaysAgoTimestamp(days);
      const filtered = solvedProblems.filter(p => p.solvedAt.getTime() / 1000 >= cutoff);

      const total = filtered.length;
      const avgRating = total > 0
        ? filtered.reduce((sum, p) => sum + (p.rating || 0), 0) / total
        : 0;
      const avgPerDay = Number((total / days).toFixed(2));

      const ratingBuckets = {};
      let mostDifficult = null;

      filtered.forEach(p => {
        const bucket = Math.floor((p.rating || 0) / 100) * 100;
        ratingBuckets[bucket] = (ratingBuckets[bucket] || 0) + 1;

        if (!mostDifficult || p.rating > mostDifficult.rating) {
          mostDifficult = p;
        }
      });

      return {
        mostDifficultProblem: mostDifficult,
        totalSolved: total,
        avgRating: Math.round(avgRating),
        avgProblemsPerDay: avgPerDay,
        ratingBuckets,
      };
    };

    const problemStatsByDays = {
      d7: computeStatsForDays(7),
      d30: computeStatsForDays(30),
      d90: computeStatsForDays(90),
    };

    // Update student doc
    student.currentRating = userInfo.rating || 0;
    student.maxRating = userInfo.maxRating || 0;
    student.lastSynced = new Date();
    student.cfStats = {
      contestHistory,
      solvedProblems,
      mostDifficultProblem,
      totalSolved,
      avgRating: Math.round(avgRating),
      avgProblemsPerDay: Number((totalSolved / 90).toFixed(2)), // overall avg
      ratingBuckets,
      heatmap: heatmapArray,
      problemStatsByDays,
    };

    await student.save();

    return res.status(200).json({ message: 'Data synced from Codeforces', student });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Sync failed' });
  }
};


export {
  addStudent,
  getAllStudents,
  deleteStudent,
  updateStudent,
  downloadStudentsCSV,
  syncStudentData
};
