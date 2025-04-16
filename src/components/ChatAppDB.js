import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import "./ChatApp.css";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
  AppBar,
  Toolbar,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import SettingsIcon from "@mui/icons-material/Settings";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import { fetchMessages, appendMessageToArray } from "../services/api-service";
import { userDetails } from "../constants/user-details";
import SnackbarComponent from "../common/SnackbarComponent";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { notificationSound, textToSpeak } from "../enhancements/enhancements";

// Memoized Message Component to prevent unnecessary re-renders
const MemoizedMessage = React.memo(({ msg, activeUserDetails }) => {
  const handleSpeakClick = () => {
    textToSpeak(msg.text);
  };

  return (
    <ListItem
      sx={{
        justifyContent:
          msg.sender === activeUserDetails.name ? "flex-end" : "flex-start",
        px: 0,
        animation: `${
          msg.sender === activeUserDetails.name ? "slideInRight" : "slideInLeft"
        } 0.8s ease-out forwards`,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems:
            msg.sender === activeUserDetails.name ? "flex-end" : "flex-start",
          width: "100%",
        }}
      >
        <Typography
          variant="caption"
          color="white"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <span style={{ color: "#00d9ff" }}>
            {msg.sender === activeUserDetails.name
              ? activeUserDetails.username.split(" ")[0] + " You"
              : msg.username}{" "}
            •
          </span>
          <div style={{ display: "grid", marginLeft: "5px" }}>
            <span style={{ fontSize: "10px" }}>{msg.time}</span>
          </div>
        </Typography>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
          <Paper
            elevation={15}
            sx={{
              pr: 1,
              pl: 1,
              borderRadius: "100px",
              backgroundColor:
                msg.sender === activeUserDetails.name ? "#cbffcb" : "white",
              maxWidth: "80%",
              wordBreak: "break-word",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "scale(1.02)",
                boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)",
              },
            }}
          >
            <ListItemText
              primary={msg.text}
              primaryTypographyProps={{
                fontSize: "0.85rem",
                textAlign: "center",
                padding: msg.text.length > 100 ? "15px" : "0px",
              }}
            />
          </Paper>

          {msg.sender !== activeUserDetails.name && (
            <VolumeUpIcon
              onClick={handleSpeakClick}
              sx={{
                fontSize: "1rem",
                color: "white",
                mb: "2px",
                cursor: "pointer",
              }}
            />
          )}
        </div>
      </Box>
    </ListItem>
  );
});

