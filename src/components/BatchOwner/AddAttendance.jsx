import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axios';

const AddAttendance = () => {
  const { user } = useAuth();
  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchBatchAndStudents();
  }, [user]);

  const fetchBatchAndStudents = async () => {
    try {
      setLoading(true);
      
      const batchesResponse = await axios.get('/api/batches');
      const myBatch = batchesResponse.data.find(b => b.owner_id?._id === user.id);
      
      if (!myBatch) {
        showSnackbar('No batch assigned to you', 'error');
        setLoading(false);
        return;
      }

      setBatch({
        id: myBatch._id,
        name: myBatch.name
      });

      const usersResponse = await axios.get('/api/users');
      const batchStudents = usersResponse.data.filter(
        u => u.role === 'student' && u.batch_id?._id === myBatch._id
      );

      const formattedStudents = batchStudents.map(s => ({
        id: s._id,
        name: s.name
      }));

      setStudents(formattedStudents);
      
      const initialAttendance = {};
      formattedStudents.forEach(student => {
        initialAttendance[student.id] = 'present';
      });
      setAttendance(initialAttendance);
    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmit = async () => {
    if (!batch) {
      showSnackbar('No batch found', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const today = new Date().toISOString().split('T')[0];
      
      const attendanceRecords = students.map(student => ({
        batchid: batch.id,
        date: today,
        studentname: student.name,
        status: attendance[student.id] || 'present'
      }));

      await axios.post('/api/attendance', {
        attendance: attendanceRecords,
        marked_by: user.id
      });

      showSnackbar('Attendance submitted successfully!', 'success');
      const resetAttendance = {};
      students.forEach(student => {
        resetAttendance[student.id] = 'present';
      });
      setAttendance(resetAttendance);
    } catch (error) {
      console.error('Error submitting attendance:', error);
      showSnackbar(
        error.response?.data?.message || 'Error submitting attendance',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        ✅ Mark Attendance
      </Typography>

      {batch && (
        <Paper elevation={3} sx={{ p: 3, borderRadius: '12px' }}>
          <Typography variant="h6" sx={{ mb: 1, color: '#666' }}>
            Batch: <strong>{batch.name}</strong>
          </Typography>
          <Typography variant="h6" sx={{ mb: 3, color: '#666' }}>
            Today's Date: {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Typography>

          {students.length > 0 ? (
            <>
              {students.map((student) => (
                <Box
                  key={student.id}
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: '8px',
                    backgroundColor: '#f9f9f9',
                    border: '1px solid #e0e0e0',
                    '&:hover': {
                      backgroundColor: '#f0f0f0'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500, minWidth: 200 }}>
                      {student.name}
                    </Typography>
                    <FormControl component="fieldset">
                      <RadioGroup
                        row
                        value={attendance[student.id] || 'present'}
                        onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
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
                    </FormControl>
                  </Box>
                </Box>
              ))}

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSubmit}
                  disabled={submitting}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    }
                  }}
                >
                  {submitting ? <CircularProgress size={24} color="inherit" /> : 'Submit Attendance'}
                </Button>
              </Box>
            </>
          ) : (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              No students found in your batch
            </Typography>
          )}
        </Paper>
      )}

      {!batch && !loading && (
        <Alert severity="warning">
          No batch assigned to you. Please contact the administrator.
        </Alert>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddAttendance;
