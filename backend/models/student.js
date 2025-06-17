import mongoose from 'mongoose';


// major changes in models
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  codeforcesHandle: { type: String, required: true, unique: true },
  currentRating: { type: Number, default: 0 },
  maxRating: { type: Number, default: 0 },
  lastSynced: Date,
  cfStats: {
    contestHistory: [
      {
        contestId: Number,
        contestName: String,
        rank: Number,
        oldRating: Number,
        newRating: Number,
        ratingChange: Number,
        contestDate: Date,
        problemsUnsolved: Number,
      },
    ],
    solvedProblems: [
      {
        problemId: String,
        name: String,
        rating: Number,
        tags: [String],
        solvedAt: Date,
      },
    ],
    mostDifficultProblem: {
      problemId: String,
      name: String,
      rating: Number,
    },
    totalSolved: Number,
    avgRating: Number,
    avgProblemsPerDay: Number,
    ratingBuckets: { type: Map, of: Number },
    heatmap: [{ date: String, count: Number }],
    problemStatsByDays: {
      d7: {
        totalSolved: Number,
        avgRating: Number,
        avgProblemsPerDay: Number,
        mostDifficultProblem: Object,
        ratingBuckets: { type: Map, of: Number }
      },
      d30: {
        totalSolved: Number,
        avgRating: Number,
        avgProblemsPerDay: Number,
        mostDifficultProblem: Object,
        ratingBuckets: { type: Map, of: Number }
      },
      d90: {
        totalSolved: Number,
        avgRating: Number,
        avgProblemsPerDay: Number,
        mostDifficultProblem: Object,
        ratingBuckets: { type: Map, of: Number }
      },
    },
  },
  emailReminders: {
    disabled: { type: Boolean, default: false },
    reminderCount: { type: Number, default: 0 },
  },
});

export const Students = mongoose.model('Students', studentSchema);
