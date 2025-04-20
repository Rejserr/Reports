import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import theme from './theme';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import AnalysisList from './pages/AnalysisList';
import AnalysisDetail from './pages/AnalysisDetail';
import NewAnalysis from './pages/NewAnalysis';
import Results from './pages/Results';
import RunScript from './pages/RunScript';
import ImportData from './pages/ImportData';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Context providers
import { AuthProvider } from './contexts/AuthContext';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public routes - VAŽNO: Login je unutar AuthProvider */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected routes */}
              <Route element={<AuthLayout />}>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  
                  {/* Analysis routes */}
                  <Route path="/analysis" element={<Analysis />} />
                  <Route path="/analysis/list" element={<AnalysisList />} />
                  <Route path="/analysis/new" element={<NewAnalysis />} />
                  <Route path="/analysis/:id" element={<AnalysisDetail />} />
                  <Route path="/analysis/:id/results" element={<Results />} />
                  
                  {/* Other routes */}
                  <Route path="/run-script" element={<RunScript />} />
                  <Route path="/import-data" element={<ImportData />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Route>
              
              {/* Fallback routes */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;