import React, { useState, useEffect } from 'react';
import {
  Grid, Paper, Typography, Box, Card, CardContent, LinearProgress
} from '@mui/material';
import {
  People as PeopleIcon,
  Class as ClassIcon,
  EventNote as EventNoteIcon,
  SupervisorAccount as SupervisorIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import axios from 'axios';

const StatCard = ({ title, value, icon, bgcolor }) => (
  <Card 
    sx={{ 
      height: '100%',
      minHeight:'160px',
      borderRadius:'8px',
      background: bgcolor,
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: 6
      },
      transition: 'all 0.3s ease'
    }}
    elevation={3}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600, display: 'block', mb: 1.5, fontSize: '0.85rem' }}>
            {title}
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 'bold' }}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 2,
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {React.cloneElement(icon, { 
            sx: { fontSize: 48, color: 'white' } 
          })}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalBatches: 0,
    totalBatchOwners: 0,
    todayAttendance: 0,
    todayPresent: 0,
    todayAbsent: 0
  });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentAttendance();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/attendance/stats/dashboard');
      setStats(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch stats', err);
      setLoading(false);
    }
  };

  const fetchRecentAttendance = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/attendance');
      setRecentAttendance(response.data.slice(0, 10));
    } catch (err) {
      console.error('Failed to fetch recent attendance', err);
    }
  };

  const attendanceRate = stats.todayAttendance > 0 
    ? ((stats.todayPresent / stats.todayAttendance) * 100).toFixed(1)
    : 0;

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          Welcome Back, Admin! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          Here's what's happening with your attendance system today
        </Typography>
      </Box>

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Row 1: 4 Stat Cards - Full Width Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={<PeopleIcon />}
            bgcolor="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Batches"
            value={stats.totalBatches}
            icon={<ClassIcon />}
            bgcolor="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Batch Owners"
            value={stats.totalBatchOwners}
            icon={<SupervisorIcon />}
            bgcolor="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Records"
            value={stats.todayAttendance}
            icon={<EventNoteIcon />}
            bgcolor="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
          />
        </Grid>
      </Grid>

      {/* Row 2: Today's Attendance Summary - Full Width */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mb: 3,
          width: '100%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '8px'
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          📊 Today's Attendance Summary
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Box 
              sx={{ 
                textAlign: 'center',
                p: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: 2,
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <CheckIcon sx={{ fontSize: 56, mb: 2 }} />
              <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
                {stats.todayPresent}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, fontSize: '1rem' }}>
                Students Present
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box 
              sx={{ 
                textAlign: 'center',
                p: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: 2,
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <CancelIcon sx={{ fontSize: 56, mb: 2 }} />
              <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
                {stats.todayAbsent}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, fontSize: '1rem' }}>
                Students Absent
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box 
              sx={{ 
                textAlign: 'center',
                p: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: 2,
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
                {attendanceRate}%
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 2.5, fontSize: '1rem' }}>
                Attendance Rate
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={parseFloat(attendanceRate)} 
                sx={{ 
                  height: 10, 
                  borderRadius: 5,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'white',
                    borderRadius: 5
                  }
                }} 
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

     {/* Recent Attendance Activity - Full Width */}
<Grid item xs={12}>
  <Paper elevation={3} sx={{ p: 3, borderRadius: '8px' }}>
    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
      📝 Recent Attendance Activity
    </Typography>
    {recentAttendance.length > 0 ? (
      <Box>
        {recentAttendance.map((record, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' }, // Stack on mobile, row on tablet+
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              p: 2,
              borderRadius: 2,
              mb: 1,
              backgroundColor: index % 2 === 0 ? '#f5f5f5' : 'white',
              border: '1px solid #e0e0e0',
              gap: { xs: 1, sm: 0 }, // Add gap on mobile
              '&:hover': { 
                backgroundColor: '#e3f2fd',
                transform: { sm: 'translateX(4px)' }, // Only translate on larger screens
                transition: 'all 0.2s ease',
                borderColor: '#2196f3'
              }
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              flex: 1,
              flexWrap: 'wrap', // Allow wrapping on small screens
              width: { xs: '100%', sm: 'auto' }
            }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: 
                    record.status === 'present' ? '#4caf50' : 
                    record.status === 'late' ? '#ff9800' : '#f44336',
                  flexShrink: 0 // Prevent shrinking
                }}
              />
              <Typography sx={{ 
                fontWeight: 500, 
                minWidth: { xs: 'auto', sm: 180 },
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}>
                {record.studentname}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{
                fontSize: { xs: '0.85rem', sm: '0.875rem' }
              }}>
                {record.batch_name}
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              width: { xs: '100%', sm: 'auto' },
              justifyContent: { xs: 'space-between', sm: 'flex-end' }
            }}>
              <Typography variant="body2" color="text.secondary" sx={{
                fontSize: { xs: '0.85rem', sm: '0.875rem' }
              }}>
                {new Date(record.date).toLocaleDateString('en-IN')}
              </Typography>
              <Box
                sx={{
                  px: { xs: 2, sm: 2.5 },
                  py: 0.5,
                  borderRadius: 20,
                  backgroundColor: 
                    record.status === 'present' ? '#e8f5e9' : 
                    record.status === 'late' ? '#fff3e0' : '#ffebee',
                  color: 
                    record.status === 'present' ? '#2e7d32' : 
                    record.status === 'late' ? '#e65100' : '#c62828',
                  fontWeight: 600,
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  textTransform: 'uppercase',
                  minWidth: { xs: 70, sm: 80 },
                  textAlign: 'center',
                  flexShrink: 0
                }}
              >
                {record.status}
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    ) : (
      <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
        No attendance records yet
      </Typography>
    )}
  </Paper>
</Grid>

    </Box>
  );
};

export default AdminDashboard;