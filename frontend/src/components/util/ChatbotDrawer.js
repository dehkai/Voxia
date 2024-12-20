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
import { isAuthenticated } from "../../utils/auth";

const LoadingBubble = () => (
  <ListItem sx={{ justifyContent: "flex-start", alignItems: "flex-start", mb: 1 }}>
    <Avatar sx={{ mr: 1, width: 50, height: 50, fontSize: "20px" }} src={botAvatar}>
      B
    </Avatar>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        bgcolor: 'grey.300',
        p: 1.5,
        borderRadius: 2,
        width: 'fit-content',
      }}
    >
      <Box
        component="span"
        sx={{
          width: 10,
          height: 10,
          bgcolor: 'grey.600',
          borderRadius: '50%',
          animation: 'pulse 1s infinite',
          '&:nth-of-type(2)': {
            animationDelay: '0.2s',
          },
          '&:nth-of-type(3)': {
            animationDelay: '0.4s',
          },
          '@keyframes pulse': {
            '0%': {
              opacity: 0.4,
            },
            '50%': {
              opacity: 1,
            },
            '100%': {
              opacity: 0.4,
            },
          },
        }}
      />
      <Box component="span" sx={{ width: 10, height: 10, bgcolor: 'grey.600', borderRadius: '50%' }} />
      <Box component="span" sx={{ width: 10, height: 10, bgcolor: 'grey.600', borderRadius: '50%' }} />
    </Box>
  </ListItem>
);

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const handleExitChat = () => {
    // Close the drawer or reset the chat state
    onClose(); // Assuming onClose will handle closing the drawer
    // setMessages([]); // Optional: clear the chat history
    // setInput(""); // Optional: clear the input field
  };
  const userString = sessionStorage.getItem('user'); // '{"email":"example@email.com","name":"John"}'
  const user1 = JSON.parse(userString);
  console.log("This is user email", user1.email);

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage = { text: input, isBot: false, timestamp: new Date() };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setRows(1);
    
    setIsProcessing(true); // Show loading indicator
    
    try {
      const botResponses = await fetchChatbotResponse(input,user1.email);
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
    } finally {
      setIsProcessing(false); // Hide loading indicator
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const initializeChat = async () => {
      const { isLoggedIn, user } = isAuthenticated();
      if (isLoggedIn) {
        setIsInitializing(true); // Disable input while initializing
        try {
          const response = await fetch("http://localhost:5005/webhooks/rest/webhook", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sender: user1.email,
              message: "/initialize_auth",
              metadata: {
                auth_token: localStorage.getItem('token') || sessionStorage.getItem('token')
              }
            }),
          });
          
          const data = await response.json();
          if (data.length > 0) {
            setMessages(prev => [
              ...prev,
              ...data.map(msg => ({
                text: msg.text,
                isBot: true,
                timestamp: new Date(),
                buttons: msg.buttons || []
              }))
            ]);
          }
        } catch (error) {
          console.error("Error initializing chat:", error);
        } finally {
          setIsInitializing(false); // Enable input after initialization
        }
      } else {
        setIsInitializing(false); // Enable input if not logged in
      }
    };

    if (open) {
      initializeChat();
    }
  }, [open]);

  useEffect(() => {
    if (open && !isInitializing && !isProcessing) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open, isInitializing, isProcessing]);

  useEffect(() => {
    if (!isProcessing && !isInitializing) {
      inputRef.current?.focus();
    }
  }, [isProcessing, isInitializing]);

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
                                    setIsProcessing(true); // Show loading indicator
                                    
                                    // Determine if this is an action trigger or basic intent
                                    const isActionTrigger = [
                                        "save_travel_request",
                                        "confirm_save_request",
                                        "select_flight",
                                        "select_hotel",
                                        "deny"
                                    ].some(action => button.payload.includes(action));

                                    const messagePayload = isActionTrigger 
                                        ? button.payload  // Keep the slash for action triggers
                                        : button.payload.replace("/", ""); // Remove slash for basic intents

                                    fetch("http://localhost:5005/webhooks/rest/webhook", {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({ 
                                            sender: user1.email, 
                                            message: messagePayload
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
                                    })
                                    .finally(() => {
                                        setIsProcessing(false); // Hide loading indicator
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
          {isProcessing && <LoadingBubble />}
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
            inputRef={inputRef}
            variant="outlined"
            size="small"
            fullWidth
            placeholder={isInitializing ? "Initializing chat..." : "Type a message..."}
            value={input}
            onChange={(e) => {
              const value = e.target.value;
              setInput(value);
              setRows(value.split("\n").length);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isInitializing || isProcessing}
            multiline
            rows={rows}
          />
          <Button
            onClick={handleSendMessage}
            sx={{ ml: 1 }}
            variant="contained"
            disabled={isInitializing || isProcessing}
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
