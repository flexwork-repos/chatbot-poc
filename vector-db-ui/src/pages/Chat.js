import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  CircularProgress, 
  Avatar,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { vectorDbApi } from '../services/api';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [useRag, setUseRag] = useState(true);
  const [modelName, setModelName] = useState("gpt-4.1-nano");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to chat
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMessage,
      timestamp: new Date().toISOString()
    }]);
    
    setLoading(true);
    
    try {
      // Call the chat API with RAG option and LLM parameters
      const response = await vectorDbApi.sendChatMessage(
        userMessage, 
        useRag,
        modelName,
        temperature,
        maxTokens
      );
      console.log('Chat API response:', response);
      
      // Check for content in the response (backend returns {content: "message text"})
      if (response && response.content) {
        // Add assistant message to chat
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: response.content,
          timestamp: new Date().toISOString(),
          context: response.context || null,
          model: modelName,
          temperature: temperature,
          max_tokens: maxTokens
        }]);
      } else if (response && response.message) {
        // Fallback for old format
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: response.message,
          timestamp: new Date().toISOString(),
          context: response.context || null,
          model: modelName,
          temperature: temperature,
          max_tokens: maxTokens
        }]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      // Add error message
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: 'Sorry, there was an error processing your request. Please try again.',
        error: true,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const formatTimestamp = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch (e) {
      return '';
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#fff' }}>
          Chat
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch 
                checked={useRag} 
                onChange={(e) => setUseRag(e.target.checked)} 
                color="primary"
              />
            }
            label="Use RAG"
          />
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => setShowSettings(!showSettings)}
            sx={{ ml: 1, mr: 1 }}
          >
            {showSettings ? 'Hide Settings' : 'LLM Settings'}
          </Button>
          <Tooltip title="Clear chat history">
            <IconButton 
              color="error" 
              onClick={handleClearChat}
              disabled={messages.length === 0}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {showSettings && (
        <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            LLM Parameters
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="model-select-label">Model</InputLabel>
              <Select
                labelId="model-select-label"
                value={modelName}
                label="Model"
                onChange={(e) => setModelName(e.target.value)}
              >
                <MenuItem value="gpt-4.1-nano">GPT-4.1 Nano</MenuItem>
                <MenuItem value="gpt-4o">GPT-4o</MenuItem>
                <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo</MenuItem>
                <MenuItem value="claude-3-opus-20240229">Claude 3 Opus</MenuItem>
                <MenuItem value="claude-3-sonnet-20240229">Claude 3 Sonnet</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ width: '100%', mb: 2 }}>
              <Typography id="temperature-slider" gutterBottom>
                Temperature: {temperature}
              </Typography>
              <Slider
                aria-labelledby="temperature-slider"
                value={temperature}
                onChange={(e, newValue) => setTemperature(newValue)}
                step={0.1}
                marks
                min={0}
                max={1}
                valueLabelDisplay="auto"
              />
            </Box>

            <Box sx={{ width: '100%', mb: 2 }}>
              <Typography id="max-tokens-slider" gutterBottom>
                Max Tokens: {maxTokens}
              </Typography>
              <Slider
                aria-labelledby="max-tokens-slider"
                value={maxTokens}
                onChange={(e, newValue) => setMaxTokens(newValue)}
                step={100}
                marks
                min={100}
                max={4000}
                valueLabelDisplay="auto"
              />
            </Box>
          </Box>
        </Paper>
      )}

      <Paper 
        sx={{ 
          flexGrow: 1, 
          mb: 2, 
          p: 2, 
          borderRadius: 2, 
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper'
        }}
      >
        {messages.length === 0 ? (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%',
              color: 'text.secondary'
            }}
          >
            <SmartToyIcon sx={{ fontSize: 60, mb: 2, opacity: 0.7 }} />
            <Typography variant="h6">
              Start a conversation
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
              {useRag ? 
                "RAG is enabled. Your questions will be answered using context from the vector database." :
                "RAG is disabled. Responses will be generated without using the vector database context."
              }
            </Typography>
          </Box>
        ) : (
          messages.map((message, index) => (
            <Box 
              key={index} 
              sx={{ 
                display: 'flex', 
                mb: 2,
                flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
              }}
            >
              <Avatar 
                sx={{ 
                  bgcolor: message.role === 'user' ? 'primary.main' : 
                          message.role === 'system' ? 'error.main' : 'secondary.main',
                  width: 40,
                  height: 40,
                  mr: message.role === 'user' ? 0 : 1,
                  ml: message.role === 'user' ? 1 : 0
                }}
              >
                {message.role === 'user' ? <PersonIcon /> : <SmartToyIcon />}
              </Avatar>
              
              <Card 
                sx={{ 
                  maxWidth: '80%',
                  borderRadius: 2,
                  bgcolor: message.role === 'user' ? 'primary.dark' : 
                          message.error ? 'error.dark' : 'background.default'
                }}
              >
                <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                  <Typography variant="body1" component="div">
                    {message.content}
                  </Typography>
                  
                  {message.context && (
                    <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                      <Typography variant="caption" color="text.secondary">
                        Sources used:
                      </Typography>
                      <Typography variant="caption" component="div" sx={{ 
                        mt: 0.5,
                        fontSize: '0.7rem',
                        color: 'text.disabled',
                        maxHeight: '100px',
                        overflow: 'auto',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {message.context}
                      </Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: message.role === 'user' ? 'flex-start' : 'space-between',
                    alignItems: 'center',
                    mt: 0.5
                  }}>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ fontSize: '0.7rem' }}
                    >
                      {formatTimestamp(message.timestamp)}
                    </Typography>
                    
                    {message.role === 'assistant' && message.model && (
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ fontSize: '0.7rem', ml: 1 }}
                      >
                        {message.model} (t:{message.temperature?.toFixed(1)}, max:{message.max_tokens})
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))
        )}
        <div ref={messagesEndRef} />
      </Paper>

      <Paper 
        component="form" 
        onSubmit={handleSendMessage}
        sx={{ 
          p: 1, 
          display: 'flex', 
          alignItems: 'center',
          borderRadius: 2
        }}
      >
        <TextField
          fullWidth
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          variant="outlined"
          disabled={loading}
          autoFocus
          sx={{ mr: 1 }}
        />
        <Button
          variant="contained"
          color="primary"
          endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
          type="submit"
          disabled={loading || !input.trim()}
        >
          Send
        </Button>
      </Paper>
    </Box>
  );
}

export default Chat;
