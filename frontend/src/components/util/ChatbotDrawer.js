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
import SettingsIcon from "@mui/icons-material/Settings";
import { fetchChatbotResponse } from "../../mutations/chatBot/useChatbotInteraction";
import botAvatar from "../../assets/images/robot.jpg";
import ScatterPlotOutlinedIcon from "@mui/icons-material/ScatterPlotOutlined";
import CloseTwoToneIcon from "@mui/icons-material/CloseTwoTone";

const ChatbotDrawer = ({ open, onClose }) => {
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you?", isBot: true, timestamp: new Date() },
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
      const botResponses = await fetchChatbotResponse(input); // Call function directly
      botResponses.forEach((response) => {
        const botMessage = {
          text: response.text,
          isBot: true,
          timestamp: new Date(),
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
        alignItems: "flex-start" 
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
            maxWidth: "75%" 
        }}
    >
        <Box
            sx={{
                bgcolor: msg.isBot ? "grey.300" : "primary.light",
                color: "black",
                borderRadius: 2,
                p: 1,
                maxWidth: "100%",
                width: "fit-content",
                flexShrink: 0,
            }}
        >
            <Typography component="span" sx={{ whiteSpace: "pre-wrap" }}>
                {msg.text}
            </Typography>
        </Box>
        
        {/* Timestamp aligned to the right for both bot and user */}
        <Typography 
            variant="caption" 
            sx={{ 
                color: "text.secondary", 
                mt: 0.5, 
                textAlign: "right", // Ensures timestamp is on the right side
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
  );
};

export default ChatbotDrawer;
