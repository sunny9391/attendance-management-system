import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton, Box, Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

const ManageBatchOwners = () => {
  const [owners, setOwners] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users');
      const ownersList = response.data.filter(u => u.role === 'batch_owner');
      setOwners(ownersList);
    } catch (err) {
      setError('Failed to fetch batch owners');
      console.error(err);
    }
  };

  const handleAdd = () => {
    setEditMode(false);
    setFormData({ id: null, name: '', email: '', password: '' });
    setOpen(true);
  };

  const handleEdit = (owner) => {
    setEditMode(true);
    setFormData({
      id: owner.id,
      name: owner.name,
      email: owner.email,
      password: ''
    });
    setOpen(true);
  };

  const handleDeleteClick = (owner) => {
    setSelectedOwner(owner);
    setDeleteDialog(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${selectedOwner.id}`);
      setSuccess('Batch owner deleted successfully!');
      fetchOwners();
      setDeleteDialog(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete batch owner');
      setDeleteDialog(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      setError('Name and email are required');
      return;
    }

    if (!editMode && !formData.password) {
      setError('Password is required');
      return;
    }

    try {
      if (editMode) {
        // Update existing
        const updateData = { 
          name: formData.name, 
          email: formData.email
        };
        
        if (formData.password) {
          updateData.password = formData.password;
        }
        
        await axios.put(`http://localhost:5000/api/users/${formData.id}`, updateData);
        setSuccess('Batch owner updated successfully!');
      } else {
        // Add new
        await axios.post('http://localhost:5000/api/users', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'batch_owner',
          batch_id: null
        });
        setSuccess('Batch owner added successfully!');
      }
      
      fetchOwners();
      setOpen(false);
      setFormData({ id: null, name: '', email: '', password: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save batch owner');
      console.error(err);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" color="primary">Manage Batch Owners</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Teachers who can manage batches and mark attendance
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAdd}
            >
              Add Batch Owner
            </Button>
          </Box>

          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>S.No</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {owners.length > 0 ? (
                  owners.map((owner, index) => (
                    <TableRow key={owner.id} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {owner.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{owner.email}</TableCell>
                      <TableCell align="center">
                        <IconButton 
                          color="primary" 
                          size="small"
                          onClick={() => handleEdit(owner)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          size="small"
                          onClick={() => handleDeleteClick(owner)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        No batch owners found. Click "Add Batch Owner" to create one.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Add/Edit Dialog */}
          <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>{editMode ? 'Edit Batch Owner' : 'Add New Batch Owner'}</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label={editMode ? "Password (leave blank to keep current)" : "Password"}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                margin="normal"
                required={!editMode}
                helperText={editMode ? "Only fill if you want to change password" : ""}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleSubmit}>
                {editMode ? 'Update' : 'Add'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete <strong>{selectedOwner?.name}</strong>?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
              <Button variant="contained" color="error" onClick={handleDelete}>
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Box>
    </Container>
  );
};

export default ManageBatchOwners;
