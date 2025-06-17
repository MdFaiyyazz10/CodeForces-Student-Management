import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  useTheme,
} from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { useColorMode } from "../components/ThemeProvider";

const Navbar = () => {
  const theme = useTheme();
  const { mode, toggleColorMode } = useColorMode();

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" fontWeight="bold">
          Student Dashboard
        </Typography>
        <Box>
          <IconButton onClick={toggleColorMode} color="inherit">
            {theme.palette.mode === "dark" ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
