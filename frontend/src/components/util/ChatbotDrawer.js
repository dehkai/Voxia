import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  Avatar,
  IconButton,
  Typography,
  Divider,
} from "@mui/material";
import { fetchChatbotResponse } from "../../mutations/chatBot/useChatbotInteraction";
import botAvatar from "../../assets/images/robot.jpg";
import ScatterPlotOutlinedIcon from "@mui/icons-material/ScatterPlotOutlined";
import CloseTwoToneIcon from "@mui/icons-material/CloseTwoTone";
import AppTheme from "../../shared-theme/AppTheme";

const ChatbotDrawer = ({ open, onClose }) => {
  const [messages, setMessages] = useState([
    { 
      text: "Hello! How can I help you?", 
      isBot: true, 
      timestamp: new Date(),
      buttons: [] 
    },
  ]);
  const [input, setInput] = useState("");
  const [rows, setRows] = useState(1);
  const messagesEndRef = useRef(null);

  // const handleSendMessage = () => {
  //     if (input.trim() === "") return;

  //     const userMessage = { text: input, isBot: false, timestamp: new Date() };
  //     setMessages((prevMessages) => [...prevMessages, userMessage]);
  //     setInput("");
  //     setRows(1);

  //     setTimeout(() => {
  //         const botMessage = { text: `You said:\n${input}`, isBot: true, timestamp: new Date() };
  //         setMessages((prevMessages) => [...prevMessages, botMessage]);
  //     }, 500);
  // };

  const handleExitChat = () => {
    // Close the drawer or reset the chat state
    onClose(); // Assuming onClose will handle closing the drawer
    // setMessages([]); // Optional: clear the chat history
    // setInput(""); // Optional: clear the input field
  };

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage = { text: input, isBot: false, timestamp: new Date() };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setRows(1);

    try {
      const botResponses = await fetchChatbotResponse(input);
      botResponses.forEach((response) => {
        const botMessage = {
          text: response.text,
          isBot: true,
          timestamp: new Date(),
          buttons: response.buttons || []
        };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      });
    } catch (error) {
      console.error("Error in Rasa interaction:", error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  };

  return (
    <AppTheme>
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        sx={{
          width: 600,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          p: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Avatar
            sx={{ ml: 3, width: 50, height: 50, fontSize: "20px" }}
            src={botAvatar}
          >
            B
          </Avatar>
          <h2>Voxia</h2>
          <IconButton
            sx={{
              ml: 45,
              border: "none", // Hides any border
              outline: "none",
            }}
            onClick={() => console.log("Settings Clicked")}
          >
            <ScatterPlotOutlinedIcon />
          </IconButton>
          <IconButton
            sx={{
              border: "none", // Hides any border
              outline: "none",
            }}
            onClick={handleExitChat}
          >
            <CloseTwoToneIcon />
          </IconButton>
        </Box>
        <List sx={{ flexGrow: 1, overflowY: "auto" }}>
          {messages
            .reduce((acc, msg, index) => {
              const messageDate = new Date(msg.timestamp).toDateString();
              const lastDate =
                acc.length > 0 && acc[acc.length - 1].msg
                  ? new Date(acc[acc.length - 1].msg.timestamp).toDateString()
                  : null;

              if (messageDate !== lastDate) {
                acc.push({
                  date: messageDate,
                  divider: true,
                  timestamp: msg.timestamp,
                });
              }

              acc.push({ msg, divider: false });
              return acc;
            }, [])
            .map((item, index) => {
              if (item.divider) {
                return (
                  <React.Fragment key={index}>
                    <Divider />
                    <Typography variant="caption" align="center" sx={{ p: 1 }}>
                      {formatDate(item.timestamp)}
                    </Typography>
                  </React.Fragment>
                );
              }

              const msg = item.msg;
              return (
                <ListItem 
    key={index} 
    sx={{ 
        justifyContent: msg.isBot ? "flex-start" : "flex-end", 
        display: "flex", 
        alignItems: "flex-start",
        mb: 1
    }}
>
    {msg.isBot ? (
        <Avatar sx={{ mr: 1, width: 50, height: 50, fontSize: "20px" }} src={botAvatar}>
            B
        </Avatar>
    ) : null}

    <Box 
        sx={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: msg.isBot ? "flex-start" : "flex-end", 
            maxWidth: "75%",
            width: "auto"
        }}
    >
        <Box
            sx={{
                bgcolor: msg.isBot ? "grey.300" : "primary.light",
                color: "black",
                borderRadius: 2,
                p: 1,
                maxWidth: "100%",
                flexShrink: 0,
                wordBreak: "break-word"
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography component="span" sx={{ whiteSpace: "pre-wrap" }}>
                    {msg.text}
                </Typography>
                {msg.buttons && msg.buttons.length > 0 && (
                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {msg.buttons.map((button, idx) => (
                            <Button
                                key={idx}
                                variant="contained"
                                size="small"
                                onClick={() => {
                                    const userMessage = { 
                                        text: button.title, 
                                        isBot: false, 
                                        timestamp: new Date() 
                                    };
                                    setMessages(prev => [...prev, userMessage]);
                                    
                                    // Send the payload instead of the title
                                    const payload = button.payload;
                                    fetch("http://localhost:5005/webhooks/rest/webhook", {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({ 
                                            sender: "user", 
                                            message: payload.replace("/", "") // Remove the leading slash from the payload
                                        }),
                                    })
                                    .then(response => response.json())
                                    .then(data => {
                                        data.forEach((response) => {
                                            const botMessage = {
                                                text: response.text,
                                                isBot: true,
                                                timestamp: new Date(),
                                                buttons: response.buttons || []
                                            };
                                            setMessages(prev => [...prev, botMessage]);
                                        });
                                    })
                                    .catch(error => {
                                        console.error("Error in Rasa interaction:", error);
                                    });
                                }}
                                sx={{
                                    backgroundColor: 'white',
                                    color: 'primary.main',
                                    '&:hover': {
                                        backgroundColor: 'primary.light',
                                        color: 'white'
                                    }
                                }}
                            >
                                {button.title}
                            </Button>
                        ))}
                    </Box>
                )}
            </Box>
        </Box>
        
        <Typography 
            variant="caption" 
            sx={{ 
                color: "text.secondary", 
                mt: 0.5, 
                textAlign: "right",
                width: "100%"
            }}
        >
            {formatTime(msg.timestamp)}
        </Typography>
    </Box>

    {!msg.isBot ? (
        <Avatar sx={{ ml: 1, width: 50, height: 50, fontSize: "20px" }}>
            U
        </Avatar>
    ) : null}
</ListItem>

              );
            })}
          <div ref={messagesEndRef} />
        </List>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mt: 1,
          }}
        >
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            placeholder="Type a message..."
            value={input}
            onChange={(e) => {
              const value = e.target.value;
              setInput(value);
              setRows(value.split("\n").length); // Update rows based on newline count
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            multiline
            rows={rows} // Only use rows, remove maxRows
          />
          <Button
            onClick={handleSendMessage}
            sx={{ ml: 1 }}
            variant="contained"
          >
            Send
          </Button>
        </Box>
      </Box>
    </Drawer>
    </AppTheme>
  );
};

export default ChatbotDrawer;
