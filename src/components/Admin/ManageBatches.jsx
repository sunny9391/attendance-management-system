import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton, Box, Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from '../../api/axios';

const ManageBatches = () => {
  const [batches, setBatches] = useState([]);
  const [availableOwners, setAvailableOwners] = useState([]); 
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    owner_id: ''
  });

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await axios.get('/api/batches');
      const formattedBatches = response.data.map(batch => ({
        id: batch._id,
        name: batch.name,
        owner_id: batch.owner_id?._id || null,
        ownerName: batch.owner_id?.name || 'No Owner',
        ownerEmail: batch.owner_id?.email || '',
        created_at: batch.createdAt || batch.created_at
      }));
      setBatches(formattedBatches);
    } catch (err) {
      setError('Failed to fetch batches');
    }
  };

  const fetchAvailableOwners = async () => {
    try {
      const response = await axios.get('/api/batches/available/owners');
      const formattedOwners = response.data.map(owner => ({
        id: owner._id,
        name: owner.name,
        email: owner.email
      }));
      setAvailableOwners(formattedOwners);
    } catch (err) {
      console.error('Error fetching available owners:', err);
    }
  };

  const handleAdd = () => {
    setEditMode(false);
    setFormData({ id: null, name: '', owner_id: '' });
    fetchAvailableOwners(); 
    setOpen(true);
  };

  const handleEdit = (batch) => {
    setEditMode(true);
    setFormData({
      id: batch.id,
      name: batch.name,
      owner_id: batch.owner_id || ''
    });
    fetchAvailableOwnersForEdit(batch.owner_id);
    setOpen(true);
  };

  const fetchAvailableOwnersForEdit = async (currentOwnerId) => {
    try {
      const response = await axios.get('/api/batches/available/owners');
      let owners = response.data.map(owner => ({
        id: owner._id,
        name: owner.name,
        email: owner.email
      }));

      if (currentOwnerId) {
        const allOwnersResponse = await axios.get('/api/users');
        const currentOwner = allOwnersResponse.data.find(u => u._id === currentOwnerId);
        if (currentOwner) {
          owners = [
            { id: currentOwner._id, name: currentOwner.name, email: currentOwner.email },
            ...owners
          ];
        }
      }

      setAvailableOwners(owners);
    } catch (err) {
      console.error('Error fetching owners:', err);
    }
  };

  const handleDeleteClick = (batch) => {
    setSelectedBatch(batch);
    setDeleteDialog(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/batches/${selectedBatch.id}`);
      setSuccess('Batch deleted successfully!');
      fetchBatches();
      setDeleteDialog(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete batch');
      setDeleteDialog(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      setError('Batch name is required');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const batchData = {
        name: formData.name,
        owner_id: formData.owner_id || null
      };

      if (editMode) {
        await axios.put(`/api/batches/${formData.id}`, batchData);
        setSuccess('Batch updated successfully!');
      } else {
        await axios.post('/api/batches', batchData);
        setSuccess('Batch created successfully!');
      }
      
      fetchBatches();
      setOpen(false);
      setFormData({ id: null, name: '', owner_id: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save batch');
      setTimeout(() => setError(''), 5000);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" color="primary">Manage Batches</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Create and manage batches (one batch per owner)
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAdd}
            >
              Add Batch
            </Button>
          </Box>

          {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold', width: '5%' }}>S.No</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '35%' }}>Batch Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Batch Owner</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Created Date</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {batches.length > 0 ? (
                  batches.map((batch, index) => (
                    <TableRow key={batch.id} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {batch.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {batch.ownerName}
                        </Typography>
                        {batch.ownerEmail && (
                          <Typography variant="caption" color="text.secondary">
                            {batch.ownerEmail}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(batch.created_at).toLocaleDateString('en-IN')}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          color="primary" 
                          size="small"
                          onClick={() => handleEdit(batch)}
                          title="Edit Batch"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          size="small"
                          onClick={() => handleDeleteClick(batch)}
                          title="Delete Batch"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        No batches found. Click "Add Batch" to create one.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>{editMode ? 'Edit Batch' : 'Create New Batch'}</DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {editMode 
                  ? 'Update batch information and assign a new owner if needed' 
                  : 'Create a new batch. Each batch owner can manage only one batch.'}
              </Typography>
              <TextField
                fullWidth
                label="Batch Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
                required
                placeholder="e.g., Full Stack Development 2024"
              />
              <TextField
                fullWidth
                select
                label="Assign Batch Owner (Teacher)"
                value={formData.owner_id}
                onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                margin="normal"
                SelectProps={{ native: true }}
                helperText={availableOwners.length === 0 
                  ? "All batch owners are already assigned to batches" 
                  : "Select a teacher who will manage this batch"}
              >
                <option value="">No Owner (Assign Later)</option>
                {availableOwners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} ({owner.email})
                  </option>
                ))}
              </TextField>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button 
                variant="contained" 
                onClick={handleSubmit}
                disabled={!formData.name}
              >
                {editMode ? 'Update Batch' : 'Create Batch'}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete batch <strong>{selectedBatch?.name}</strong>?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                This will remove all students from this batch and delete all attendance records. This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
              <Button variant="contained" color="error" onClick={handleDelete}>
                Delete Batch
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Box>
    </Container>
  );
};

export default ManageBatches;
