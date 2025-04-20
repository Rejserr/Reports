import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  Toolbar,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  BarChart as AnalysisIcon,
  Settings as SettingsIcon,
  CloudUpload as ImportIcon,
  PlayArrow as RunIcon,
  Assessment as ReportsIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import Header from '../components/layout/Header';

const drawerWidth = 240;

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  useEffect(() => {
    setIsDrawerOpen(!isMobile);
  }, [isMobile]);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setIsDrawerOpen(!isDrawerOpen);
    }
  };

  const menuItems = [
    { text: 'Početna', icon: <HomeIcon />, path: '/' },
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Analize', icon: <AnalysisIcon />, path: '/analysis' },
    { text: 'Pokreni skriptu', icon: <RunIcon />, path: '/run-script' },
    { text: 'Uvoz podataka', icon: <ImportIcon />, path: '/import-data' },
    { text: 'Izvještaji', icon: <ReportsIcon />, path: '/reports' },
    { text: 'Postavke', icon: <SettingsIcon />, path: '/settings' }
  ];

  // Komponenta za header u sidebaru
  const DrawerHeader = () => (
    <Box 
      sx={{ 
        width: '100%', 
        height: 64, // Ista visina kao glavni header
        backgroundColor: 'rgba(0, 0, 0, 0.1)', // Ista boja kao glavni header
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Typography variant="h6" color="white" noWrap>
        ABC-XYZ
      </Typography>
    </Box>
  );

  const drawer = (
    <>
      <DrawerHeader />
      <List sx={{ mt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ mt: 2 }} />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Verzija 1.0.0
        </Typography>
      </Box>
    </>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Header onMenuToggle={handleDrawerToggle} />
      
      <Box
        component="nav"
        sx={{ 
          width: { sm: isDrawerOpen ? drawerWidth : 0 }, 
          flexShrink: { sm: 0 } 
        }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              paddingTop: 0, // Uklonjen padding na vrhu
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="persistent"
          open={isDrawerOpen}
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid rgba(0, 0, 0, 0.12)',
              paddingTop: 0, // Uklonjen padding na vrhu
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: isDrawerOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
          height: '100%',
          overflow: 'auto',
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar /> {/* Spacer za Header */}
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
