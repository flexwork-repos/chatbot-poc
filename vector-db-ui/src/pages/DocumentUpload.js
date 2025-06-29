import React, { useState } from 'react';
import { Box, Typography, Paper, Button, TextField, CircularProgress, Alert, Grid, Chip } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useDropzone } from 'react-dropzone';
import { vectorDbApi } from '../services/api';

const UploadPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
}));

const DropzoneContainer = styled(Box)(({ theme, isDragActive, isDragReject }) => ({
  width: '100%',
  height: 200,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  borderWidth: 2,
  borderRadius: theme.shape.borderRadius,
  borderColor: isDragReject 
    ? theme.palette.error.main 
    : isDragActive 
      ? theme.palette.primary.main 
      : theme.palette.divider,
  borderStyle: 'dashed',
  backgroundColor: isDragActive 
    ? alpha(theme.palette.primary.main, 0.1) 
    : isDragReject 
      ? alpha(theme.palette.error.main, 0.1) 
      : theme.palette.background.default,
  color: theme.palette.text.secondary,
  outline: 'none',
  transition: 'border .24s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
}));

// alpha is now imported from @mui/material/styles

const FilePreview = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  padding: theme.spacing(1, 2),
  marginTop: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
}));

function DocumentUpload() {
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [metadataError, setMetadataError] = useState(false);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setUploadStatus(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'application/json': ['.json'],
    },
    maxFiles: 1,
  });

  const handleMetadataChange = (e) => {
    setMetadata(e.target.value);
    setMetadataError(false);
  };

  const handleUpload = async () => {
    if (!file) return;

    let parsedMetadata = {};
    if (metadata.trim()) {
      try {
        parsedMetadata = JSON.parse(metadata);
        setMetadataError(false);
      } catch (error) {
        setMetadataError(true);
        setUploadStatus({
          success: false,
          message: 'Invalid JSON format in metadata field',
        });
        return;
      }
    }

    setLoading(true);
    try {
      const response = await vectorDbApi.uploadDocument(file, parsedMetadata);
      setUploadStatus({
        success: true,
        message: `Document "${file.name}" uploaded successfully and processed into ${response.chunk_count} chunks`,
      });
      // Reset form after successful upload
      setFile(null);
      setMetadata('');
    } catch (error) {
      setUploadStatus({
        success: false,
        message: error.response?.data?.error || 'Failed to upload document',
      });
    } finally {
      setLoading(false);
    }
  };

  const getSupportedFormats = () => {
    return [
      { name: 'PDF', ext: '.pdf' },
      { name: 'Word', ext: '.docx, .doc' },
      { name: 'Text', ext: '.txt' },
      { name: 'CSV', ext: '.csv' },
      { name: 'JSON', ext: '.json' },
    ];
  };

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: '#fff' }}>
        Upload Documents
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <UploadPaper>
            <Typography variant="h6" gutterBottom>
              Add Document to Vector Database
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upload documents to be processed and added to the vector database for semantic search and RAG.
            </Typography>

            <DropzoneContainer {...getRootProps()} isDragActive={isDragActive} isDragReject={isDragReject}>
              <input {...getInputProps()} />
              <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              {isDragActive ? (
                <Typography>Drop the file here...</Typography>
              ) : (
                <Typography>Drag & drop a file here, or click to select</Typography>
              )}
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                {getSupportedFormats().map((format) => (
                  <Chip 
                    key={format.name} 
                    label={`${format.name} (${format.ext})`} 
                    size="small" 
                    variant="outlined" 
                  />
                ))}
              </Box>
            </DropzoneContainer>

            {file && (
              <FilePreview>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                  <Box>
                    <Typography variant="body2">{file.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(file.size / 1024).toFixed(2)} KB
                    </Typography>
                  </Box>
                </Box>
                <Button 
                  size="small" 
                  color="error" 
                  onClick={() => setFile(null)}
                >
                  Remove
                </Button>
              </FilePreview>
            )}

            <TextField
              label="Custom Metadata (JSON format)"
              multiline
              rows={4}
              value={metadata}
              onChange={handleMetadataChange}
              fullWidth
              margin="normal"
              placeholder='{"category": "finance", "author": "John Doe"}'
              error={metadataError}
              helperText={metadataError ? "Invalid JSON format" : "Optional: Add custom metadata as JSON"}
            />

            <Button
              variant="contained"
              color="primary"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
              onClick={handleUpload}
              disabled={!file || loading}
              sx={{ mt: 2 }}
              fullWidth
            >
              {loading ? 'Uploading...' : 'Upload Document'}
            </Button>

            {uploadStatus && (
              <Alert 
                severity={uploadStatus.success ? "success" : "error"} 
                sx={{ mt: 2, width: '100%' }}
              >
                {uploadStatus.message}
              </Alert>
            )}
          </UploadPaper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Upload Guidelines
            </Typography>
            <Typography variant="body2" paragraph>
              Documents are processed and split into chunks for efficient vector search.
            </Typography>
            
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              Supported File Types:
            </Typography>
            <ul style={{ paddingLeft: '20px' }}>
              <li>PDF documents (.pdf)</li>
              <li>Word documents (.docx, .doc)</li>
              <li>Plain text files (.txt)</li>
              <li>CSV spreadsheets (.csv)</li>
              <li>JSON files (.json)</li>
            </ul>
            
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              Metadata Format:
            </Typography>
            <Typography variant="body2">
              Custom metadata should be in valid JSON format. For example:
            </Typography>
            <Box 
              sx={{ 
                backgroundColor: 'background.default', 
                p: 1, 
                borderRadius: 1, 
                mt: 1,
                fontFamily: 'monospace',
                fontSize: '0.8rem'
              }}
            >
              {`{
  "category": "finance",
  "author": "John Doe",
  "date": "2023-06-01"
}`}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DocumentUpload;
