import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, CircularProgress, Card, CardContent } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import StorageIcon from '@mui/icons-material/Storage';
import DescriptionIcon from '@mui/icons-material/Description';
import SearchIcon from '@mui/icons-material/Search';
import { vectorDbApi } from '../services/api';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
}));

const StatCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  height: '100%',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
  },
}));

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dbStatus, setDbStatus] = useState({
    status: 'unknown',
    collection_count: 0,
    collection_name: '',
  });
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null); // Clear any previous errors
        
        // Fetch vector DB status
        const statusResponse = await vectorDbApi.getStatus();
        console.log('Status response:', statusResponse);
        setDbStatus(statusResponse);

        // Fetch document list
        const documentsResponse = await vectorDbApi.listDocuments();
        console.log('Documents response:', documentsResponse);
        
        // Check if the response has the expected structure
        if (documentsResponse && documentsResponse.documents) {
          setDocuments(documentsResponse.documents);
        } else {
          // Handle case where documents array might be missing
          setDocuments([]);
          console.warn('Documents response missing expected structure:', documentsResponse);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare chart data
  const chartData = {
    labels: ['PDF', 'DOCX', 'TXT', 'CSV', 'JSON', 'Other'],
    datasets: [
      {
        label: 'Document Types',
        data: [
          documents.filter(doc => doc.filename.toLowerCase().endsWith('.pdf')).length,
          documents.filter(doc => doc.filename.toLowerCase().endsWith('.docx')).length,
          documents.filter(doc => doc.filename.toLowerCase().endsWith('.txt')).length,
          documents.filter(doc => doc.filename.toLowerCase().endsWith('.csv')).length,
          documents.filter(doc => doc.filename.toLowerCase().endsWith('.json')).length,
          documents.filter(doc => {
            const ext = doc.filename.split('.').pop().toLowerCase();
            return !['pdf', 'docx', 'txt', 'csv', 'json'].includes(ext);
          }).length,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Calculate total chunks
  const totalChunks = documents.reduce((sum, doc) => sum + doc.chunk_count, 0);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: '#fff' }}>
        Vector Database Dashboard
      </Typography>

      <Grid container spacing={4}>
        {/* Database Status Card */}
        <Grid item xs={12} md={4}>
          <StatCard>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
              <StorageIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="div" gutterBottom>
                Database Status
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                {dbStatus.status === 'success' ? 'Connected' : 'Disconnected'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Collection: {dbStatus.collection_name || 'N/A'}
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>

        {/* Document Count Card */}
        <Grid item xs={12} md={4}>
          <StatCard>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
              <DescriptionIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h5" component="div" gutterBottom>
                Documents
              </Typography>
              <Typography variant="h3" color="text.primary" sx={{ mb: 1, fontWeight: 'bold' }}>
                {documents.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Chunks: {totalChunks}
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>

        {/* Search Card */}
        <Grid item xs={12} md={4}>
          <StatCard>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
              <SearchIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" component="div" gutterBottom>
                Vector Search
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                Ready for semantic search
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Embedding model: All-MiniLM-L6-v2
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>

        {/* Document Types Chart */}
        <Grid item xs={12} md={6}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Document Types
            </Typography>
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {documents.length > 0 ? (
                <Doughnut 
                  data={chartData} 
                  options={{ 
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                      }
                    }
                  }} 
                />
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No documents available
                </Typography>
              )}
            </Box>
          </Item>
        </Grid>

        {/* Recent Documents */}
        <Grid item xs={12} md={6}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Recent Documents
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {documents.length > 0 ? (
                documents.slice(0, 5).map((doc, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      p: 2, 
                      mb: 1, 
                      borderRadius: 1, 
                      backgroundColor: 'background.default',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Box>
                      <Typography variant="body1">{doc.filename}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Chunks: {doc.chunk_count}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(doc.upload_date).toLocaleDateString()}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No documents available
                </Typography>
              )}
            </Box>
          </Item>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
