import * as React from "react";
import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import ReactDOM from "react-dom";
import OnlinePredictionIcon from "@mui/icons-material/OnlinePrediction";
import { Route, useNavigate, Routes, Navigate } from "react-router-dom";
import { Home } from "./pages/Home";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Unstable_Grid2";
import HomeIcon from "@mui/icons-material/Home";
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import { ObjectDetection } from "./pages/ObjectDetection";
import { FaceDetection } from "./pages/FaceDetection";
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default function App() {
  const navigate = useNavigate()
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: "none" }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Deep Learning Web
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          <ListItem key="Prediction" disablePadding sx={{ display: "block" }}>
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: open ? "initial" : "center",
                px: 2.5,
              }}
              onClick={() => navigate('/')}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : "auto",
                  justifyContent: "center",
                }}
              >
                <HomeIcon />
              </ListItemIcon>
              <ListItemText
                primary="Object Detection"
                sx={{ opacity: open ? 1 : 0 }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem key="Prediction" disablePadding sx={{ display: "block" }}>
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: open ? "initial" : "center",
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : "auto",
                  justifyContent: "center",
                }}
                onClick={() => navigate('/object-detection')}
              >
                <OnlinePredictionIcon />
              </ListItemIcon>
              <ListItemText
                primary="Object Detection"
                sx={{ opacity: open ? 1 : 0 }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem key="Face Detect" disablePadding sx={{ display: "block" }}>
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: open ? "initial" : "center",
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : "auto",
                  justifyContent: "center",
                }}
                onClick={() => navigate('/face-detection')}
              >
                <PeopleRoundedIcon />
              </ListItemIcon>
              <ListItemText
                primary="Face Detection"
                sx={{ opacity: open ? 1 : 0 }}
              />
            </ListItemButton>
          </ListItem>
        </List>
        <Divider />
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 1 }}>
        <DrawerHeader />
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={1}>
            <Grid xs></Grid>
            <Grid xs={11}>
              <Item>
                
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/object-detection" element={<ObjectDetection />} />
                  <Route path="/face-detection" element={<FaceDetection />} />
                  <Route path="/404" element={<div>Choose the correct path</div>} />
                  <Route path="*" element={<Navigate replace to="/404" />} />

                </Routes>
              </Item>
            </Grid>
            <Grid xs></Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
/*
import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ReactDOM from 'react-dom'
import FileUpload from "react-mui-fileuploader"

export default function App() {
  
  const handleFileUploadError = (_error: any) => {
    // Do something...
  }
  
  const handleFilesChange = (files: Array<any>) => {
    // Do something...
    console.log(files.length);
    
  }

  return (
    <FileUpload
      multiFile={true}
      disabled={false}
      title="My awesome file uploader"
      header="[Drag to drop]"
      leftLabel="or"
      rightLabel="to select files"
      buttonLabel="click here"
      buttonRemoveLabel="Remove all"
      maxFileSize={10}
      maxUploadFiles={1}
      maxFilesContainerHeight={357}
      errorSizeMessage={'fill it or remove it to use the default error message'}
      allowedExtensions={['jpg', 'jpeg']}
      onFilesChange={handleFilesChange}
      onError={handleFileUploadError}
      imageSrc={'images/logo512.png'}
      bannerProps={{ elevation: 0, variant: "outlined" }}
      containerProps={{ elevation: 0, variant: "outlined" }}
      
    />
  )
}

import { useAuth, useAuthCheck } from './hooks/useAuth'
import { AccountPage } from './containers/AccountPage'
import { LoginPage } from './containers/LoginPage'
import { ActivationPage } from './containers/ActivationPage'
import { RegistrationPage } from './containers/RegistrationPage'
import { RecoveryPage } from './containers/RecoveryPage'
import { ResetPage } from './containers/ResetPage'
import React from 'react'
import './App.css'
import { Home } from './containers/Home'
import { Todos } from './containers/Todo'
import { Files } from './containers/Files'
import { Route, useNavigate, Routes } from 'react-router-dom'

const App = () => {
  useAuthCheck()
  const auth = useAuth()
    
  const navigate = useNavigate()
  
  
  // @ts-ignore
    return (
    <div className="App">
      <div className="App-nav-header">
        <div style={{ display: 'flex', flex: 1 }}>
          <a className="NavButton" onClick={() => navigate('/')}>Home</a>
          <a className="NavButton" onClick={() => navigate('/todos')}>Todos</a>
        <a className="NavButton" onClick={() => navigate('/files')}>Files</a>
          
          <a className="NavButton" onClick={() => navigate('/account')}>Account</a>
        </div>
        <div>
          
          { auth.isAuthenticated && <a className="NavButton" onClick={() => auth.logout()}>Logout</a> }
          { !auth.isAuthenticated && <a className="NavButton" onClick={() => navigate('/login')}>Login/Register</a> }
        </div>
      </div>
      <div style={{ margin: '0 auto', maxWidth: '800px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/todos" element={<Todos />} />
            
            <Route path="/files" element={<Files />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/recovery" element={<RecoveryPage />} />
            <Route path="/reset" element={<ResetPage />} />
            <Route path="/activate" element={<ActivationPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/account" element={<AccountPage />} />
    
          </Routes>
      </div>
    </div>
  )
}

export default App
*/
