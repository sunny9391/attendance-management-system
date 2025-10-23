import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton, Box, Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

const ManageBatches = () => {
  const [batches, setBatches] = useState([]);
  const [owners, setOwners] = useState([]);
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
    fetchOwners();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/batches');
      setBatches(response.data);
    } catch (err) {
      setError('Failed to fetch batches');
    }
  };

  const fetchOwners = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users');
      const batchOwners = response.data.filter(u => u.role === 'batch_owner');
      setOwners(batchOwners);
    } catch (err) {
      setError('Failed to fetch batch owners');
    }
  };

  const getOwnerName = (ownerId) => {
    const owner = owners.find(o => o.id === ownerId);
    return owner ? owner.name : 'No Owner';
  };

  const getStudentCount = async (batchId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/users/batch/${batchId}`);
      return response.data.length;
    } catch (err) {
      return 0;
    }
  };

  const handleAdd = () => {
    setEditMode(false);
    setFormData({ id: null, name: '', owner_id: '' });
    setOpen(true);
  };

  const handleEdit = (batch) => {
    setEditMode(true);
    setFormData({
      id: batch.id,
      name: batch.name,
      owner_id: batch.owner_id
    });
    setOpen(true);
  };

  const handleDeleteClick = (batch) => {
    setSelectedBatch(batch);
    setDeleteDialog(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/batches/${selectedBatch.id}`);
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
    if (!formData.name || !formData.owner_id) {
      setError('Batch name and owner are required');
      return;
    }

    try {
      if (editMode) {
        await axios.put(`http://localhost:5000/api/batches/${formData.id}`, {
          name: formData.name,
          owner_id: formData.owner_id
        });
        setSuccess('Batch updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/batches', {
          name: formData.name,
          owner_id: formData.owner_id
        });
        setSuccess('Batch created successfully!');
      }
      
      fetchBatches();
      setOpen(false);
      setFormData({ id: null, name: '', owner_id: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save batch');
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
                Create and manage batches with assigned batch owners
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

          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {owners.length === 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              No batch owners found. Please create batch owners first before creating batches.
            </Alert>
          )}

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
                          {getOwnerName(batch.owner_id)}
                        </Typography>
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

          {/* Add/Edit Dialog */}
          <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>{editMode ? 'Edit Batch' : 'Create New Batch'}</DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {editMode 
                  ? 'Update batch information and assign a new owner if needed' 
                  : 'Create a new batch and assign a batch owner who will manage attendance'}
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
                required
                helperText="Select a teacher who will manage this batch"
              >
                <option value="">Select Batch Owner</option>
                {owners.map((owner) => (
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
                disabled={!formData.name || !formData.owner_id}
              >
                {editMode ? 'Update Batch' : 'Create Batch'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
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
