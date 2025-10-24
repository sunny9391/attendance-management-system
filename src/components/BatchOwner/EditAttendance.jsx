import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Radio, RadioGroup, FormControlLabel,
  Box, Alert, CircularProgress, TextField, Chip, Divider
} from '@mui/material';
import { Save as SaveIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const EditAttendance = () => {
  const { user } = useAuth();
  const [batch, setBatch] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [originalAttendance, setOriginalAttendance] = useState({});
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingBatch, setFetchingBatch] = useState(true);

  const formatDateLocal = (dateValue) => {
    const date = new Date(dateValue);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    fetchBatchAndAllAttendance();
  }, []);

  useEffect(() => {
    if (selectedDate && allAttendance.length > 0) {
      filterAttendanceByDate(selectedDate);
    }
  }, [selectedDate, allAttendance]);

  const fetchBatchAndAllAttendance = async () => {
    try {
      setFetchingBatch(true);
      
      const batchesResponse = await axios.get('/api/batches');
      const myBatch = batchesResponse.data.find(b => b.owner_id?._id === user.id);
      
      if (!myBatch) {
        setError('No batch assigned to you');
        setFetchingBatch(false);
        return;
      }

      const batchData = {
        id: myBatch._id,
        name: myBatch.name
      };

      setBatch(batchData);

      const attendanceResponse = await axios.get(
        `/api/attendance/batch/${myBatch._id}`
      );

      if (attendanceResponse.data.length === 0) {
        setError('No attendance records found for your batch.');
        setFetchingBatch(false);
        return;
      }

      const formattedAttendance = attendanceResponse.data.map(record => ({
        id: record._id,
        studentname: record.studentname,
        status: record.status,
        date: record.date
      }));

      setAllAttendance(formattedAttendance);

      const today = formatDateLocal(new Date());
      setSelectedDate(today);
    } catch (err) {
      console.error('Error fetching batch:', err);
      setError('Failed to load batch information');
    } finally {
      setFetchingBatch(false);
    }
  };

  const filterAttendanceByDate = (dateString) => {
    setLoading(true);
    setSuccess('');
    setError('');

    const filtered = allAttendance.filter(record => {
      const recordDateStr = formatDateLocal(record.date);
      return recordDateStr === dateString;
    });

    if (filtered.length === 0) {
      setError('No attendance records found for this date.');
      setAttendanceRecords([]);
      setAttendance({});
      setOriginalAttendance({});
      setLoading(false);
      return;
    }

    setAttendanceRecords(filtered);
    
    const initialAttendance = {};
    const original = {};
    filtered.forEach(record => {
      initialAttendance[record.id] = record.status;
      original[record.id] = record.status;
    });
    setAttendance(initialAttendance);
    setOriginalAttendance(original);
    setLoading(false);
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleAttendanceChange = (recordId, status) => {
    setAttendance(prev => ({
      ...prev,
      [recordId]: status
    }));
  };

  const hasChanges = () => {
    return Object.keys(attendance).some(
      id => attendance[id] !== originalAttendance[id]
    );
  };

  const handleSave = async () => {
    if (!hasChanges()) {
      setError('No changes to save');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const updatePromises = Object.keys(attendance)
        .filter(id => attendance[id] !== originalAttendance[id])
        .map(id => 
          axios.put(`/api/attendance/${id}`, {
            status: attendance[id]
          })
        );

      await Promise.all(updatePromises);
      
      setSuccess('Attendance updated successfully!');
      setOriginalAttendance({ ...attendance });
      
      const attendanceResponse = await axios.get(
        `/api/attendance/batch/${batch.id}`
      );
      
      const formattedAttendance = attendanceResponse.data.map(record => ({
        id: record._id,
        studentname: record.studentname,
        status: record.status,
        date: record.date
      }));

      setAllAttendance(formattedAttendance);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || 'Failed to update attendance');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAttendance({ ...originalAttendance });
    setSuccess('');
    setError('');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'late': return 'warning';
      default: return 'default';
    }
  };

  const getStatusCounts = () => {
    const counts = { present: 0, absent: 0, late: 0 };
    Object.values(attendance).forEach(status => {
      counts[status]++;
    });
    return counts;
  };

  const getAvailableDates = () => {
    const dates = new Set();
    allAttendance.forEach(record => {
      const dateStr = formatDateLocal(record.date);
      dates.add(dateStr);
    });
    return Array.from(dates).sort().reverse();
  };

  if (fetchingBatch) {
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
            {error || 'No batch assigned to you. Please contact the administrator.'}
          </Alert>
        </Box>
      </Container>
    );
  }

  const statusCounts = getStatusCounts();
  const availableDates = getAvailableDates();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
            Edit Attendance Records
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Batch: <strong>{batch.name}</strong>
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

          {availableDates.length > 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Available dates with attendance: {availableDates.map(d => new Date(d).toLocaleDateString('en-IN')).join(', ')}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <TextField
              type="date"
              label="Select Date to Edit"
              value={selectedDate}
              onChange={handleDateChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{
                max: formatDateLocal(new Date())
              }}
              helperText={availableDates.length > 0 ? `Available dates: ${availableDates.length}` : 'No attendance records yet'}
            />
          </Box>

          {attendanceRecords.length > 0 && (
            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip label={`Total: ${attendanceRecords.length}`} color="primary" variant="outlined" />
              <Chip label={`Present: ${statusCounts.present}`} color="success" />
              <Chip label={`Absent: ${statusCounts.absent}`} color="error" />
              <Chip label={`Late: ${statusCounts.late}`} color="warning" />
              {hasChanges() && <Chip label="Unsaved Changes" color="info" sx={{ fontWeight: 'bold' }} />}
            </Box>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : attendanceRecords.length > 0 ? (
            <>
              <TableContainer sx={{ mt: 3, mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold', width: '5%' }}>S.No</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Student Name</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', width: '20%' }}>Original Status</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', width: '45%' }}>Update Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendanceRecords.map((record, index) => (
                      <TableRow 
                        key={record.id} 
                        hover
                        sx={{
                          backgroundColor: attendance[record.id] !== originalAttendance[record.id] 
                            ? 'rgba(33, 150, 243, 0.08)' 
                            : 'inherit'
                        }}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {record.studentname}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={originalAttendance[record.id]?.toUpperCase()}
                            color={getStatusColor(originalAttendance[record.id])}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <RadioGroup
                            row
                            value={attendance[record.id]}
                            onChange={(e) => handleAttendanceChange(record.id, e.target.value)}
                            sx={{ justifyContent: 'center' }}
                          >
                            <FormControlLabel value="present" control={<Radio color="success" />} label="Present" />
                            <FormControlLabel value="absent" control={<Radio color="error" />} label="Absent" />
                            <FormControlLabel value="late" control={<Radio color="warning" />} label="Late" />
                          </RadioGroup>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleReset}
                  disabled={!hasChanges() || loading}
                >
                  Reset Changes
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={!hasChanges() || loading}
                  size="large"
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                </Button>
              </Box>
            </>
          ) : (
            <Alert severity="info">
              {availableDates.length === 0 
                ? 'No attendance records found. Please mark attendance first.'
                : 'No attendance records found for this date. Try selecting a different date.'}
            </Alert>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default EditAttendance;
