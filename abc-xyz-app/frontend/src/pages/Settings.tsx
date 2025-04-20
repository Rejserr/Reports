import React, { useState, useEffect } from 'react';
import {
  Box,
  Tab,
  Tabs,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { 
  getConfigurations, 
  createConfiguration, 
  updateConfiguration, 
  deleteConfiguration,
  Configuration,
  ConfigurationCreate,
  ConfigurationUpdate
} from '../services/configurationService';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  User,
  UserCreate,
  UserUpdate
} from '../services/userService';
import { useAuth } from '../hooks/useAuth';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<Configuration | null>(null);
  const [editingConfig, setEditingConfig] = useState<Partial<Configuration> | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<Partial<UserCreate | UserUpdate> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'config' | 'user', id: number } | null>(null);

  // Dohvaćanje konfiguracija i korisnika
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Dohvati konfiguracije
        const configsData = await getConfigurations();
        setConfigurations(configsData);
        
        // Dohvati korisnike ako je korisnik admin
        if (user?.role === 'Admin') {
          const usersData = await getUsers();
          setUsers(usersData);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching settings data:', err);
        setError('Došlo je do greške prilikom dohvaćanja podataka');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Funkcije za upravljanje konfiguracijama
  const handleAddConfig = () => {
    setEditingConfig({
      config_name: '',
      description: '',
      abc_a_threshold: 80,
      abc_b_threshold: 95,
      xyz_x_threshold: 20,
      xyz_y_threshold: 40,
      lead_time_weeks: 2,
      safety_stock_x_factor: 1,
      safety_stock_y_factor: 1.5,
      safety_stock_z_factor: 2.5,
      max_qty_a_factor: 1.5,
      max_qty_b_factor: 2,
      max_qty_c_factor: 3,
      is_default: false
    });
    setSelectedConfig(null);
  };

  const handleEditConfig = (config: Configuration) => {
    setEditingConfig({ ...config });
    setSelectedConfig(config);
  };

  const handleSaveConfig = async () => {
    if (!editingConfig) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      let savedConfig: Configuration;
      
      if (editingConfig.config_id) {
        // Ažuriranje postojeće konfiguracije
        const updateData: ConfigurationUpdate = {
          config_name: editingConfig.config_name,
          description: editingConfig.description,
          abc_a_threshold: editingConfig.abc_a_threshold,
          abc_b_threshold: editingConfig.abc_b_threshold,
          xyz_x_threshold: editingConfig.xyz_x_threshold,
          xyz_y_threshold: editingConfig.xyz_y_threshold,
          lead_time_weeks: editingConfig.lead_time_weeks,
          safety_stock_x_factor: editingConfig.safety_stock_x_factor,
          safety_stock_y_factor: editingConfig.safety_stock_y_factor,
          safety_stock_z_factor: editingConfig.safety_stock_z_factor,
          max_qty_a_factor: editingConfig.max_qty_a_factor,
          max_qty_b_factor: editingConfig.max_qty_b_factor,
          max_qty_c_factor: editingConfig.max_qty_c_factor,
          is_default: editingConfig.is_default
        };
        
        savedConfig = await updateConfiguration(editingConfig.config_id, updateData);
      } else {
        // Kreiranje nove konfiguracije
        const createData: ConfigurationCreate = {
          config_name: editingConfig.config_name || '',
          description: editingConfig.description,
          abc_a_threshold: editingConfig.abc_a_threshold || 80,
          abc_b_threshold: editingConfig.abc_b_threshold || 95,
          xyz_x_threshold: editingConfig.xyz_x_threshold || 20,
          xyz_y_threshold: editingConfig.xyz_y_threshold || 40,
          lead_time_weeks: editingConfig.lead_time_weeks || 2,
          safety_stock_x_factor: editingConfig.safety_stock_x_factor || 1,
          safety_stock_y_factor: editingConfig.safety_stock_y_factor || 1.5,
          safety_stock_z_factor: editingConfig.safety_stock_z_factor || 2.5,
          max_qty_a_factor: editingConfig.max_qty_a_factor || 1.5,
          max_qty_b_factor: editingConfig.max_qty_b_factor || 2,
          max_qty_c_factor: editingConfig.max_qty_c_factor || 3,
          is_default: editingConfig.is_default || false
        };
        
        savedConfig = await createConfiguration(createData);
      }
      
      // Ažuriranje liste konfiguracija
      const updatedConfigs = await getConfigurations();
      setConfigurations(updatedConfigs);
      
      setSelectedConfig(savedConfig);
      setEditingConfig(null);
      setSuccess('Konfiguracija uspješno spremljena');
    } catch (err) {
      console.error('Error saving configuration:', err);
      setError('Došlo je do greške prilikom spremanja konfiguracije');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfig = async () => {
    if (!itemToDelete || itemToDelete.type !== 'config') return;
    
    setLoading(true);
    setError(null);
    
    try {
      await deleteConfiguration(itemToDelete.id);
      
      // Ažuriranje liste konfiguracija
      const updatedConfigs = await getConfigurations();
      setConfigurations(updatedConfigs);
      
      if (selectedConfig?.config_id === itemToDelete.id) {
        setSelectedConfig(null);
      }
      
      setSuccess('Konfiguracija uspješno obrisana');
    } catch (err) {
      console.error('Error deleting configuration:', err);
      setError('Došlo je do greške prilikom brisanja konfiguracije');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const confirmDelete = (type: 'config' | 'user', id: number) => {
    setItemToDelete({ type, id });
    setDeleteDialogOpen(true);
  };

  // Funkcije za upravljanje korisnicima
  const handleAddUser = () => {
    setEditingUser({
      username: '',
      password: '',
      email: '',
      full_name: '',
      role: 'Viewer',
      is_active: true
    });
    setSelectedUser(null);
  };

  const handleEditUser = (user: User) => {
    setEditingUser({
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      is_active: user.is_active
    });
    setSelectedUser(user);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      let savedUser: User;
      
      if (selectedUser) {
        // Ažuriranje postojećeg korisnika
        const updateData: UserUpdate = {
          email: editingUser.email,
          full_name: editingUser.full_name,
          password: (editingUser as UserCreate).password, // Samo ako je unesena nova lozinka
          role: editingUser.role,
          is_active: editingUser.is_active
        };
        
        // Ukloni password ako nije unesen
        if (!updateData.password) {
          delete updateData.password;
        }
        
        savedUser = await updateUser(selectedUser.id, updateData);
      } else {
        // Kreiranje novog korisnika
        if (!(editingUser as UserCreate).password) {
          setError('Lozinka je obavezna za novog korisnika');
          setLoading(false);
          return;
        }
        
        const createData: UserCreate = {
          username: (editingUser as UserCreate).username || '',
          password: (editingUser as UserCreate).password || '',
          email: editingUser.email || '',
          full_name: editingUser.full_name || '',
          role: editingUser.role || 'Viewer',
          is_active: editingUser.is_active !== undefined ? editingUser.is_active : true
        };
        
        savedUser = await createUser(createData);
      }
      
      // Ažuriranje liste korisnika
      const updatedUsers = await getUsers();
      setUsers(updatedUsers);
      
      setSelectedUser(null);
      setEditingUser(null);
      setSuccess('Korisnik uspješno spremljen');
    } catch (err) {
      console.error('Error saving user:', err);
      setError('Došlo je do greške prilikom spremanja korisnika');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!itemToDelete || itemToDelete.type !== 'user') return;
    
    setLoading(true);
    setError(null);
    
    try {
      await deleteUser(itemToDelete.id);
      
      // Ažuriranje liste korisnika
      const updatedUsers = await getUsers();
      setUsers(updatedUsers);
      
      if (selectedUser?.id === itemToDelete.id) {
        setSelectedUser(null);
      }
      
      setSuccess('Korisnik uspješno obrisan');
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Došlo je do greške prilikom brisanja korisnika');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Postavke
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="settings tabs">
          <Tab label="ABC-XYZ Konfiguracije" />
          {user?.role === 'Admin' && <Tab label="Korisnici" />}
        </Tabs>
      </Box>
      
      {/* Konfiguracije */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Konfiguracije</Typography>
                <IconButton 
                  color="primary" 
                  onClick={handleAddConfig}
                  disabled={loading}
                >
                  <AddIcon />
                </IconButton>
              </Box>
              
              {loading && !editingConfig ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Box>
                  {configurations.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Nema dostupnih konfiguracija
                    </Typography>
                  ) : (
                    configurations.map((config) => (
                      <Box 
                        key={config.config_id}
                        sx={{ 
                          p: 1, 
                          mb: 1, 
                          borderRadius: 1,
                          bgcolor: selectedConfig?.config_id === config.config_id ? 'action.selected' : 'background.paper',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                        onClick={() => setSelectedConfig(config)}
                      >
                        <Box>
                          <Typography variant="subtitle1">
                            {config.config_name}
                            {config.is_default && (
                              <Typography component="span" variant="caption" sx={{ ml: 1, color: 'primary.main' }}>
                                (Zadano)
                              </Typography>
                            )}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {config.description || 'Bez opisa'}
                          </Typography>
                        </Box>
                        <Box>
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditConfig(config);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete('config', config.config_id);
                            }}
                            disabled={config.is_default}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, height: '100%' }}>
              {editingConfig ? (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {editingConfig.config_id ? 'Uredi konfiguraciju' : 'Nova konfiguracija'}
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Naziv konfiguracije"
                        value={editingConfig.config_name || ''}
                        onChange={(e) => setEditingConfig({...editingConfig, config_name: e.target.value})}
                        disabled={loading}
                        required
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Opis"
                        value={editingConfig.description || ''}
                        onChange={(e) => setEditingConfig({...editingConfig, description: e.target.value})}
                        disabled={loading}
                        multiline
                        rows={2}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="ABC A prag (%)"
                        type="number"
                        value={editingConfig.abc_a_threshold || 80}
                        onChange={(e) => setEditingConfig({...editingConfig, abc_a_threshold: Number(e.target.value)})}
                        disabled={loading}
                        inputProps={{ min: 0, max: 100, step: 1 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="ABC B prag (%)"
                        type="number"
                        value={editingConfig.abc_b_threshold || 95}
                        onChange={(e) => setEditingConfig({...editingConfig, abc_b_threshold: Number(e.target.value)})}
                        disabled={loading}
                        inputProps={{ min: 0, max: 100, step: 1 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="XYZ X prag (%)"
                        type="number"
                        value={editingConfig.xyz_x_threshold || 20}
                        onChange={(e) => setEditingConfig({...editingConfig, xyz_x_threshold: Number(e.target.value)})}
                        disabled={loading}
                        inputProps={{ min: 0, max: 100, step: 1 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="XYZ Y prag (%)"
                        type="number"
                        value={editingConfig.xyz_y_threshold || 40}
                        onChange={(e) => setEditingConfig({...editingConfig, xyz_y_threshold: Number(e.target.value)})}
                        disabled={loading}
                        inputProps={{ min: 0, max: 100, step: 1 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Vrijeme isporuke (tjedni)"
                        type="number"
                        value={editingConfig.lead_time_weeks || 2}
                        onChange={(e) => setEditingConfig({...editingConfig, lead_time_weeks: Number(e.target.value)})}
                        disabled={loading}
                        inputProps={{ min: 0, step: 0.1 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Sigurnosna zaliha X faktor"
                        type="number"
                        value={editingConfig.safety_stock_x_factor || 1}
                        onChange={(e) => setEditingConfig({...editingConfig, safety_stock_x_factor: Number(e.target.value)})}
                        disabled={loading}
                        inputProps={{ min: 0, step: 0.1 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Sigurnosna zaliha Y faktor"
                        type="number"
                        value={editingConfig.safety_stock_y_factor || 1.5}
                        onChange={(e) => setEditingConfig({...editingConfig, safety_stock_y_factor: Number(e.target.value)})}
                        disabled={loading}
                        inputProps={{ min: 0, step: 0.1 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Sigurnosna zaliha Z faktor"
                        type="number"
                        value={editingConfig.safety_stock_z_factor || 2.5}
                        onChange={(e) => setEditingConfig({...editingConfig, safety_stock_z_factor: Number(e.target.value)})}
                        disabled={loading}
                        inputProps={{ min: 0, step: 0.1 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Max količina A faktor"
                        type="number"
                        value={editingConfig.max_qty_a_factor || 1.5}
                        onChange={(e) => setEditingConfig({...editingConfig, max_qty_a_factor: Number(e.target.value)})}
                        disabled={loading}
                        inputProps={{ min: 0, step: 0.1 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Max količina B faktor"
                        type="number"
                        value={editingConfig.max_qty_b_factor || 2}
                        onChange={(e) => setEditingConfig({...editingConfig, max_qty_b_factor: Number(e.target.value)})}
                        disabled={loading}
                        inputProps={{ min: 0, step: 0.1 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Max količina C faktor"
                        type="number"
                        value={editingConfig.max_qty_c_factor || 3}
                        onChange={(e) => setEditingConfig({...editingConfig, max_qty_c_factor: Number(e.target.value)})}
                        disabled={loading}
                        inputProps={{ min: 0, step: 0.1 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={editingConfig.is_default || false}
                            onChange={(e) => setEditingConfig({...editingConfig, is_default: e.target.checked})}
                            disabled={loading}
                          />
                        }
                        label="Postavi kao zadanu konfiguraciju"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button 
                          variant="outlined" 
                          onClick={() => setEditingConfig(null)}
                          disabled={loading}
                        >
                          Odustani
                        </Button>
                        <Button 
                          variant="contained" 
                          onClick={handleSaveConfig}
                          disabled={loading || !editingConfig.config_name}
                        >
                          {loading ? <CircularProgress size={24} /> : 'Spremi'}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              ) : selectedConfig ? (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {selectedConfig.config_name}
                    {selectedConfig.is_default && (
                      <Typography component="span" variant="caption" sx={{ ml: 1, color: 'primary.main' }}>
                        (Zadano)
                      </Typography>
                    )}
                  </Typography>
                  
                  <Typography variant="body2" paragraph>
                    {selectedConfig.description || 'Bez opisa'}
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">ABC pragovi:</Typography>
                      <Typography variant="body2">A: {selectedConfig.abc_a_threshold}%</Typography>
                      <Typography variant="body2">B: {selectedConfig.abc_b_threshold}%</Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">XYZ pragovi:</Typography>
                      <Typography variant="body2">X: {selectedConfig.xyz_x_threshold}%</Typography>
                      <Typography variant="body2">Y: {selectedConfig.xyz_y_threshold}%</Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Faktori sigurnosne zalihe:</Typography>
                      <Typography variant="body2">X: {selectedConfig.safety_stock_x_factor}</Typography>
                      <Typography variant="body2">Y: {selectedConfig.safety_stock_y_factor}</Typography>
                      <Typography variant="body2">Z: {selectedConfig.safety_stock_z_factor}</Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Faktori maksimalne količine:</Typography>
                      <Typography variant="body2">A: {selectedConfig.max_qty_a_factor}</Typography>
                      <Typography variant="body2">B: {selectedConfig.max_qty_b_factor}</Typography>
                      <Typography variant="body2">C: {selectedConfig.max_qty_c_factor}</Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">Vrijeme isporuke:</Typography>
                      <Typography variant="body2">{selectedConfig.lead_time_weeks} tjedana</Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button 
                          variant="outlined" 
                          onClick={() => handleEditConfig(selectedConfig)}
                          disabled={loading}
                        >
                          Uredi
                        </Button>
                        <Button 
                          variant="outlined" 
                          color="error"
                          onClick={() => confirmDelete('config', selectedConfig.config_id)}
                          disabled={loading || selectedConfig.is_default}
                        >
                          Obriši
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography variant="body1" color="text.secondary">
                    Odaberite konfiguraciju ili kreirajte novu
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Korisnici */}
      {user?.role === 'Admin' && (
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Korisnici</Typography>
                  <IconButton 
                    color="primary" 
                    onClick={handleAddUser}
                    disabled={loading}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
                
                {loading && !editingUser ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box>
                    {users.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        Nema dostupnih korisnika
                      </Typography>
                    ) : (
                      users.map((user) => (
                        <Box 
                          key={user.id}
                          sx={{ 
                            p: 1, 
                            mb: 1, 
                            borderRadius: 1,
                            bgcolor: selectedUser?.id === user.id ? 'action.selected' : 'background.paper',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            '&:hover': { bgcolor: 'action.hover' }
                          }}
                          onClick={() => setSelectedUser(user)}
                        >
                          <Box>
                            <Typography variant="subtitle1">
                              {user.username}
                              {!user.is_active && (
                                <Typography component="span" variant="caption" sx={{ ml: 1, color: 'error.main' }}>
                                  (Neaktivan)
                                </Typography>
                              )}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {user.role} - {user.email || 'Bez e-maila'}
                            </Typography>
                          </Box>
                          <Box>
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditUser(user);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmDelete('user', user.id);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      ))
                    )}
                  </Box>
                )}
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2, height: '100%' }}>
                {editingUser ? (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {selectedUser ? 'Uredi korisnika' : 'Novi korisnik'}
                    </Typography>
                    
                    <Grid container spacing={2}>
                      {!selectedUser && (
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Korisničko ime"
                            value={(editingUser as UserCreate).username || ''}
                            onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                            disabled={loading}
                            required
                          />
                        </Grid>
                      )}
                      
                      {!selectedUser && (
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Lozinka"
                            type="password"
                            value={(editingUser as UserCreate).password || ''}
                            onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
                            disabled={loading}
                            required
                          />
                        </Grid>
                      )}
                      
                      {selectedUser && (
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Nova lozinka (ostavite prazno ako ne želite mijenjati)"
                            type="password"
                            value={(editingUser as UserUpdate).password || ''}
                            onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
                            disabled={loading}
                          />
                        </Grid>
                      )}
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="E-mail"
                          type="email"
                          value={editingUser.email || ''}
                          onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                          disabled={loading}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Puno ime"
                          value={editingUser.full_name || ''}
                          onChange={(e) => setEditingUser({...editingUser, full_name: e.target.value})}
                          disabled={loading}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Uloga</InputLabel>
                          <Select
                            value={editingUser.role || 'Viewer'}
                            label="Uloga"
                            onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                            disabled={loading}
                          >
                            <MenuItem value="Admin">Administrator</MenuItem>
                            <MenuItem value="Manager">Manager</MenuItem>
                            <MenuItem value="Viewer">Pregledavatelj</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={editingUser.is_active !== undefined ? editingUser.is_active : true}
                              onChange={(e) => setEditingUser({...editingUser, is_active: e.target.checked})}
                              disabled={loading}
                            />
                          }
                          label="Aktivan korisnik"
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                          <Button 
                            variant="outlined" 
                            onClick={() => setEditingUser(null)}
                            disabled={loading}
                          >
                            Odustani
                          </Button>
                          <Button 
                            variant="contained" 
                            onClick={handleSaveUser}
                            disabled={loading || (
                              !selectedUser && (
                                !(editingUser as UserCreate).username || 
                                !(editingUser as UserCreate).password
                              )
                            )}
                          >
                            {loading ? <CircularProgress size={24} /> : 'Spremi'}
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                ) : selectedUser ? (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {selectedUser.username}
                      {!selectedUser.is_active && (
                        <Typography component="span" variant="caption" sx={{ ml: 1, color: 'error.main' }}>
                          (Neaktivan)
                        </Typography>
                      )}
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">E-mail:</Typography>
                        <Typography variant="body2">{selectedUser.email || 'Nije postavljen'}</Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Puno ime:</Typography>
                        <Typography variant="body2">{selectedUser.full_name || 'Nije postavljeno'}</Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Uloga:</Typography>
                        <Typography variant="body2">{selectedUser.role}</Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Status:</Typography>
                        <Typography variant="body2" color={selectedUser.is_active ? 'success.main' : 'error.main'}>
                          {selectedUser.is_active ? 'Aktivan' : 'Neaktivan'}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Zadnja prijava:</Typography>
                        <Typography variant="body2">
                          {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : 'Nikad'}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Datum kreiranja:</Typography>
                        <Typography variant="body2">
                          {new Date(selectedUser.created_date).toLocaleString()}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                          <Button 
                            variant="outlined" 
                            onClick={() => handleEditUser(selectedUser)}
                            disabled={loading}
                          >
                            Uredi
                          </Button>
                          <Button 
                            variant="outlined" 
                            color="error"
                            onClick={() => confirmDelete('user', selectedUser.id)}
                            disabled={loading}
                          >
                            Obriši
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body1" color="text.secondary">
                      Odaberite korisnika ili kreirajte novog
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      )}
      
      {/* Dialog za potvrdu brisanja */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>
          Potvrda brisanja
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Jeste li sigurni da želite obrisati {itemToDelete?.type === 'config' ? 'konfiguraciju' : 'korisnika'}?
            Ova akcija se ne može poništiti.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>
            Odustani
          </Button>
          <Button 
            onClick={itemToDelete?.type === 'config' ? handleDeleteConfig : handleDeleteUser} 
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Obriši'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;


