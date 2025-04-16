import React, { useState, useEffect, useRef } from "react";
import "./ChatApp.css";
import {
  Grid,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  AppBar,
  Toolbar,
  Box,
  Container,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import SettingsIcon from "@mui/icons-material/Settings";
import axios from "axios";

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("User");
  const [openSettings, setOpenSettings] = useState(false);
  const [tempUsername, setTempUsername] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const name = null;
    setUsername(name);
    setTempUsername(name);
    fetchMessages();

    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // scrollToBottom();
  }, [messages]);

  //   API Using Local Host

    const fetchMessages = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/messages");
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    const sendMessage = async () => {
      if (newMessage.trim() === "") return;

      const message = {
        text: newMessage,
        sender: username,
        timestamp: new Date().toISOString(),
      };

      try {
        await axios.post("http://localhost:5000/api/messages", message);
        setNewMessage("");
        fetchMessages();
      } catch (error) {
        console.error("Error sending message:", error);
      }
    };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSettingsOpen = () => {
    setTempUsername(username);
    setOpenSettings(true);
  };

  const handleSettingsClose = () => {
    setOpenSettings(false);
  };

  const handleUsernameSave = () => {
    if (tempUsername.trim()) {
      setUsername(tempUsername);
      setOpenSettings(false);
    }
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        p: 0,
      }}
    >
      {/* Header with username and settings */}
      <AppBar
        position="static"
        sx={{
          background: (theme) => `
            linear-gradient(360deg, #000000 0%, #717171 50%, #1e1e1e 100%)
        `,
          backgroundSize: "200% 200%",
          animation: "gradientShift 15s ease infinite",
          "@keyframes gradientShift": {
            "0%": {
              backgroundPosition: "0% 50%",
            },
            "50%": {
              backgroundPosition: "100% 50%",
            },
            "100%": {
              backgroundPosition: "0% 50%",
            },
          },
        }}
      >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <b>Anonymous - Chat</b> {username && `(${username})`}
          </Typography>
          <IconButton color="inherit" onClick={handleSettingsOpen}>
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Settings Dialog */}
      <Dialog open={openSettings} onClose={handleSettingsClose}>
        <Box
          sx={{
            background: (theme) => `
                linear-gradient(332deg, rgb(75 75 75) 0%, rgb(255, 255, 255) 50%, rgb(123 123 123) 100%);
          `,
            backgroundSize: "200% 200%",
            animation: "gradientShift 15s ease infinite",
            "@keyframes gradientShift": {
              "0%": {
                backgroundPosition: "0% 50%",
              },
              "50%": {
                backgroundPosition: "100% 50%",
              },
              "100%": {
                backgroundPosition: "0% 50%",
              },
            },
          }}
        >
          <DialogTitle>Change Username</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Username"
              type="text"
              fullWidth
              variant="standard"
              value={tempUsername}
              onChange={(e) => setTempUsername(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSettingsClose}>Cancel</Button>
            <Button onClick={handleUsernameSave}>Save</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Chat messages area */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: "auto",
          p: 2,
          background: (theme) => `
    linear-gradient(135deg, #000000 0%, #717171 50%, #1e1e1e 100%)
  `,
          backgroundSize: "200% 200%",
          animation: "gradientShift 15s ease infinite",
          "@keyframes gradientShift": {
            "0%": {
              backgroundPosition: "0% 50%",
            },
            "50%": {
              backgroundPosition: "100% 50%",
            },
            "100%": {
              backgroundPosition: "0% 50%",
            },
          },
        }}
      >
        <List
          sx={{
            width: "100%",
            marginBottom: '10px',
            // Add slight transparency to messages for better gradient visibility
            "& .MuiListItem-root": {
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              borderRadius: "8px",
              backdropFilter: "blur(2px)",
            },
          }}
        >
          {messages.map((msg, index) => (
            <ListItem
              key={index}
              sx={{
                justifyContent:
                  msg.sender === username ? "flex-end" : "flex-start",
                px: 0,
                backgroundColor: "transparent !important",
                backdropFilter: "none !important",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems:
                    msg.sender === username ? "flex-end" : "flex-start",
                  width: "100%",
                }}
              >
                <Typography variant="caption" color="white">
                  <span style={{ color: "#00d9ff" }}>
                    {" "}
                    {msg.sender === username ? "You" : msg.sender} •{" "}
                  </span>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </Typography>
                <Paper
                  elevation={15}
                  sx={{
                    p: 1,
                    backgroundColor:
                      msg.sender === username ? "#cbffcb" : "white",
                    maxWidth: "80%",
                    wordBreak: "break-word",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                  }}
                >
                  <ListItemText primary={msg.text} />
                </Paper>
              </Box>
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>

        {/* Enhanced Floating Button */}
<Box sx={{
  position: 'fixed',
  bottom: 75,
  right: 20,
  zIndex: 1000,
  animation: 'pulse 2s infinite',
  '@keyframes pulse': {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.1)' },
    '100%': { transform: 'scale(1)' }
  }
}}>
    <KeyboardDoubleArrowDownIcon sx={{fontSize: '15px', background: 'white', borderRadius:'50%', padding: '5px'}}/>
</Box>


      </Box>

      {/* Fixed input area at bottom */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          background: (theme) => `
    linear-gradient(360deg, #000000 0%, #717171 50%, #1e1e1e 100%)
  `,
          backgroundSize: "200% 200%",
          animation: "gradientShift 15s ease infinite",
          "@keyframes gradientShift": {
            "0%": {
              backgroundPosition: "0% 50%",
            },
            "50%": {
              backgroundPosition: "100% 50%",
            },
            "100%": {
              backgroundPosition: "0% 50%",
            },
          },
        }}
      >
        <Grid item xs={12} md={12} sm={12}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            multiline
            maxRows={1}
            size="small"
            sx={{
              width: "65vw",
              borderRadius: "5px",
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": {
                  borderColor: "white", // default border color
                },
                "&:hover fieldset": {
                  borderColor: "white", // on hover
                },
                "&.Mui-focused fieldset": {
                  borderColor: "white", // on focus
                },
              },
            }}
          />
        </Grid>
        <Grid item xs={2}>
          <Button
            fullWidth
            variant="contained"
            onClick={sendMessage}
            sx={{ height: "38px", background: "white" }}
          >
            <SendIcon sx={{ color: "black" }} />
          </Button>
        </Grid>
      </Box>
    </Container>
  );
};

export default ChatApp;
