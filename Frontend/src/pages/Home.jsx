import React, { useContext, useState } from 'react';
import withAuth from '../utils/withAuth';
import { useNavigate } from 'react-router-dom';
import "../App.css";
import { Button, IconButton, TextField, Container, Box, Typography } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import LogoutIcon from '@mui/icons-material/Logout';
import { AuthContext } from '../context/AuthContext';

function HomeComponent() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");

    const { addToUserHistory } = useContext(AuthContext);
    
    let handleJoinVideoCall = async () => {
        if (!meetingCode.trim()) return;
        await addToUserHistory(meetingCode);
        navigate(`/${meetingCode}`);
    };

    return (
        <div className="main-wrapper">
            {/* Navbar */}
            <nav className="navBar">
                <Typography variant="h5" className="logo-text">
                    Apna Video Call
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box 
                        onClick={() => navigate("/history")} 
                        className="nav-item-btn"
                    >
                        <IconButton size="small" sx={{ color: '#a3b1c6' }}>
                            <RestoreIcon />
                        </IconButton>
                        <span>History</span>
                    </Box>

                    <Button 
                        variant="outlined" 
                        color="error"
                        startIcon={<LogoutIcon />}
                        onClick={() => {
                            localStorage.removeItem("token");
                            navigate("/auth");
                        }}
                        className="logout-btn"
                    >
                        Logout
                    </Button>
                </Box>
            </nav>

            {/* Centered Hero Content */}
            <Container maxWidth="lg" className="hero-container">
                <Box className="hero-card">
                    <Box className="leftPanel">
                        <h2>
                            Providing Quality Video Call <br />
                            <span>Just Like Quality Software</span>
                        </h2>

                        <Box className="input-group">
                            <TextField 
                                onChange={e => setMeetingCode(e.target.value)} 
                                value={meetingCode}
                                placeholder="Enter Meeting Code" 
                                variant="outlined"
                                className="custom-input"
                                InputProps={{
                                    style: { color: 'white' }
                                }}
                            />
                            <Button 
                                onClick={handleJoinVideoCall} 
                                variant="contained"
                                disableElevation
                                className="join-btn"
                            >
                                Join
                            </Button>
                        </Box>
                    </Box>

                    <Box className="rightPanel">
                        <img src="/logo3.png" alt="Video Call Illustration" />
                    </Box>
                </Box>
            </Container>
        </div>
    );
}

export default withAuth(HomeComponent);