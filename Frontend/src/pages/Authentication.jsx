
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../context/AuthContext';
import { Snackbar } from '@mui/material';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#d97500',
        },
        background: {
            default: '#0d1117',
            paper: 'rgba(22, 27, 34, 0.75)',
        },
    },
});

export default function Authentication() {
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");
    const [error, setError] = React.useState("");
    const [message, setMessage] = React.useState("");
    const [formState, setFormState] = React.useState(0);
    const [open, setOpen] = React.useState(false);

    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    let handleAuth = async () => {
        try {
            if (formState === 0) {
                let result = await handleLogin(username, password);
            }
            if (formState === 1) {
                let result = await handleRegister(name, username, password);
                console.log(result);
                setUsername("");
                setMessage(result);
                setOpen(true);
                setError("");
                setFormState(0);
                setPassword("");
            }
        } catch (err) {
            console.log(err);
            let message = err?.response?.data?.message || "Something went wrong";
            setError(message);
        }
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#0d1117',
                    padding: 2,
                }}
            >
                <Paper
                    elevation={12}
                    sx={{
                        p: 4,
                        maxWidth: 420,
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        borderRadius: 4,
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                    }}
                >
                    {/* Lock Icon Header */}
                    <Avatar
                        sx={{
                            m: 1,
                            bgcolor: 'primary.main',
                            width: 56,
                            height: 56,
                            boxShadow: '0 4px 15px rgba(217, 117, 0, 0.4)',
                        }}
                    >
                        <LockOutlinedIcon sx={{ fontSize: 30 }} />
                    </Avatar>

                    {/* Toggle Buttons (Sign In / Sign Up) */}
                    <Box
                        sx={{
                            display: 'flex',
                            width: '100%',
                            mt: 2,
                            mb: 3,
                            bgcolor: '#0d1117',
                            p: '4px',
                            borderRadius: 3,
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                    >
                        <Button
                            fullWidth
                            variant={formState === 0 ? "contained" : "text"}
                            onClick={() => { setFormState(0); setError(""); }}
                            sx={{
                                borderRadius: 2,
                                fontWeight: 600,
                                textTransform: 'none',
                                background: formState === 0 ? 'linear-gradient(135deg, #d97500, #ff9f43)' : 'transparent',
                                color: formState === 0 ? '#fff' : '#8b949e',
                                '&:hover': {
                                    background: formState === 0 ? 'linear-gradient(135deg, #d97500, #ff9f43)' : 'rgba(255,255,255,0.05)',
                                }
                            }}
                        >
                            Sign In
                        </Button>
                        <Button
                            fullWidth
                            variant={formState === 1 ? "contained" : "text"}
                            onClick={() => { setFormState(1); setError(""); }}
                            sx={{
                                borderRadius: 2,
                                fontWeight: 600,
                                textTransform: 'none',
                                background: formState === 1 ? 'linear-gradient(135deg, #d97500, #ff9f43)' : 'transparent',
                                color: formState === 1 ? '#fff' : '#8b949e',
                                '&:hover': {
                                    background: formState === 1 ? 'linear-gradient(135deg, #d97500, #ff9f43)' : 'rgba(255,255,255,0.05)',
                                }
                            }}
                        >
                            Sign Up
                        </Button>
                    </Box>

                    {/* Input Form */}
                    <Box component="form" noValidate sx={{ width: '100%' }}>
                        {formState === 1 && (
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Full Name"
                                value={name}
                                autoFocus
                                onChange={(e) => setName(e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 3,
                                        bgcolor: '#0d1117',
                                    }
                                }}
                            />
                        )}

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    bgcolor: '#0d1117',
                                }
                            }}
                        />

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Password"
                            value={password}
                            type="password"
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    bgcolor: '#0d1117',
                                }
                            }}
                        />

                        {error && (
                            <Typography color="error" variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                                {error}
                            </Typography>
                        )}

                        <Button
                            type="button"
                            fullWidth
                            variant="contained"
                            onClick={handleAuth}
                            sx={{
                                mt: 3,
                                mb: 1,
                                py: 1.3,
                                borderRadius: 3,
                                fontSize: '1rem',
                                fontWeight: 600,
                                textTransform: 'none',
                                background: 'linear-gradient(135deg, #d97500, #ff9f43)',
                                boxShadow: '0 4px 15px rgba(217, 117, 0, 0.4)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #c56a00, #e68a38)',
                                }
                            }}
                        >
                            {formState === 0 ? "Login" : "Register"}
                        </Button>
                    </Box>
                </Paper>
            </Box>

            <Snackbar
                open={open}
                autoHideDuration={4000}
                onClose={() => setOpen(false)}
                message={message || "An error occurred"}
            />
        </ThemeProvider>
    );
}