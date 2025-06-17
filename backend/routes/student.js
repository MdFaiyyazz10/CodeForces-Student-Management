import express from 'express';
import {
  addStudent,
  deleteStudent,
  getAllStudents,
  updateStudent,
  downloadStudentsCSV,
  syncStudentData
} from '../controllers/student.js';

const router = express.Router();

router.post('/add', addStudent); // add 
router.get('/get-all-students', getAllStudents);
router.delete('/delete/:id', deleteStudent);       // 👈 Delete route
router.put('/update/:id', updateStudent);   // updatde
router.get('/download-csv', downloadStudentsCSV);



// Sync Codeforces data for a specific student (by CF username)
router.post('/sync/:handle', syncStudentData);

export default router;
