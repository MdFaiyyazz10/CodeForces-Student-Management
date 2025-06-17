import cron from 'node-cron';
import { Students } from '../models/student.js';
import { syncStudentDataFromCodeforces } from '../services/syncStudent.js';
import { sendInactivityEmail } from '../utils/mail.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, '../config/config.env')
});

const isInactive = (heatmap) => {
  const last7 = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  });

  const dates = heatmap.map(h => h.date);
  return !last7.some(d => dates.includes(d));
};

// Runs every day at 2 AM
cron.schedule('0 1 * * *', async () => {
  console.log('Cron job started...');

  try {
    const students = await Students.find({ codeforcesHandle: { $ne: null } });

    for (const student of students) {
      try {
        const syncstatus = await syncStudentDataFromCodeforces(student.codeforcesHandle);
        // console.log("CRON JOB SYNC STATUS" , syncstatus)

        const updated = await Students.findById(student._id);
        const heatmap = updated.cfStats?.heatmap || [];

        if (isInactive(heatmap)) {
          if (!updated.inactivityMailSent) {
            await sendInactivityEmail(updated.email, updated.name, updated.codeforcesHandle);
            updated.inactivityMailSent = true;
            await updated.save();
            console.log(`Mail sent to inactive student: ${updated.name}`);
          }
        } else {
          if (updated.inactivityMailSent) {
            updated.inactivityMailSent = false;
            await updated.save();
            console.log(`${updated.name} is now active again`);
          }
        }

      } catch (err) {
        console.error(` Error for ${student.name}:`, err.message);
      }
    }

    console.log('Cron job finished');
  } catch (err) {
    console.error('Cron job failed:', err.message);
  }
});
