import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Grid, 
  Switch, 
  FormControlLabel,
  TextField,
  Divider,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress
} from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { vectorDbApi } from '../services/api';

function Settings() {
  const [ragEnabled, setRagEnabled] = useState(true);
  const [apiEndpoint, setApiEndpoint] = useState('http://localhost:3001');
  const [chunkSize, setChunkSize] = useState(1000);
  const [chunkOverlap, setChunkOverlap] = useState(100);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSaveSettings = () => {
    // In a real app, this would save to localStorage or backend
    setStatus({
      type: 'success',
      message: 'Settings saved successfully'
    });
    
    // Clear status after 3 seconds
    setTimeout(() => {
      setStatus(null);
    }, 3000);
  };

  const handleResetDatabase = async () => {
    setLoading(true);
    try {
      await vectorDbApi.resetDatabase();
      setStatus({
        type: 'success',
        message: 'Vector database reset successfully. All documents have been removed.'
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: `Failed to reset database: ${error.message}`
      });
    } finally {
      setLoading(false);
      setResetDialogOpen(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: '#fff' }}>
        Settings
      </Typography>

      {status && (
        <Alert 
          severity={status.type} 
          sx={{ mb: 3 }}
          onClose={() => setStatus(null)}
        >
          {status.message}
        </Alert>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              RAG Configuration
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <FormControlLabel
              control={
                <Switch 
                  checked={ragEnabled} 
                  onChange={(e) => setRagEnabled(e.target.checked)} 
                  color="primary"
                />
              }
              label="Enable RAG for chat responses"
              sx={{ mb: 2, display: 'block' }}
            />

            <TextField
              fullWidth
              label="Chunk Size"
              type="number"
              value={chunkSize}
              onChange={(e) => setChunkSize(Number(e.target.value))}
              InputProps={{ inputProps: { min: 100, max: 2000 } }}
              helperText="Number of characters per chunk (100-2000)"
              margin="normal"
            />

            <TextField
              fullWidth
              label="Chunk Overlap"
              type="number"
              value={chunkOverlap}
              onChange={(e) => setChunkOverlap(Number(e.target.value))}
              InputProps={{ inputProps: { min: 0, max: 500 } }}
              helperText="Overlap between chunks in characters (0-500)"
              margin="normal"
            />

            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSaveSettings}
              sx={{ mt: 2 }}
            >
              Save Settings
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              API Configuration
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <TextField
              fullWidth
              label="API Endpoint"
              value={apiEndpoint}
              onChange={(e) => setApiEndpoint(e.target.value)}
              helperText="Backend API endpoint URL"
              margin="normal"
            />

            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSaveSettings}
              sx={{ mt: 2 }}
            >
              Save API Settings
            </Button>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 2, mt: 4, bgcolor: 'error.dark' }}>
            <Typography variant="h6" gutterBottom color="white">
              Danger Zone
            </Typography>
            <Divider sx={{ mb: 3, borderColor: 'rgba(255,255,255,0.2)' }} />

            <Typography variant="body2" color="white" paragraph>
              Resetting the vector database will permanently delete all documents and their embeddings.
              This action cannot be undone.
            </Typography>

            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteForeverIcon />}
              onClick={() => setResetDialogOpen(true)}
              sx={{ 
                mt: 1, 
                bgcolor: 'background.paper',
                '&:hover': {
                  bgcolor: 'background.default',
                }
              }}
            >
              Reset Vector Database
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Reset Database Confirmation Dialog */}
      <Dialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeleteForeverIcon color="error" />
            Confirm Database Reset
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you absolutely sure you want to reset the vector database? 
            This will permanently delete all documents and their embeddings. 
            This action CANNOT be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setResetDialogOpen(false)} 
            color="primary"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleResetDatabase} 
            color="error" 
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RestartAltIcon />}
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Database'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Settings;
