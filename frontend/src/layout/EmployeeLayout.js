import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Box, Fab } from "@mui/material";
import AppNavbar from "../components/employee_dashboard/AppNavbar";
import EmployeeSideMenu from "../components/employee_dashboard/MenuContent"; // Import EmployeeSideMenu
import OptionsMenu from "../components/employee_dashboard/OptionsMenu";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import ChatbotDrawer from "../components/util/ChatbotDrawer";
import AppTheme from '../shared-theme/AppTheme';

const EmployeeLayout = ({ user }) => {
    const location = useLocation();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const shouldHideMenu = location.pathname !== '/user_profile'; // Hide menu on user profile page

    const handleToggleDrawer = () => {
        setDrawerOpen((prev) => !prev);
    };

    return (
        <Box sx={{ display: "flex" }}>
            {/* Side Menu for Employee */}
            {!shouldHideMenu && (
                <AppTheme>
                    <EmployeeSideMenu user={user} /> {/* Render EmployeeSideMenu */}
                </AppTheme>
            )}
            <AppNavbar />
            <Box component="main" sx={{ flexGrow: 1, overflow: "auto" }}>
                <Outlet /> {/* Render child routes */}
            </Box>
            {/* Chat Bubble */}
            {!shouldHideMenu && (
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
            )}
            <OptionsMenu />
            {/* Chatbot Drawer */}
            <ChatbotDrawer open={drawerOpen} onClose={handleToggleDrawer} />
        </Box>
    );
};

export default EmployeeLayout;
