import React from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  Collapse,
  ListItemButton
} from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  BarChart as AnalysisIcon, 
  CloudUpload as ImportIcon, 
  Description as ReportsIcon, 
  Settings as SettingsIcon,
  PlayArrow as RunIcon,
  DateRange as DateRangeIcon,
  Storage as DataIcon,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant: "permanent" | "persistent" | "temporary";
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, variant }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dataOpen, setDataOpen] = React.useState(false);
  
  const handleDataClick = () => {
    setDataOpen(!dataOpen);
  };
  
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Analize', icon: <AnalysisIcon />, path: '/analyses' },
    { text: 'Pokreni skriptu', icon: <RunIcon />, path: '/run-script' },
    { text: 'Uvoz podataka', icon: <ImportIcon />, path: '/import' },
    { text: 'Izvještaji', icon: <ReportsIcon />, path: '/reports' },
    { text: 'Postavke', icon: <SettingsIcon />, path: '/settings' }
  ];
  
  const dataSubItems = [
    { text: 'Pregled po periodu', icon: <DateRangeIcon />, path: '/data/by-period' },
    { text: 'Pregled po zonama', icon: <DataIcon />, path: '/data/by-zone' },
    { text: 'Pregled po artiklima', icon: <DataIcon />, path: '/data/by-item' }
  ];
  
  const handleNavigation = (path: string) => {
    navigate(path);
    if (variant === 'temporary') {
      onClose();
    }
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem 
              button 
              key={item.text} 
              onClick={() => handleNavigation(item.path)}
              selected={isActive(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
          
          <ListItemButton onClick={handleDataClick}>
            <ListItemIcon>
              <DataIcon />
            </ListItemIcon>
            <ListItemText primary="Pregled podataka" />
            {dataOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          
          <Collapse in={dataOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {dataSubItems.map((item) => (
                <ListItem 
                  button 
                  key={item.text} 
                  onClick={() => handleNavigation(item.path)}
                  selected={isActive(item.path)}
                  sx={{ pl: 4 }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;

