import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  CircularProgress, 
  Card, 
  CardContent,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Chip,
  Grid,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { vectorDbApi } from '../services/api';

function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [numResults, setNumResults] = useState(5);
  const [searchFilter, setSearchFilter] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [relevancyThreshold, setRelevancyThreshold] = useState(0.0);
  const [filteredCount, setFilteredCount] = useState(0);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // Prepare metadata filter if specified
      let metadataFilter = null;
      if (searchFilter) {
        try {
          metadataFilter = JSON.parse(searchFilter);
        } catch (err) {
          setError('Invalid metadata filter format. Please use valid JSON.');
          setLoading(false);
          return;
        }
      }

      // Call the search API
      const response = await vectorDbApi.searchDocuments(query, numResults, metadataFilter, relevancyThreshold);
      
      if (response && response.documents) {
        // Format results with documents, metadata, and distances
        const formattedResults = response.documents.map((doc, index) => ({
          content: doc,
          metadata: response.metadatas ? response.metadatas[index] : {},
          distance: response.distances ? response.distances[index] : null,
          similarity: response.similarity_scores ? response.similarity_scores[index] : null,
          id: response.ids ? response.ids[index] : `result-${index}`
        }));
        setResults(formattedResults);
        setFilteredCount(response.filtered_count || 0);
      } else {
        setResults([]);
        setFilteredCount(0);
      }
    } catch (err) {
      console.error('Error searching documents:', err);
      setError('Failed to search documents. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleNumResultsChange = (event, newValue) => {
    setNumResults(newValue);
  };

  const formatDistance = (distance) => {
    if (distance === null || distance === undefined) return 'N/A';
    // Convert distance to similarity score (1 - distance) and format as percentage
    const similarity = (1 - distance) * 100;
    return `${similarity.toFixed(1)}%`;
  };

  const getChunkInfo = (metadata) => {
    if (!metadata) return '';
    const chunkIndex = metadata.chunk_index;
    const totalChunks = metadata.total_chunks;
    
    if (chunkIndex !== undefined && totalChunks !== undefined) {
      return `Chunk ${chunkIndex + 1} of ${totalChunks}`;
    }
    return '';
  };

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: '#fff' }}>
        Vector Search
      </Typography>

      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <form onSubmit={handleSearch}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Search Query"
                variant="outlined"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your semantic search query..."
                InputProps={{
                  endAdornment: (
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={loading || !query.trim()}
                      startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                      sx={{ ml: 1 }}
                    >
                      Search
                    </Button>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography gutterBottom>Number of results: {numResults}</Typography>
              <Slider
                value={numResults}
                onChange={handleNumResultsChange}
                aria-labelledby="num-results-slider"
                valueLabelDisplay="auto"
                step={1}
                marks
                min={1}
                max={10}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography gutterBottom>Relevancy threshold: {relevancyThreshold.toFixed(2)}</Typography>
              <Slider
                value={relevancyThreshold}
                onChange={(e, newValue) => setRelevancyThreshold(newValue)}
                aria-labelledby="relevancy-threshold-slider"
                valueLabelDisplay="auto"
                step={0.05}
                marks={[
                  { value: 0, label: '0' },
                  { value: 0.5, label: '0.5' },
                  { value: 1, label: '1' }
                ]}
                min={0}
                max={1}
              />
              <Typography variant="caption" color="text.secondary">
                Higher values return only more relevant results (0 = no filtering)
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Metadata Filter (JSON)"
                variant="outlined"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder='{"category": "finance"}'
                helperText="Optional: Filter results by metadata (JSON format)"
              />
            </Grid>
          </Grid>
        </form>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mt: 4 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {hasSearched && (
              <>
                <Typography variant="h6" gutterBottom>
                  {results.length > 0 
                    ? `Found ${results.length} results for "${query}"`
                    : `No results found for "${query}"`
                  }
                </Typography>
                {filteredCount > 0 && relevancyThreshold > 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {filteredCount} results were filtered out due to relevancy threshold ({relevancyThreshold.toFixed(2)})
                  </Typography>
                )}
              </>
            )}

            {results.map((result, index) => (
              <Card 
                key={result.id || index} 
                sx={{ 
                  mb: 2, 
                  borderRadius: 2,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {result.metadata?.filename || 'Unknown document'}
                    </Typography>
                    <Chip 
                      label={`Relevance: ${result.similarity ? (result.similarity * 100).toFixed(1) + '%' : formatDistance(result.distance)}`} 
                      color="primary" 
                      size="small" 
                      variant="outlined"
                      sx={{ 
                        bgcolor: result.similarity ? `rgba(25, 118, 210, ${result.similarity * 0.3})` : 'transparent',
                        fontWeight: 'medium'
                      }}
                    />
                  </Box>
                  
                  {result.metadata && (
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      {getChunkInfo(result.metadata) && (
                        <Chip 
                          label={getChunkInfo(result.metadata)} 
                          size="small" 
                          color="secondary" 
                          variant="outlined"
                        />
                      )}
                      {result.metadata.upload_date && (
                        <Chip 
                          label={`Uploaded: ${new Date(result.metadata.upload_date).toLocaleDateString()}`} 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                    </Box>
                  )}
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="body2" sx={{ 
                    whiteSpace: 'pre-wrap',
                    backgroundColor: 'background.default',
                    p: 2,
                    borderRadius: 1,
                    maxHeight: '200px',
                    overflow: 'auto'
                  }}>
                    {result.content}
                  </Typography>
                  
                  {Object.keys(result.metadata || {}).length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Metadata:
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        flexWrap: 'wrap',
                        mt: 0.5
                      }}>
                        {Object.entries(result.metadata || {}).map(([key, value]) => {
                          // Skip internal metadata fields
                          if (['filename', 'upload_date', 'chunk_index', 'total_chunks', 'text_length'].includes(key)) {
                            return null;
                          }
                          return (
                            <Chip 
                              key={key} 
                              label={`${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`} 
                              size="small" 
                              variant="outlined"
                            />
                          );
                        })}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </Box>
    </Box>
  );
}

export default Search;
