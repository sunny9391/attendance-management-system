import React, { useState, useEffect, useContext } from 'react';
import {
  Container, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Radio, RadioGroup, FormControlLabel,
  Box, Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem,
  Chip, Divider
} from '@mui/material';
import { Save as SaveIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const EditAttendance = () => {
  const { user } = useContext(AuthContext);
  const [batch, setBatch] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [originalAttendance, setOriginalAttendance] = useState({});
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  useEffect(() => {
    fetchBatchAndDates();
  }, []);

  useEffect(() => {
    if (selectedDate && batch) {
      fetchAttendanceForDate(selectedDate);
    }
  }, [selectedDate]);

  const fetchBatchAndDates = async () => {
    try {
      console.log('Fetching batch for owner:', user.id);
      
      // Get batch info
      const batchResponse = await axios.get(`http://localhost:5000/api/batches/owner/${user.id}`);
      const batchData = Array.isArray(batchResponse.data) ? batchResponse.data[0] : batchResponse.data;
      
      console.log('Batch data:', batchData);
      
      if (!batchData) {
        setError('No batch assigned to you. Please contact the administrator.');
        setFetchingData(false);
        return;
      }
      
      setBatch(batchData);

      // Get all dates where attendance was marked
      const datesResponse = await axios.get(`http://localhost:5000/api/attendance/dates/${batchData.id}`);
      
      console.log('Dates response:', datesResponse.data);
      
      if (datesResponse.data.length === 0) {
        setError('No attendance records found for your batch. Please mark attendance first.');
        setFetchingData(false);
        return;
      }

      setAvailableDates(datesResponse.data);
      
      // Format the date properly - MySQL returns it as a Date object
      const firstDate = datesResponse.data[0].date;
      const formattedDate = formatDateForAPI(firstDate);
      
      console.log('First date:', firstDate, 'Formatted:', formattedDate);
      
      setSelectedDate(formattedDate);
      setFetchingData(false);
    } catch (err) {
      console.error('Error in fetchBatchAndDates:', err);
      setError('Failed to fetch batch information');
      setFetchingData(false);
    }
  };

  // Format date to YYYY-MM-DD for API calls
  const formatDateForAPI = (dateValue) => {
    const date = new Date(dateValue);
    // Add timezone offset to prevent date shift
    const offsetDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return offsetDate.toISOString().split('T')[0];
  };

  const fetchAttendanceForDate = async (date) => {
    setLoading(true);
    setSuccess('');
    setError('');
    
    console.log('Fetching attendance for batch:', batch.id, 'date:', date);
    
    try {
      const response = await axios.get(
        `http://localhost:5000/api/attendance/batch/${batch.id}/date/${date}`
      );
      
      console.log('Attendance response:', response.data);
      
      if (response.data.length === 0) {
        setError('No attendance records found for this date.');
        setAttendanceRecords([]);
        setLoading(false);
        return;
      }

      setAttendanceRecords(response.data);
      
      // Initialize attendance state with existing records
      const initialAttendance = {};
      const original = {};
      response.data.forEach(record => {
        initialAttendance[record.id] = record.status;
        original[record.id] = record.status;
      });
      setAttendance(initialAttendance);
      setOriginalAttendance(original);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError('Failed to fetch attendance records');
      setLoading(false);
    }
  };

  const handleDateChange = (event) => {
    const selectedValue = event.target.value;
    console.log('Date changed to:', selectedValue);
    setSelectedDate(selectedValue);
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
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Update only changed records
      const updatePromises = Object.keys(attendance)
        .filter(id => attendance[id] !== originalAttendance[id])
        .map(id => 
          axios.put(`http://localhost:5000/api/attendance/update/${id}`, {
            status: attendance[id]
          })
        );

      await Promise.all(updatePromises);
      
      setSuccess(`Attendance updated successfully!`);
      
      // Update original attendance to reflect saved changes
      setOriginalAttendance({ ...attendance });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update attendance');
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

  const formatDisplayDate = (dateValue) => {
    const date = new Date(dateValue);
    const offsetDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return offsetDate.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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

  if (!batch || availableDates.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="warning">{error || 'No attendance records available to edit.'}</Alert>
        </Box>
      </Container>
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
            Edit Attendance Records
          </Typography>

          <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
            Batch: <strong>{batch.name}</strong>
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* Date Selection */}
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Select Date to Edit</InputLabel>
              <Select
                value={selectedDate}
                onChange={handleDateChange}
                label="Select Date to Edit"
              >
                {availableDates.map((dateObj) => {
                  const formattedValue = formatDateForAPI(dateObj.date);
                  return (
                    <MenuItem key={formattedValue} value={formattedValue}>
                      {formatDisplayDate(dateObj.date)}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Box>

          {/* Statistics */}
          {attendanceRecords.length > 0 && (
            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip 
                label={`Total: ${attendanceRecords.length}`} 
                color="primary" 
                variant="outlined"
              />
              <Chip 
                label={`Present: ${statusCounts.present}`} 
                color="success" 
              />
              <Chip 
                label={`Absent: ${statusCounts.absent}`} 
                color="error" 
              />
              <Chip 
                label={`Late: ${statusCounts.late}`} 
                color="warning" 
              />
              {hasChanges() && (
                <Chip 
                  label="Unsaved Changes" 
                  color="info"
                  sx={{ fontWeight: 'bold' }}
                />
              )}
            </Box>
          )}

          {/* Attendance Table */}
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
                            label={originalAttendance[record.id].toUpperCase()}
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

              {/* Action Buttons */}
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
            <Alert severity="info">Select a date to view and edit attendance</Alert>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default EditAttendance;
