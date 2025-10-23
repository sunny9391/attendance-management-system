import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Auth Components
import Login from './components/Auth/Login';

// Common Components
import Layout from './components/Common/Layout';
import ProtectedRoute from './components/Common/ProtectedRoute';

// Admin Components
import AdminDashboard from './components/Admin/AdminDashboard';
import ViewAllAttendance from './components/Admin/ViewAllAttendance';
import ManageBatches from './components/Admin/ManageBatches';
import ManageBatchOwners from './components/Admin/ManageBatchOwners';
import ManageStudents from './components/Admin/ManageStudents';

// Batch Owner Components
import EditAttendance from './components/BatchOwner/EditAttendance';
import BatchOwnerDashboard from './components/BatchOwner/BatchOwnerDashboard';
import AddAttendance from './components/BatchOwner/AddAttendance';
import ViewAttendance from './components/BatchOwner/ViewAttendance';

const theme = createTheme({
  palette: {
    primary: { 
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0'
    },
    secondary: { 
      main: '#dc004e',
      light: '#f73378',
      dark: '#9a0036'
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20'
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828'
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100'
    },
    info: {
      main: '#0288d1',
      light: '#03a9f4',
      dark: '#01579b'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600
    },
    h5: {
      fontWeight: 600
    },
    h6: {
      fontWeight: 600
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 4
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0  // Remove rounded borders from all Paper components
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderRadius: 0  // Remove rounded borders from AppBar
        }
      }
    }
  }
});

const AppContent = () => {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      {/* Public Route */}
      <Route 
        path="/login" 
        element={
          user ? (
            <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/batch-owner/dashboard'} replace />
          ) : (
            <Login />
          )
        } 
      />
      
      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/attendance"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <ViewAllAttendance />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/batches"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <ManageBatches />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/batch-owners"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <ManageBatchOwners />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <ManageStudents />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      {/* Batch Owner Routes */}
      <Route
        path="/batch-owner/dashboard"
        element={
          <ProtectedRoute allowedRoles={['batch_owner']}>
            <Layout>
              <BatchOwnerDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/batch-owner/add-attendance"
        element={
          <ProtectedRoute allowedRoles={['batch_owner']}>
            <Layout>
              <AddAttendance />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
  path="/batch-owner/edit-attendance"
  element={
    <ProtectedRoute allowedRoles={['batch_owner']}>
      <Layout>
        <EditAttendance />
      </Layout>
    </ProtectedRoute>
  }
/>
      <Route
        path="/batch-owner/view-attendance"
        element={
          <ProtectedRoute allowedRoles={['batch_owner']}>
            <Layout>
              <ViewAttendance />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      {/* Default Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
