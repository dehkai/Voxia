import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import AppNavbar from "../components/admin_dashboard/AppNavbar"; // Admin Navbar
import AdminSideMenu from "../components/admin_dashboard/MenuContent"; // Admin Sidebar
import OptionsMenu from "../components/admin_dashboard/OptionsMenu"; // Admin Options Menu
import AppTheme from '../shared-theme/AppTheme'; 

const AdminLayout = () => {
    const location = useLocation();
    const shouldHideMenu = location.pathname === '/user_profile'; // You can change this to hide the menu on certain pages

    return (
        <Box sx={{ display: "flex" }}>
            {/* Always render the Admin Sidebar */}
            <AppTheme>
                <AdminSideMenu /> {/* Admin Side Menu */}
            </AppTheme>

            {/* App Navbar */}
            <AppNavbar />
            
            <Box component="main" sx={{ flexGrow: 1, overflow: "auto" }}>
                <Outlet /> {/* Render child routes */}
            </Box>

            {/* Admin Options Menu */}
            <OptionsMenu />
        </Box>
    );
};

export default AdminLayout;
