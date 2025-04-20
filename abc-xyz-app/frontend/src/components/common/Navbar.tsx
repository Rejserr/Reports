import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar
} from '@mui/material';
import { AccountCircle, Menu as MenuIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';


const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          ABC-XYZ Analysis Tool
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button 
            color="inherit" 
            onClick={() => navigate('/dashboard')}
            sx={{ 
              fontWeight: location.pathname === '/dashboard' ? 'bold' : 'normal',
              textDecoration: location.pathname === '/dashboard' ? 'underline' : 'none'
            }}
          >
            Dashboard
          </Button>
          
          <Button 
            color="inherit" 
            onClick={() => navigate('/analyses')}
            sx={{ 
              fontWeight: location.pathname === '/analyses' ? 'bold' : 'normal',
              textDecoration: location.pathname === '/analyses' ? 'underline' : 'none'
            }}
          >
            Analyses
          </Button>
          
          <Button 
            color="inherit" 
            onClick={() => navigate('/import')}
            sx={{ 
              fontWeight: location.pathname === '/import' ? 'bold' : 'normal',
              textDecoration: location.pathname === '/import' ? 'underline' : 'none'
            }}
          >
            Import Data
          </Button>
          
          <Button 
            color="inherit" 
            onClick={() => navigate('/reports')}
            sx={{ 
              fontWeight: location.pathname === '/reports' ? 'bold' : 'normal',
              textDecoration: location.pathname === '/reports' ? 'underline' : 'none'
            }}
          >
            Reports
          </Button>
          
          {user && (
            <div>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user.username ? user.username.charAt(0) : user.name.charAt(0)}
                </Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>Profile</MenuItem>
                <MenuItem onClick={() => { handleClose(); navigate('/settings'); }}>Settings</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </div>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;