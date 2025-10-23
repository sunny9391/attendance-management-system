import React, { useState, useEffect, useContext } from 'react';
import { Container, Paper, Typography, Box, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const ViewAttendance = () => {
  const { user } = useContext(AuthContext);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batchId, setBatchId] = useState(null);

  useEffect(() => {
    fetchBatchAndAttendance();
  }, []);

  const fetchBatchAndAttendance = async () => {
    try {
      const batchResponse = await axios.get(`http://localhost:5000/api/batches/owner/${user.id}`);
      const batch = Array.isArray(batchResponse.data) ? batchResponse.data[0] : batchResponse.data;
      setBatchId(batch.id);

      const attendanceResponse = await axios.get(`http://localhost:5000/api/attendance/batch/${batch.id}`);
      const formattedData = attendanceResponse.data.map((record, index) => ({
        id: record.id || index,
        studentName: record.studentname,
        date: new Date(record.date).toLocaleDateString(),
        status: record.status
      }));
      setRows(formattedData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: 'studentName', headerName: 'Student Name', flex: 1 },
    { field: 'date', headerName: 'Date', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom color="primary">
            Attendance History
          </Typography>
          <Box sx={{ height: 600, width: '100%', mt: 2 }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              loading={loading}
              disableSelectionOnClick
            />
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ViewAttendance;
