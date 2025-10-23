import React, { useContext, useState } from 'react';
import {
  AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon,
  ListItemText, IconButton, Box, Menu, MenuItem, Divider
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard as DashboardIcon, People as PeopleIcon,
  Class as ClassIcon, EventNote as EventNoteIcon, AccountCircle,
  ExitToApp as LogoutIcon, SupervisorAccount as SupervisorIcon ,Edit as EditIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const drawerWidth = 240;

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'All Attendance', icon: <EventNoteIcon />, path: '/admin/attendance' },
    { text: 'Manage Batches', icon: <ClassIcon />, path: '/admin/batches' },
    { text: 'Batch Owners', icon: <SupervisorIcon />, path: '/admin/batch-owners' },
    { text: 'Manage Students', icon: <PeopleIcon />, path: '/admin/students' },
  ];

 const batchOwnerMenuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/batch-owner/dashboard' },
  { text: 'Mark Attendance', icon: <EventNoteIcon />, path: '/batch-owner/add-attendance' },
  { text: 'Edit Today\'s Attendance', icon: <EditIcon />, path: '/batch-owner/edit-attendance' },
  { text: 'View Attendance', icon: <EventNoteIcon />, path: '/batch-owner/view-attendance' },
];

  const menuItems = user?.role === 'admin' ? adminMenuItems : batchOwnerMenuItems;

  const drawer = (
    <div>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" color="primary">
          Attendance App
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {user?.role?.replace('_', ' ').toUpperCase()}
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
            sx={{
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.08)',
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                },
                '& .MuiListItemText-primary': {
                  color: 'primary.main',
                  fontWeight: 500,
                }
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          borderRadius: 0  // Remove rounded borders
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Attendance Management System
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              {user?.name}
            </Typography>
            <IconButton onClick={handleMenuOpen} color="inherit">
              <AccountCircle />
            </IconButton>
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { 
            width: drawerWidth, 
            boxSizing: 'border-box', 
            mt: 8,
            borderRadius: 0  // Remove rounded borders
          },
        }}
      >
        {drawer}
      </Drawer>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            borderRadius: 0  // Remove rounded borders
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, width: '100%' }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
