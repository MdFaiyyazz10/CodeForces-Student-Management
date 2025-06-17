import axios from 'axios';
import { Students } from '../models/student.js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, '../config/config.env')
});

const getDaysAgoTimestamp = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.getTime() / 1000;
};

export const syncStudentDataFromCodeforces = async (handle) => {
  try {
    const student = await Students.findOne({ codeforcesHandle: handle });
    if (!student) throw new Error('Student not found');


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

    student.currentRating = userInfo.rating || 0;
    student.maxRating = userInfo.maxRating || 0;
    student.lastSynced = new Date();
    student.cfStats = {
      contestHistory,
      solvedProblems,
      mostDifficultProblem,
      totalSolved,
      avgRating: Math.round(avgRating),
      avgProblemsPerDay: Number((totalSolved / 90).toFixed(2)),
      ratingBuckets,
      heatmap: heatmapArray,
      problemStatsByDays,
    };

    await student.save();

    return { from: 'cf', student };
  } catch (err) {
    console.error(`Sync failed for ${handle}:`, err.message);
    throw err;
  }
};
