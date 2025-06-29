import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  TablePagination,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import { vectorDbApi } from '../services/api';

function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [deleteStatus, setDeleteStatus] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [metadataDialogOpen, setMetadataDialogOpen] = useState(false);
  const [selectedMetadata, setSelectedMetadata] = useState({});

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await vectorDbApi.listDocuments();
      setDocuments(response.documents || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (document) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;
    
    try {
      setLoading(true);
      await vectorDbApi.deleteDocument(documentToDelete.filename);
      setDocuments(documents.filter(doc => doc.filename !== documentToDelete.filename));
      setDeleteStatus({
        success: true,
        message: `Document "${documentToDelete.filename}" deleted successfully`
      });
    } catch (err) {
      console.error('Error deleting document:', err);
      setDeleteStatus({
        success: false,
        message: `Failed to delete document: ${err.response?.data?.error || err.message}`
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
      
      // Clear status message after 5 seconds
      setTimeout(() => {
        setDeleteStatus(null);
      }, 5000);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDocumentToDelete(null);
  };

  const handleViewMetadata = (document) => {
    setSelectedMetadata(document.custom_metadata || {});
    setMetadataDialogOpen(true);
  };

  const getFileTypeChip = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    let color = 'default';
    
    switch (extension) {
      case 'pdf':
        color = 'error';
        break;
      case 'docx':
      case 'doc':
        color = 'primary';
        break;
      case 'txt':
        color = 'secondary';
        break;
      case 'csv':
        color = 'success';
        break;
      case 'json':
        color = 'warning';
        break;
      default:
        color = 'default';
    }
    
    return (
      <Chip 
        label={extension.toUpperCase()} 
        color={color} 
        size="small" 
        variant="outlined" 
      />
    );
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'Unknown') return 'Unknown';
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  if (loading && documents.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#fff' }}>
          Document Library
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={fetchDocuments}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Refresh'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {deleteStatus && (
        <Alert 
          severity={deleteStatus.success ? "success" : "error"} 
          sx={{ mb: 3 }}
        >
          {deleteStatus.message}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
          <Table stickyHeader aria-label="document table">
            <TableHead>
              <TableRow>
                <TableCell>File Type</TableCell>
                <TableCell>Filename</TableCell>
                <TableCell align="right">Chunks</TableCell>
                <TableCell>Upload Date</TableCell>
                <TableCell align="center">Metadata</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" sx={{ py: 3 }}>
                      No documents found in the vector database
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                documents
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((document, index) => (
                    <TableRow hover key={index}>
                      <TableCell>{getFileTypeChip(document.filename)}</TableCell>
                      <TableCell component="th" scope="row">
                        {document.filename}
                      </TableCell>
                      <TableCell align="right">{document.chunk_count}</TableCell>
                      <TableCell>{formatDate(document.upload_date)}</TableCell>
                      <TableCell align="center">
                        {Object.keys(document.custom_metadata || {}).length > 0 ? (
                          <Tooltip title="View metadata">
                            <IconButton 
                              size="small" 
                              onClick={() => handleViewMetadata(document)}
                              color="primary"
                            >
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            None
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <Tooltip title="Search this document">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => {
                                // Navigate to search page with this document pre-selected
                                // This would be implemented with React Router
                              }}
                            >
                              <SearchIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete document">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteClick(document)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={documents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the document "{documentToDelete?.filename}"? 
            This action cannot be undone and will remove all {documentToDelete?.chunk_count} chunks from the vector database.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Metadata Dialog */}
      <Dialog
        open={metadataDialogOpen}
        onClose={() => setMetadataDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Document Metadata</DialogTitle>
        <DialogContent>
          {Object.keys(selectedMetadata).length === 0 ? (
            <DialogContentText>No custom metadata available for this document.</DialogContentText>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Key</TableCell>
                    <TableCell>Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(selectedMetadata).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell component="th" scope="row">
                        {key}
                      </TableCell>
                      <TableCell>
                        {typeof value === 'object' 
                          ? JSON.stringify(value) 
                          : String(value)
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMetadataDialogOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DocumentList;
