import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { backendUrl } from '../App';
import toast from 'react-hot-toast';

const AddStudentForm = ({
  open,
  handleClose,
  refreshStudents,
  isEdit = false,
  studentToEdit = null,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    codeforcesHandle: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && studentToEdit) {
      setFormData({
        name: studentToEdit.name || '',
        email: studentToEdit.email || '',
        phone: studentToEdit.phone || '',
        codeforcesHandle: studentToEdit.codeforcesHandle || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        codeforcesHandle: '',
      });
    }
  }, [isEdit, studentToEdit , open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        const res = await axios.put(
          `${backendUrl}/student/update/${studentToEdit._id}`,
          formData,
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
          }
        );

        toast.success(res.data.message);

        const handleChanged = formData.codeforcesHandle !== studentToEdit.codeforcesHandle;
        if (handleChanged) {
          toast.loading('Syncing updated Codeforces data...');
          await axios.get(`${backendUrl}/student/sync/${formData.codeforcesHandle}`);
          // toast.dismiss();
          // toast.success('CF data synced!');
        }
      } else {
        const res = await axios.post(`${backendUrl}/student/add`, formData, {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        });

        toast.success(res.data.message);
      }

      handleClose();
      refreshStudents();
    } catch (error) {
      console.error('Error saving student:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? 'Edit Student' : 'Add Student'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            name="name"
            label="Name"
            fullWidth
            required
            value={formData.name}
            onChange={handleChange}
          />
          <TextField
            name="email"
            label="Email"
            type="email"
            fullWidth
            required
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            name="phone"
            label="Phone Number"
            fullWidth
            value={formData.phone}
            onChange={handleChange}
          />
          <TextField
            name="codeforcesHandle"
            label="Codeforces Handle"
            fullWidth
            required
            value={formData.codeforcesHandle}
            onChange={handleChange}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary" disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : isEdit ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddStudentForm;