const ChatAppDB = () => {
  // All the States
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [openSettings, setOpenSettings] = useState(false);
  const [tempUsername, setTempUsername] = useState("");
  const messagesEndRef = useRef(null);
  const [activeUserDetails, setActiveUserDetails] = useState({});
  const listRef = useRef(null);
  const totalMsg = useRef(0);

  // Memoize formatted date function
  const getFormattedDate = useCallback((date = new Date()) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }, []);

  // Throttled scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, []);

  // Memoized fetch function
  const fetchDBMessages = useCallback(async () => {
    try {
      const messages = await fetchMessages();

      if (totalMsg.current !== messages.length) {
        if (
          localStorage.getItem("global-chat-username") !==
          messages[messages.length - 1].sender
        ) {
          let notificationAudioPath = userDetails.filter(
            (data) => data.name === messages[messages.length - 1].sender
          )[0].notification;
          notificationSound(notificationAudioPath);
        }
        totalMsg.current = messages.length;
      }
      setMessages((prevMessages) => {
        // Only update if messages actually changed
        if (JSON.stringify(prevMessages) !== JSON.stringify(messages)) {
          return messages;
        }
        return prevMessages;
      });
    } catch (error) {
      console.error("Error fetching messages:");
    }
  }, []);

  // Initialize component
  useEffect(() => {
    const localUsername = localStorage.getItem("global-chat-username");
    if (!localUsername) {
      getRandomUsername();
      handleSettingsOpen();
    } else {
      if (userDetails.map((data) => data.name).includes(localUsername)) {
        setTempUsername(localUsername);
        const localData = userDetails.find(
          (data) => data.name === localUsername
        );
        setActiveUserDetails(localData);
      } else {
        localStorage.removeItem("global-chat-username");
        handleSettingsOpen();
      }
    }

    // Initial fetch
    fetchDBMessages();

    // Set up polling with cleanup
    const interval = setInterval(fetchDBMessages, 2000);
    return () => clearInterval(interval);
  }, [fetchDBMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const sendMessage = useCallback(async () => {
    if (newMessage.trim() === "") return;

    scrollToBottom();
    setTimeout(() => {
      scrollToBottom();
    }, 1000);

    const isoString = new Date().toISOString();
    const localDate = new Date(isoString);

    const formattedTime = localDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const message = {
      text: newMessage,
      sender: activeUserDetails.name,
      username: activeUserDetails.username,
      date: getFormattedDate(),
      time: formattedTime,
    };

    try {
      // Send to server
      await appendMessageToArray(1, message);

      // Optimistic update
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Please check your internet !!");
      // Rollback optimistic update if needed
      setMessages((prev) => prev.slice(0, -1));
    }
  }, [newMessage, activeUserDetails, getFormattedDate]);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
        scrollToBottom();
        setTimeout(() => {
          scrollToBottom();
        }, 1000);
      }
    },
    [sendMessage]
  );

  const handleSettingsOpen = useCallback(() => {
    const localUsername = localStorage.getItem("global-chat-username");
    if(localUsername)
    setTempUsername(localUsername)
    setOpenSettings(true);
  }, []);

  const handleSettingsClose = useCallback(() => {
    const localUsername = localStorage.getItem("global-chat-username");
    if (!localUsername) {
      handleSettingsOpen();
    } else {
      setOpenSettings(false);
    }
  }, [handleSettingsOpen]);

  const handleUsernameSave = useCallback(() => {
    if(tempUsername)
    if (tempUsername.trim()) {
      const selectedUser = userDetails.find(
        (data) => data.name === tempUsername
      );
      if (selectedUser) {
        setActiveUserDetails(selectedUser);
        setOpenSettings(false);
        localStorage.setItem("global-chat-username", tempUsername);
      }
    }
  }, [tempUsername]);

  const getRandomUsername = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * userDetails.length);
    setTempUsername(userDetails[randomIndex].name);
  }, []);

  // Memoize gradient styles to prevent unnecessary recalculations
  const gradientStyles = useMemo(
    () => ({
      background:
        "linear-gradient(360deg, #000000 0%, #717171 50%, #1e1e1e 100%)",
      backgroundSize: "200% 200%",
      animation: "gradientShift 15s ease infinite",
      "@keyframes gradientShift": {
        "0%": { backgroundPosition: "0% 50%" },
        "50%": { backgroundPosition: "100% 50%" },
        "100%": { backgroundPosition: "0% 50%" },
      },
    }),
    []
  );

  const videoList = ["/chat_backgrounds/chat_bg1.mp4"];

  const [currentVideo, setCurrentVideo] = useState(videoList[0]);
  const videoRef = useRef(null);

  // Randomly switch video every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const nextVideo = videoList[Math.floor(Math.random() * videoList.length)];
      setCurrentVideo(nextVideo);
    }, 15000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    setVh();
    window.addEventListener("resize", setVh);

    return () => window.removeEventListener("resize", setVh);
  }, []);


  return (
    <Container
      maxWidth="md"
      sx={{
        height: "calc(var(--vh, 1vh) * 100)", // dynamic viewport height
        overflow: "hidden",
        padding: "0px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header with username and settings */}
      <AppBar
        position="static"
        sx={{
          background:
            "linear-gradient(180deg,rgba(38, 38, 41, 1) 11%, rgba(29, 146, 181, 1) 100%)",
          boxShadow: "2px 2px 10px white",
        }}
      >
        <Toolbar>
          <Typography variant="h7" component="div" sx={{ flexGrow: 1 }}>
            <b>Anonymous - Chat</b>{" "}
            {activeUserDetails.name && `(${activeUserDetails.name})`}
          </Typography>
          <IconButton color="inherit" onClick={handleSettingsOpen}>
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Settings Dialog */}
      <Dialog open={openSettings} onClose={handleSettingsClose}>
        <Box>
          <DialogTitle>Change Username</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              type="text"
              fullWidth
              variant="standard"
              value={tempUsername}
              onChange={(e) => setTempUsername(e.target.value)}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={getRandomUsername}
                      className={"rotating-square"}
                      size="small"
                      sx={{
                        width: 30,
                        height: 30,
                        color: "black",
                        padding: "8px",
                      }}
                    >
                      <ChangeCircleIcon fontSize="medium" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSettingsClose}>Cancel</Button>
            <Button onClick={handleUsernameSave}>Save</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Chat messages area - Using virtualization would be better for very large lists */}
      <Box
        ref={listRef}
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          overflowX: "hidden",
          p: 3,
          pb: 3,
          height: "90vh",
        }}
      >
        <video
          key={currentVideo}
          ref={videoRef}
          src={currentVideo}
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            minWidth: "100%",
            minHeight: "100%",
            objectFit: "cover",
            opacity: "0.9",
            filter: "brightness(0.3)",
            zIndex: -1,
          }}
        />

        <List sx={{ width: "100%", position: "relative", zIndex: 5 }}>
          {messages.map((msg, index) => (
            <MemoizedMessage
              key={`${msg.date}-${msg.time}-${msg.sender}-${index}`}
              msg={msg}
              activeUserDetails={activeUserDetails}
            />
          ))}
          <div ref={messagesEndRef} />
        </List>

        {/* Floating scroll button */}
        <Box
          sx={{
            position: "fixed",
            bottom: 80,
            right: 20,
            zIndex: 1000,
            animation: "pulse 2s infinite, float 3s ease-in-out infinite",
          }}
        >
          <IconButton
            onClick={scrollToBottom}
            sx={{
              background: "white",
              borderRadius: "50%",
              padding: "5px",
              "&:hover": {
                background: "#00d9ff",
                "& svg": { color: "black" },
              },
            }}
          >
            <KeyboardDoubleArrowDownIcon
              fontSize="small"
              sx={{ color: "black" }}
            />
          </IconButton>
        </Box>
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          background:
            "linear-gradient(0deg,rgba(38, 38, 41, 1) 21%, rgba(29, 146, 181, 1) 100%)",
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          boxShadow: "0px -2px 10px white",
          position: "sticky",
          bottom: 0,
          zIndex: 1,
        }}
      >
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            multiline
            maxRows={2}
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "white",
                borderRadius: "100px",
                "& fieldset": {
                  borderColor: "white",
                  transition: "all 0.3s",
                },
                "&:hover fieldset": {
                  borderColor: "#00d9ff",
                  boxShadow: "0 0 8px rgba(0, 217, 255, 0.5)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#00d9ff",
                  boxShadow: "0 0 12px rgba(0, 217, 255, 0.7)",
                },
              },
            }}
          />
        </Box>

        <Button
          variant="contained"
          onClick={sendMessage}
          sx={{
            minWidth: "50px",
            borderRadius: "50%",
            height: "45px",
            background: "linear-gradient(45deg, #00d9ff 30%, #008cff 90%)",
            color: "black",
            fontWeight: "bold",
            transition: "all 0.2s",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 5px 15px rgba(0, 217, 255, 0.4)",
              background: "linear-gradient(45deg, #00c8eb 30%, #007bdb 90%)",
            },
          }}
        >
          <SendIcon sx={{ color: "black" }} />
        </Button>
      </Box>
    </Container>
  );
};

export default ChatAppDB;
