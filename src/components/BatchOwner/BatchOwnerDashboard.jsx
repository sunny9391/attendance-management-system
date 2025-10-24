import React, { useState, useEffect, useContext } from 'react';
import {
  Container, Grid, Paper, Typography, Box, Card, CardContent, Button,
  CircularProgress, Alert, LinearProgress
} from '@mui/material';
import {
  People as PeopleIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  AccessTime as LateIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

const StatCard = ({ title, value, icon, bgcolor }) => (
  <Card 
    sx={{ 
      height: '100%',
      minHeight:'230px',
      borderRadius:'10px',
      background: bgcolor,
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 8
      },
      transition: 'all 0.3s ease'
    }}
    elevation={4}
  >
    <CardContent 
      sx={{ 
        position: 'relative', 
        zIndex: 1, 
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100%'
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Box
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 3,
            p: 2,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2
          }}
        >
          {React.cloneElement(icon, { 
            sx: { fontSize: 48, color: 'white' } 
          })}
        </Box>
        
        <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
          {value}
        </Typography>
        
        <Typography variant="body1" sx={{ opacity: 0.95, fontWeight: 500, letterSpacing: 0.5 }}>
          {title}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

const BatchOwnerDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalStudents: 0,
    todayPresent: 0,
    todayAbsent: 0,
    todayLate: 0,
    attendanceMarked: false
  });

  useEffect(() => {
    fetchBatchData();
  }, []);

  const fetchBatchData = async () => {
    try {
      const batchesResponse = await axios.get('/api/batches');
      const myBatch = batchesResponse.data.find(b => b.owner_id?._id === user.id);
      
      if (!myBatch) {
        setError('No batch assigned to you. Please contact the administrator.');
        setLoading(false);
        return;
      }
      
      const formattedBatch = {
        id: myBatch._id,
        name: myBatch.name,
        owner_id: myBatch.owner_id?._id
      };
      
      setBatch(formattedBatch);

      const usersResponse = await axios.get('/api/users');
      const batchStudents = usersResponse.data.filter(
        u => u.role === 'student' && u.batch_id?._id === formattedBatch.id
      );
      
      const formattedStudents = batchStudents.map(student => ({
        id: student._id,
        name: student.name,
        email: student.email
      }));
      
      setStudents(formattedStudents);

      try {
        const today = new Date().toISOString().split('T')[0];
        const attendanceResponse = await axios.get(
          `/api/attendance/date/${today}/batch/${formattedBatch.id}`
        );
        
        const todayAttendance = attendanceResponse.data;
        const attendanceMarked = todayAttendance && todayAttendance.length > 0;
        
        let present = 0, absent = 0, late = 0;
        
        if (attendanceMarked) {
          todayAttendance.forEach(record => {
            if (record.status === 'present') present++;
            else if (record.status === 'absent') absent++;
            else if (record.status === 'late') late++;
          });
        }
        
        setStats({
          totalStudents: formattedStudents.length,
          todayPresent: present,
          todayAbsent: absent,
          todayLate: late,
          attendanceMarked: attendanceMarked
        });
      } catch (err) {
        setStats({
          totalStudents: formattedStudents.length,
          todayPresent: 0,
          todayAbsent: 0,
          todayLate: 0,
          attendanceMarked: false
        });
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching batch data:', err);
      setError('Failed to load batch information. Please try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  const attendanceRate = stats.totalStudents > 0 
    ? ((stats.todayPresent / stats.totalStudents) * 100).toFixed(1)
    : 0;

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            Welcome, {user.name}! 👋
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mt: 0.5 }}>
            Managing: <strong>{batch?.name}</strong>
          </Typography>
        </Box>

        <Grid container spacing={2.5}>
          <Grid item xs={12} md={6} lg={4}>
            <Grid container spacing={2.5}>
              <Grid item xs={6}>
                <StatCard
                  title="Total Students"
                  value={stats.totalStudents}
                  icon={<PeopleIcon />}
                  bgcolor="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                />
              </Grid>
              <Grid item xs={6}>
                <StatCard
                  title="Present Today"
                  value={stats.todayPresent}
                  icon={<CheckIcon />}
                  bgcolor="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
                />
              </Grid>
              <Grid item xs={6}>
                <StatCard
                  title="Absent Today"
                  value={stats.todayAbsent}
                  icon={<CancelIcon />}
                  bgcolor="linear-gradient(135deg, #eb3349 0%, #f45c43 100%)"
                />
              </Grid>
              <Grid item xs={6}>
                <StatCard
                  title="Late Today"
                  value={stats.todayLate}
                  icon={<LateIcon />}
                  bgcolor="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <Paper 
              elevation={4} 
              sx={{ 
                p: 3,
                background: stats.attendanceMarked 
                  ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                  : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                {stats.attendanceMarked ? '✓ Today\'s Attendance Marked' : '⚠ Attendance Pending'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                {stats.attendanceMarked 
                  ? `You have marked attendance for ${stats.todayPresent + stats.todayAbsent + stats.todayLate} students today.`
                  : 'Please mark today\'s attendance for your batch.'}
              </Typography>
              
              {stats.attendanceMarked && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Attendance Rate
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {attendanceRate}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={parseFloat(attendanceRate)} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: 'rgba(255,255,255,0.3)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: 'white',
                        borderRadius: 4
                      }
                    }} 
                  />
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                {!stats.attendanceMarked ? (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/batch-owner/add-attendance')}
                    sx={{
                      backgroundColor: 'white',
                      color: '#f5576c',
                      fontWeight: 600,
                      px: 3,
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.9)'
                      }
                    }}
                  >
                    Mark Today's Attendance
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<EditIcon />}
                    onClick={() => navigate('/batch-owner/add-attendance')}
                    sx={{
                      backgroundColor: 'white',
                      color: '#11998e',
                      fontWeight: 600,
                      px: 3,
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.9)'
                      }
                    }}
                  >
                    Edit Attendance
                  </Button>
                )}
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<ViewIcon />}
                  onClick={() => navigate('/batch-owner/view-attendance')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    fontWeight: 600,
                    px: 3,
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  View History
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Students in Your Batch ({students.length})
              </Typography>
              {students.length > 0 ? (
                <Grid container spacing={2}>
                  {students.map((student) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={student.id}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: '1px solid #e0e0e0',
                          backgroundColor: 'white',
                          '&:hover': {
                            borderColor: '#1976d2',
                            backgroundColor: '#e3f2fd',
                            transform: 'translateY(-2px)',
                            boxShadow: 2
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {student.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {student.email}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Alert severity="info">
                  No students enrolled in this batch yet.
                </Alert>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default BatchOwnerDashboard;
