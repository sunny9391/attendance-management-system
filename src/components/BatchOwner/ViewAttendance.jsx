import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axios';

const ViewAttendance = () => {
  const { user } = useAuth();
  const [batch, setBatch] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBatchAndAttendance();
  }, [user]);

  const fetchBatchAndAttendance = async () => {
    try {
      setLoading(true);
      
      const batchesResponse = await axios.get('/api/batches');
      const myBatch = batchesResponse.data.find(b => b.owner_id?._id === user.id);
      
      if (!myBatch) {
        setLoading(false);
        return;
      }

      setBatch({
        id: myBatch._id,
        name: myBatch.name
      });

      const attendanceResponse = await axios.get(
        `/api/attendance/batch/${myBatch._id}`
      );
      
      const attendanceWithId = attendanceResponse.data.map(record => ({
        id: record._id,
        studentname: record.studentname,
        date: record.date,
        status: record.status,
        createdAt: record.createdAt
      }));
      
      setAttendance(attendanceWithId);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'absent':
        return 'error';
      case 'late':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!batch) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          No batch assigned to you. Please contact the administrator.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
        📋 Attendance History
      </Typography>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 400, mb: 3, color: '#666' }}>
        Batch: <strong>{batch.name}</strong>
      </Typography>

      <Paper elevation={3} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Student Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Marked On</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendance.length > 0 ? (
                attendance.map((record) => (
                  <TableRow
                    key={record.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: '#f9f9f9'
                      }
                    }}
                  >
                    <TableCell>{record.studentname}</TableCell>
                    <TableCell>{new Date(record.date).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell>
                      <Chip
                        label={record.status.toUpperCase()}
                        color={getStatusColor(record.status)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(record.createdAt).toLocaleString('en-IN')}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No attendance records found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ViewAttendance;
