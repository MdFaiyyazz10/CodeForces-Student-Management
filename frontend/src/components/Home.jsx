// src/pages/Home.jsx

import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Stack,
} from "@mui/material";
import AddStudentForm from "../components/AddStudentForm";
import {Add , Visibility , Edit , Delete} from '@mui/icons-material'
import axios from "axios";
import { backendUrl } from "../App";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useColorMode } from "./ThemeProvider";


// this is home
const Home = () => {
  const [openForm, setOpenForm] = useState(false);
  const [allStudents, setAllStudents] = useState([]);

  const [editMode, setEditMode] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

const navigate = useNavigate();

  const fetchAllStudents = async () => {
    try {
      const res = await axios.get(`${backendUrl}/student/get-all-students`);
      setAllStudents(res.data.students);
      // console.log(res.data)
    } catch (error) {
      console.log("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchAllStudents();
  }, []);

  const handleDeleteStudent = async (id) => {
    try {
      const res = await axios.delete(`${backendUrl}/student/delete/${id}`);
      // alert("Student Deleted Successfully");
      toast.success(res.data.message)
      fetchAllStudents();
    } catch (error) {
      toast.error(error.res.data.message)
      
    }
  };

  const handleUpdateUser = (student) => {
    setSelectedStudent(student);
    setEditMode(true);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditMode(false);
    setSelectedStudent(null);
  };

const handleNavigate = (id) => {
  navigate(`/student/${id}`);
};

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Student Dashboard</Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => {
              setEditMode(false);
              setSelectedStudent(null);
              setOpenForm(true);
            }}
          >
            Add Student
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              window.open(`${backendUrl}/student/download-csv`, "_blank");
            }}
          >
            Download CSV
          </Button>
        </Stack>
      </Stack>


{
  allStudents.length === 0 ? (
   <Typography variant="h6" align="center" sx={{ py: 6, color: 'text.secondary' }}>
    😔 No students found. Add a student to get started!
  </Typography>
  ) : (
      <Paper sx={{ maxHeight: 500, overflow: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <b>Name</b>
              </TableCell>
              <TableCell>
                <b>Email</b>
              </TableCell>
              <TableCell>
                <b>Phone</b>
              </TableCell>
              <TableCell>
                <b>Handle</b>
              </TableCell>
              <TableCell>
                <b>Rating</b>
              </TableCell>
              <TableCell>
                <b>Max Rating</b>
              </TableCell>
              <TableCell>
                <b>Actions</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allStudents.map((student) => (
              <TableRow key={student._id}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.phone}</TableCell>
                <TableCell>{student.codeforcesHandle}</TableCell>
                <TableCell>{student.currentRating}</TableCell>
                <TableCell>{student.maxRating}</TableCell>
                <TableCell>
                  <IconButton color="primary" title="View" onClick={() => handleNavigate(student.codeforcesHandle)}>
                    <Visibility />
                  </IconButton>
                  <IconButton
                    color="secondary"
                    title="Edit"
                    onClick={() => handleUpdateUser(student)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    title="Delete"
                    onClick={() => handleDeleteStudent(student._id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
)}

      {/* Add/Edit Student Form Dialog */}
      <AddStudentForm
        open={openForm}
        handleClose={handleCloseForm}
        refreshStudents={fetchAllStudents}
        isEdit={editMode}
        studentToEdit={selectedStudent}
      />
    </Container>
  );
};

export default Home;
