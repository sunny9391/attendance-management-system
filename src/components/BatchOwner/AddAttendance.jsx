import React, { useState, useEffect, useContext } from 'react';
import {
  Container, Paper, Typography, FormControl, InputLabel, Select, MenuItem,
  Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Radio, RadioGroup, FormControlLabel, Box, Alert, TextField, CircularProgress
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const AddAttendance = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  useEffect(() => {
    fetchBatch();
  }, []);

  const fetchBatch = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/batches/owner/${user.id}`);
      const batchData = Array.isArray(response.data) ? response.data[0] : response.data;
      setBatch(batchData);
      fetchStudents(batchData.id);
    } catch (err) {
      setError('Failed to fetch batch information');
      setFetchingData(false);
    }
  };

  const fetchStudents = async (batchId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/users/batch/${batchId}`);
      setStudents(response.data);
      
      // Initialize attendance with all students marked as present
      const initialAttendance = {};
      response.data.forEach(student => {
        initialAttendance[student.name] = 'present';
      });
      setAttendance(initialAttendance);
      setFetchingData(false);
    } catch (err) {
      setError('Failed to fetch students');
      setFetchingData(false);
    }
  };

  const handleAttendanceChange = (studentName, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentName]: status
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Check if attendance already exists for this date
      const checkResponse = await axios.get(
        `http://localhost:5000/api/attendance/check/${batch.id}/${date}`
      );
      
      if (checkResponse.data.exists) {
        setError('Attendance for this date has already been recorded! Please select a different date or delete existing records first.');
        setLoading(false);
        return;
      }

      // Prepare attendance data
      const attendanceData = students.map(student => ({
        batchid: batch.id,
        date: date,
        studentname: student.name,
        status: attendance[student.name],
        marked_by: user.id
      }));

      // Submit attendance
      await axios.post('http://localhost:5000/api/attendance/bulk', attendanceData);
      
      setSuccess('Attendance marked successfully! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/batch-owner/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit attendance');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!batch) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="warning">
            No batch assigned to you. Please contact the administrator.
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
            Mark Attendance
          </Typography>

          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box sx={{ mb: 3, mt: 3 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Batch: {batch.name}
            </Typography>
            <TextField
              type="date"
              label="Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mt: 2, minWidth: 250 }}
              fullWidth
            />
          </Box>

          {students.length > 0 ? (
            <>
              <TableContainer sx={{ mt: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Student Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Attendance Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id} hover>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell align="center">
                          <RadioGroup
                            row
                            value={attendance[student.name]}
                            onChange={(e) => handleAttendanceChange(student.name, e.target.value)}
                            sx={{ justifyContent: 'center' }}
                          >
                            <FormControlLabel 
                              value="present" 
                              control={<Radio color="success" />} 
                              label="Present" 
                            />
                            <FormControlLabel 
                              value="absent" 
                              control={<Radio color="error" />} 
                              label="Absent" 
                            />
                            <FormControlLabel 
                              value="late" 
                              control={<Radio color="warning" />} 
                              label="Late" 
                            />
                          </RadioGroup>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  fullWidth
                  disabled={loading}
                  size="large"
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Attendance'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/batch-owner/dashboard')}
                  disabled={loading}
                  size="large"
                >
                  Cancel
                </Button>
              </Box>
            </>
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>
              No students enrolled in this batch yet. Please contact the administrator to add students.
            </Alert>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default AddAttendance;
