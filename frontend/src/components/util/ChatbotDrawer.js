import React, { useState, useRef, useEffect } from "react";
import { Box, Drawer, List, ListItem, ListItemText, TextField, Button, Avatar, IconButton, Typography, Divider } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";

const ChatbotDrawer = ({ open, onClose }) => {
    const [messages, setMessages] = useState([{ text: "Hello! How can I help you?", isBot: true, timestamp: new Date() }]);
    const [input, setInput] = useState("");
    const [rows, setRows] = useState(1);
    const messagesEndRef = useRef(null);

    const handleSendMessage = () => {
        if (input.trim() === "") return;

        const userMessage = { text: input, isBot: false, timestamp: new Date() };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInput("");
        setRows(1);

        setTimeout(() => {
            const botMessage = { text: `You said:\n${input}`, isBot: true, timestamp: new Date() };
            setMessages((prevMessages) => [...prevMessages, botMessage]);
        }, 500);
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
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h2>Chatbot</h2>
                    <IconButton onClick={() => console.log("Settings Clicked")}>
                        <SettingsIcon />
                    </IconButton>
                </Box>
                <List sx={{ flexGrow: 1, overflowY: "auto" }}>
                    {messages
                        .reduce((acc, msg, index) => {
                            const messageDate = new Date(msg.timestamp).toDateString();
                            const lastDate = acc.length > 0 && acc[acc.length - 1].msg ? new Date(acc[acc.length - 1].msg.timestamp).toDateString() : null;

                            if (messageDate !== lastDate) {
                                acc.push({ date: messageDate, divider: true, timestamp: msg.timestamp });
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
                                <ListItem key={index} sx={{ justifyContent: msg.isBot ? "flex-start" : "flex-end" }}>
                                    {msg.isBot ? (
                                        <>
                                            <Avatar sx={{ mr: 1 }}>B</Avatar>
                                            <ListItemText
                                                primary={
                                                    <Typography component="span" sx={{ whiteSpace: "pre-wrap" }}>
                                                        {msg.text}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                        {formatTime(msg.timestamp)}
                                                    </Typography>
                                                }
                                                sx={{
                                                    bgcolor: "grey.300",
                                                    color: "black",
                                                    borderRadius: 2,
                                                    p: 1,
                                                    maxWidth: "75%",
                                                    width: "fit-content",
                                                    flexShrink: 0,
                                                }}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <ListItemText
                                                primary={
                                                    <Typography component="span" sx={{ whiteSpace: "pre-wrap" }}>
                                                        {msg.text}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                        {formatTime(msg.timestamp)}
                                                    </Typography>
                                                }
                                                sx={{
                                                    bgcolor: "primary.light",
                                                    color: "black",
                                                    borderRadius: 2,
                                                    p: 1,
                                                    maxWidth: "75%",
                                                    width: "fit-content",
                                                    flexShrink: 0,
                                                }}
                                            />
                                            <Avatar sx={{ ml: 1 }}>U</Avatar>
                                        </>
                                    )}
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
                            setRows(value.split("\n").length);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        multiline
                        rows={rows}
                        maxRows={4}
                    />
                    <Button onClick={handleSendMessage} sx={{ ml: 1 }} variant="contained">
                        Send
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
};

export default ChatbotDrawer;
