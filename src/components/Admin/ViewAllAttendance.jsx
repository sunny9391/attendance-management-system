import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from '../../api/axios';

const ViewAllAttendance = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllAttendance();
  }, []);

  const fetchAllAttendance = async () => {
    try {
      const response = await axios.get('/api/attendance');
      const formattedData = response.data.map((record) => ({
        id: record._id,  
        studentName: record.studentname,
        batchName: record.batch_name || 'N/A',
        date: new Date(record.date).toLocaleDateString(),
        status: record.status,
        markedBy: record.marked_by?.name || 'N/A'  
      }));
      setRows(formattedData);
    } catch (err) {
      console.error('Failed to fetch attendance', err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: 'studentName', headerName: 'Student Name', flex: 1, minWidth: 150 },
    { field: 'batchName', headerName: 'Batch', flex: 1, minWidth: 130 },
    { field: 'date', headerName: 'Date', flex: 0.8, minWidth: 120 },
    { 
      field: 'status', 
      headerName: 'Status', 
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => {
        const colors = {
          present: 'success',
          absent: 'error',
          late: 'warning'
        };
        return (
          <Chip 
            label={params.value.toUpperCase()} 
            color={colors[params.value]} 
            size="small"
          />
        );
      }
    },
    { field: 'markedBy', headerName: 'Marked By', flex: 1, minWidth: 150 }
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom color="primary">
            All Attendance Records
          </Typography>
          <Box sx={{ height: 600, width: '100%', mt: 2 }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50, 100]}
              loading={loading}
              disableSelectionOnClick
              sx={{
                '& .MuiDataGrid-cell:hover': {
                  backgroundColor: '#f5f5f5',
                },
              }}
            />
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ViewAllAttendance;
