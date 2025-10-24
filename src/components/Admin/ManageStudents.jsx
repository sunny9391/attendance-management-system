import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton, Box, Chip, Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from '../../api/axios';


const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    email: '',
    batch_id: ''
  });

  useEffect(() => {
    fetchStudents();
    fetchBatches();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/users');
      const studentsList = response.data.filter(u => u.role === 'student');
      
      const formattedStudents = studentsList.map(student => ({
        id: student._id,
        name: student.name,
        email: student.email,
        batch_id: student.batch_id?._id || null,
        batchName: student.batch_id?.name || null
      }));
      
      setStudents(formattedStudents);
    } catch (err) {
      setError('Failed to fetch students');
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await axios.get('/api/batches');
      
      const formattedBatches = response.data.map(batch => ({
        id: batch._id,
        name: batch.name
      }));
      
      setBatches(formattedBatches);
    } catch (err) {
      setError('Failed to fetch batches');
    }
  };

  const getBatchName = (batchId) => {
    if (!batchId) return 'No Batch';
    const batch = batches.find(b => b.id === batchId);
    return batch ? batch.name : 'No Batch';
  };

  const handleAdd = () => {
    setEditMode(false);
    setFormData({ id: null, name: '', email: '', batch_id: '' });
    setOpen(true);
  };

  const handleEdit = (student) => {
    setEditMode(true);
    setFormData({
      id: student.id,
      name: student.name,
      email: student.email,
      batch_id: student.batch_id || ''
    });
    setOpen(true);
  };

  const handleDeleteClick = (student) => {
    setSelectedStudent(student);
    setDeleteDialog(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/users/${selectedStudent.id}`);
      setSuccess('Student deleted successfully!');
      fetchStudents();
      setDeleteDialog(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete student');
      setDeleteDialog(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      setError('Name and email are required');
      return;
    }

    try {
      if (editMode) {
        const updateData = { 
          name: formData.name, 
          email: formData.email, 
          batch_id: formData.batch_id || null 
        };
        
        await axios.put(`/api/users/${formData.id}`, updateData);
        setSuccess('Student updated successfully!');
      } else {
        await axios.post('/api/users', {
          name: formData.name,
          email: formData.email,
          password: 'student123', 
          role: 'student',
          batch_id: formData.batch_id || null
        });
        setSuccess('Student added successfully!');
      }
      
      fetchStudents();
      setOpen(false);
      setFormData({ id: null, name: '', email: '', batch_id: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save student');
      setTimeout(() => setError(''), 5000);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" color="primary">Manage Students</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Add and manage student information
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAdd}
            >
              Add Student
            </Button>
          </Box>

          {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold', width: '5%' }}>S.No</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '35%' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Batch</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', width: '10%' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.length > 0 ? (
                  students.map((student, index) => (
                    <TableRow key={student.id} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {student.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>
                        {student.batchName ? (
                          <Chip label={student.batchName} size="small" color="primary" />
                        ) : (
                          <Chip label="No Batch" size="small" variant="outlined" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          color="primary" 
                          size="small"
                          onClick={() => handleEdit(student)}
                          title="Edit Student"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          size="small"
                          onClick={() => handleDeleteClick(student)}
                          title="Delete Student"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        No students found. Click "Add Student" to get started.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>{editMode ? 'Edit Student' : 'Add New Student'}</DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {editMode 
                  ? 'Update student information below' 
                  : 'Enter student details. Students do not require passwords as they do not login to the system.'}
              </Typography>
              <TextField
                fullWidth
                label="Student Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
                required
                placeholder="Enter full name"
              />
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                margin="normal"
                required
                placeholder="student@example.com"
              />
              <TextField
                fullWidth
                select
                label="Assign to Batch"
                value={formData.batch_id}
                onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
                margin="normal"
                SelectProps={{ native: true }}
                helperText="Optional: Assign student to a batch"
              >
                <option value="">No Batch (Assign Later)</option>
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name}
                  </option>
                ))}
              </TextField>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button 
                variant="contained" 
                onClick={handleSubmit}
                disabled={!formData.name || !formData.email}
              >
                {editMode ? 'Update Student' : 'Add Student'}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete <strong>{selectedStudent?.name}</strong>?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                This will also delete all attendance records for this student. This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
              <Button variant="contained" color="error" onClick={handleDelete}>
                Delete Student
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Box>
    </Container>
  );
};

export default ManageStudents;
