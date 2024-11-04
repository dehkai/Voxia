import React, { useState } from "react";
import { alpha } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
// import Box from '@mui/material/Box';
// import Stack from '@mui/material/Stack';
import AppNavbar from "../components/employee_dashboard/AppNavbar";
import Header from "../components/employee_dashboard/Header";
import MainGrid from "../components/employee_dashboard/MainGrid";
import SideMenu from "../components/employee_dashboard/SideMenu";
import OptionsMenu from "../components/employee_dashboard/OptionsMenu";
import AppTheme from "../shared-theme/AppTheme";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import { Box, Stack, Paper, Typography, Fab, Drawer, Button, List, Divider, ListItem, ListItemButton, ListItemIcon, ListItemText, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/auth";
import { chartsCustomizations, dataGridCustomizations, datePickersCustomizations, treeViewCustomizations } from "../shared-theme/customizations";
import AnchorTemporaryDrawer from "../components/util/AnchorTemporaryDrawer";
import ChatbotDrawer from "../components/util/ChatbotDrawer";

const xThemeComponents = {
    ...chartsCustomizations,
    ...dataGridCustomizations,
    ...datePickersCustomizations,
    ...treeViewCustomizations,
};

const Dashboard = React.memo(() => {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    React.useEffect(() => {
        if (!isLoggedIn) {
            navigate("/signin");
        }
    }, [isLoggedIn, navigate]);

    const [state, setState] = useState({
        left: false,
        right: false,
        top: false,
        bottom: false,
    });

    

    const [drawerOpen, setDrawerOpen] = useState(false);
    const toggleDrawer = (open) => {
      setDrawerOpen(open);
  };
    const [messages, setMessages] = useState([{ text: "Hello! How can I help you?", isBot: true }]);
    const [input, setInput] = useState(""); 
    const anchor = "right";
    const handleToggleDrawer = () => {
      setDrawerOpen((prev) => !prev);
  };

    return (
        <AppTheme>
            <CssBaseline />
            <Box sx={{ "& > :not(style)": { m: 1 } }}>
                <Fab
                    color="primary"
                    aria-label="chat"
                    sx={{
                        position: "fixed",
                        bottom: 16,
                        right: 16,
                        zIndex: 1000,
                    }}
                    onClick={handleToggleDrawer}
                >
                    <ChatBubbleIcon />
                </Fab>
            </Box>
            <Box sx={{ display: "flex" }}>
                <SideMenu />
                <AppNavbar />
                <Box component="main" sx={{ flexGrow: 1, overflow: "auto" }}>
                    <Stack spacing={2} sx={{ alignItems: "center", mx: 3, pb: 5, mt: { xs: 8, md: 0 } }}>
                        {/* <Header />
                        <MainGrid /> */}
                    </Stack>
                </Box>
                <OptionsMenu />
            </Box>
            <ChatbotDrawer open={drawerOpen} onClose={handleToggleDrawer} />
            {/* <AnchorTemporaryDrawer
                anchor={anchor}
                open={drawerOpen}
                toggleDrawer={toggleDrawer}
                items={["Inbox", "Starred", "Send email", "Drafts"]} // Customize items as needed
            /> */}
        </AppTheme>
    );
});

Dashboard.displayName = "Dashboard";
export default Dashboard;
