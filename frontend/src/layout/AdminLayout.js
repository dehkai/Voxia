import React from "react";
import { Outlet } from "react-router-dom";
import AppNavbar from "../components/admin_dashboard/AppNavbar"; // or your specific admin navbar
import SideMenu from "../components/admin_dashboard/SideMenu"; // or your specific admin menu
import OptionsMenu from "../components/admin_dashboard/OptionsMenu"; // or your specific admin options
import { Box } from "@mui/material";

const AdminLayout = () => {
    return (
        <Box sx={{ display: "flex" }}>
            <SideMenu /> {/* Admin Side Menu */}
            <AppNavbar />
            <Box component="main" sx={{ flexGrow: 1, overflow: "auto" }}>
                <Outlet /> {/* Render child routes */}
            </Box>
            <OptionsMenu /> {/* Admin Options Menu */}
        </Box>
    );
};

export default AdminLayout;
