// src/components/layout/Sidebar.tsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  AppBar, Toolbar,
  IconButton, Typography,
  Drawer, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText,
  Divider, Box, useTheme, useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 240;

const Sidebar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);
  const { isLoggedIn } = useAuth();

  const toggle = () => setOpen(o => !o);

  const links = [
    { to: '/',       text: 'Home',      icon: <HomeIcon />,        always: true },
    { to: '/dashboard', text: 'Dashboard', icon: <DashboardIcon />, always: true },
    { to: '/rsvp',    text: 'RSVP',      icon: <EventAvailableIcon />, always: false },
  ] as const;

  const drawer = (
    <Box onClick={isMobile ? toggle : undefined} sx={{ textAlign:'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>DJ Forever</Typography>
      <Divider/>
      <List>
        {links.map(({to, text, icon, always}) => (
          (always || isLoggedIn) && (
            <ListItem key={to} disablePadding>
              <NavLink
                to={to}
                style={({ isActive }) => ({
                  textDecoration: 'none',
                  color: 'inherit',
                  width: '100%',
                })}
              >
                {({ isActive }) => (
                  <ListItemButton selected={isActive}>
                    <ListItemIcon>{icon}</ListItemIcon>
                    <ListItemText primary={text}/>
                  </ListItemButton>
                )}
              </NavLink>
            </ListItem>
          )
        ))}
      </List>
    </Box>
  );

  return (
    <>
      {isMobile && (
        <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={toggle} aria-label="menu">
              <MenuIcon/>
            </IconButton>
            <Typography variant="h6">DJ Forever</Typography>
          </Toolbar>
        </AppBar>
      )}
      <Box component="nav">
        {isMobile
          ? <Drawer
              variant="temporary"
              open={open}
              onClose={toggle}
              ModalProps={{ keepMounted: true }}
              sx={{
                display: { xs:'block', md:'none' },
                '& .MuiDrawer-paper': { boxSizing:'border-box', width: drawerWidth }
              }}
            >
              {drawer}
            </Drawer>
          : <Drawer
              variant="permanent"
              open
              sx={{
                display: { xs:'none', md:'block' },
                '& .MuiDrawer-paper': { boxSizing:'border-box', width: drawerWidth }
              }}
            >
              {drawer}
            </Drawer>
        }
      </Box>
    </>
  );
};

export default Sidebar;