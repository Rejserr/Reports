import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia
} from '@mui/material';

import {
  Assessment as AssessmentIcon,
  CloudUpload as CloudUploadIcon,
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

const Home: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Box> 
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'grey.800',
          color: '#fff',
          mb: 4,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: `url('/assets/images/warehouse.jpeg')`,
          p: 6
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,.5)',
            
          }}
        />
        <Box
          sx={{
            position: 'relative',
            maxWidth: 'md',
          }}
        >
          <Typography component="h1" variant="h3" color="inherit" gutterBottom>
            ABC-XYZ alat za analizu podataka robe
          </Typography>
          <Typography variant="h5" color="inherit" paragraph>
            Optimizirajte svoj lager robe sa naprednom ABC-XYZ kategorizacijom 
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/dashboard')}
            startIcon={<DashboardIcon />}
          >
            Idi na Dashboard
          </Button>
        </Box>
      </Paper>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
              component="img"
              height="140"
              image="/assets/images/analysis.jpg"
              alt="Analiza"
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography gutterBottom variant="h5" component="h2">
                Pokreni Analizu
              </Typography>
              <Typography>
                Izradi novu ABC-XYZ analizu za kategorizaciju zaliha na temelju vrijednosti i varijabilnosti.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                startIcon={<AssessmentIcon />}
                onClick={() => navigate('/analyses/new')}
              >
                Nova analiza
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
              component="img"
              height="140"
              image="/assets/images/data.jpg"
              alt="Podaci"
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography gutterBottom variant="h5" component="h2">
                Import Data
              </Typography>
              <Typography>
                Prenesite svoje podatke o zalihama i transakcijama kako biste ih mogli koristiti u analizi
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                startIcon={<CloudUploadIcon />}
                onClick={() => navigate('/import')}
              >
                Uvezi Podatke
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
              component="img"
              height="140"
              image="/assets/images/report.jpg"
              alt="Izvještaji"
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography gutterBottom variant="h5" component="h2">
                Pregled izvještaja
              </Typography>
              <Typography>
                Pristupite detaljnim izvještajima i vizualizacijama analize svojih zaliha.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                startIcon={<TrendingUpIcon />}
                onClick={() => navigate('/reports')}
              >
                Pregled izvještaja
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
      
      <Grid container spacing={4} sx={{ mt: 6, mb: 4 }}>
        {/* ABC Analiza kartica */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)' }}>
            <CardMedia
              component="img"
              height="140"
              image="/assets/images/abc-analysis.jpg"
              alt="ABC Analiza"
            />
            <CardContent sx={{ flexGrow: 1, p: 3 }}>
              <Typography gutterBottom variant="h5" component="h2">
                ABC Analiza
              </Typography>
              <Typography variant="body1" paragraph>
                ABC analiza je metoda kategorizacije zaliha koja se sastoji od podjele artikala u tri kategorije: 
                A, B i C. Artikli klase 'A' su najvrjedniji, 'B' artikli su srednje vrijednosti, dok su 'C' artikli najmanje vrijedni.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ova metoda pomaže u optimizaciji upravljanja zalihama fokusiranjem na najvažnije artikle.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                startIcon={<AssessmentIcon />}
                onClick={() => navigate('/analysis')}
              >
                Saznaj više
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* XYZ Analiza kartica */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)' }}>
            <CardMedia
              component="img"
              height="140"
              image="/assets/images/xyz-analysis.jpg"
              alt="XYZ Analiza"
            />
            <CardContent sx={{ flexGrow: 1, p: 3 }}>
              <Typography gutterBottom variant="h5" component="h2">
                XYZ Analiza
              </Typography>
              <Typography variant="body1" paragraph>
                XYZ analiza kategorizira artikle na temelju varijabilnosti potražnje. 
                Artikli 'X' kategorije imaju stabilnu potražnju, 'Y' artikli imaju određenu varijabilnost, dok 'Z' artikli imaju vrlo promjenjivu potražnju.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ova metoda omogućuje bolje planiranje zaliha na temelju predvidljivosti potražnje.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                startIcon={<TrendingUpIcon />}
                onClick={() => navigate('/analysis')}
              >
                Saznaj više
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Kombinirana ABC-XYZ kartica */}
        <Grid item xs={12}>
          <Card sx={{ display: 'flex', flexDirection: 'column', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography gutterBottom variant="h5" component="h2">
                Kombinirana ABC-XYZ Analiza
              </Typography>
              <Typography variant="body1">
                Kombiniranjem ovih dviju metoda dobiva se moćan alat za upravljanje i optimizaciju zaliha. 
                Ova kombinacija omogućuje detaljniju kategorizaciju artikala i prilagođene strategije upravljanja za svaku kategoriju.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                startIcon={<DashboardIcon />}
                onClick={() => navigate('/dashboard')}
              >
                Pregledaj primjere
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box> 
  );
};

export default Home;
