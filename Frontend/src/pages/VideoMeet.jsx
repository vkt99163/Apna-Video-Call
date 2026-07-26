
import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { Badge, IconButton, TextField, Button } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import styles from "../styles/VideoComponent.module.css";
import server from "../environment";

const server_url = server.trim();
const peerConfigConnections = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoMeetComponent() {
    const socketRef = useRef(null);
    const socketIdRef = useRef(null);
    const localVideoref = useRef(null);
    const videoRef = useRef([]);
    const connections = useRef({});

    const [videoAvailable, setVideoAvailable] = useState(true);
    const [audioAvailable, setAudioAvailable] = useState(true);
    const [video, setVideo] = useState(false);
    const [audio, setAudio] = useState(false);
    const [screen, setScreen] = useState(false);
    const [showModal, setModal] = useState(true);
    const [screenAvailable, setScreenAvailable] = useState(false);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [newMessages, setNewMessages] = useState(0);
    const [askForUsername, setAskForUsername] = useState(true);
    const [username, setUsername] = useState("");
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        getPermissions();

        return () => {
            if (socketRef.current) {
                socketRef.current.off("signal");
                socketRef.current.off("connect");
                socketRef.current.off("user-joined");
                socketRef.current.off("user-left");
                socketRef.current.off("chat-message");
                socketRef.current.disconnect();
            }

            Object.values(connections.current).forEach((connection) => {
                try {
                    connection.close();
                } catch (e) { }
            });

            try {
                if (window.localStream) {
                    window.localStream.getTracks().forEach((track) => track.stop());
                }
            } catch (e) { }
        };
    }, []);

    useEffect(() => {
        if (!askForUsername && (video !== undefined || audio !== undefined)) {
            getUserMedia();
        }
    }, [video, audio, askForUsername]);

    useEffect(() => {
        if (!askForUsername && screen) {
            getDisplayMedia();
        } else if (!askForUsername && screen === false) {
            getUserMedia();
        }
    }, [screen, askForUsername]);

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
                videoPermission.getTracks().forEach((track) => track.stop());
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
                audioPermission.getTracks().forEach((track) => track.stop());
            }

            setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);
        } catch (error) {
            console.log(error);
            setVideoAvailable(false);
            setAudioAvailable(false);
        }
    };

    const createSilentBlackStream = () => {
        const black = ({ width = 640, height = 480 } = {}) => {
            const canvas = Object.assign(document.createElement("canvas"), { width, height });
            canvas.getContext("2d").fillRect(0, 0, width, height);
            const stream = canvas.captureStream();
            return Object.assign(stream.getVideoTracks()[0], { enabled: false });
        };

        const silence = () => {
            const ctx = new AudioContext();
            const oscillator = ctx.createOscillator();
            const dst = oscillator.connect(ctx.createMediaStreamDestination());
            oscillator.start();
            ctx.resume();
            return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
        };

        return new MediaStream([black(), silence()]);
    };

    const attachLocalStream = (stream) => {
        window.localStream = stream;
        if (localVideoref.current) {
            localVideoref.current.srcObject = stream;
        }
    };

    const replaceTracksForAllPeers = (stream) => {
        Object.keys(connections.current).forEach((id) => {
            const pc = connections.current[id];
            const senders = pc.getSenders();

            stream.getTracks().forEach((track) => {
                const sender = senders.find((s) => s.track && s.track.kind === track.kind);
                if (sender) {
                    sender.replaceTrack(track);
                } else {
                    pc.addTrack(track, stream);
                }
            });
        });
    };

    const getUserMediaSuccess = async (stream) => {
        try {
            if (window.localStream) {
                window.localStream.getTracks().forEach((track) => track.stop());
            }
        } catch (e) { }

        attachLocalStream(stream);
        replaceTracksForAllPeers(stream);

        stream.getTracks().forEach((track) => {
            track.onended = () => {
                const fallbackStream = createSilentBlackStream();
                attachLocalStream(fallbackStream);
                replaceTracksForAllPeers(fallbackStream);
                setVideo(false);
                setAudio(false);
            };
        });
    };

    const getUserMedia = async () => {
        try {
            if ((video && videoAvailable) || (audio && audioAvailable)) {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: video,
                    audio: audio,
                });
                await getUserMediaSuccess(stream);
            } else {
                const fallbackStream = createSilentBlackStream();
                attachLocalStream(fallbackStream);
                replaceTracksForAllPeers(fallbackStream);
            }
        } catch (e) {
            console.log(e);
        }
    };

    const getDisplayMedia = async () => {
        try {
            if (!navigator.mediaDevices.getDisplayMedia) return;

            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true,
            });

            try {
                if (window.localStream) {
                    window.localStream.getTracks().forEach((track) => track.stop());
                }
            } catch (e) { }

            attachLocalStream(stream);
            replaceTracksForAllPeers(stream);

            stream.getTracks().forEach((track) => {
                track.onended = () => {
                    setScreen(false);
                    getUserMedia();
                };
            });
        } catch (e) {
            console.log(e);
        }
    };

    const gotMessageFromServer = async (fromId, message) => {
        const signal = JSON.parse(message);

        if (!connections.current[fromId]) {
            connections.current[fromId] = new RTCPeerConnection(peerConfigConnections);
            setupPeerConnection(fromId);
        }

        if (fromId === socketIdRef.current) return;

        try {
            if (signal.sdp) {
                await connections.current[fromId].setRemoteDescription(
                    new RTCSessionDescription(signal.sdp)
                );

                if (signal.sdp.type === "offer") {
                    const description = await connections.current[fromId].createAnswer();
                    await connections.current[fromId].setLocalDescription(description);

                    socketRef.current.emit(
                        "signal",
                        fromId,
                        JSON.stringify({ sdp: connections.current[fromId].localDescription })
                    );
                }
            }

            if (signal.ice) {
                await connections.current[fromId].addIceCandidate(new RTCIceCandidate(signal.ice));
            }
        } catch (e) {
            console.log(e);
        }
    };

    const setupPeerConnection = (socketListId) => {
        const pc = connections.current[socketListId];

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current.emit(
                    "signal",
                    socketListId,
                    JSON.stringify({ ice: event.candidate })
                );
            }
        };

        pc.ontrack = (event) => {
            const remoteStream = event.streams[0];

            setVideos((prev) => {
                const exists = prev.find((v) => v.socketId === socketListId);
                if (exists) {
                    const updated = prev.map((v) =>
                        v.socketId === socketListId ? { ...v, stream: remoteStream } : v
                    );
                    videoRef.current = updated;
                    return updated;
                }

                const updated = [
                    ...prev,
                    {
                        socketId: socketListId,
                        stream: remoteStream,
                        autoplay: true,
                        playsInline: true,
                    },
                ];
                videoRef.current = updated;
                return updated;
            });
        };

        if (window.localStream) {
            window.localStream.getTracks().forEach((track) => {
                const senderExists = pc.getSenders().some((sender) => sender.track === track);
                if (!senderExists) {
                    pc.addTrack(track, window.localStream);
                }
            });
        }
    };

    const connectToSocketServer = () => {
        socketRef.current = io(server_url.trim(), {
            transports: ["websocket","polling"],
        });

        socketRef.current.on("signal", gotMessageFromServer);

        socketRef.current.on("chat-message", (data, sender, socketIdSender) => {
            setMessages((prev) => [...prev, { sender, data }]);
            if (socketIdSender !== socketIdRef.current) {
                setNewMessages((prev) => prev + 1);
            }
        });

        socketRef.current.on("user-left", (id) => {
            setVideos((prev) => prev.filter((video) => video.socketId !== id));

            if (connections.current[id]) {
                try {
                    connections.current[id].close();
                } catch (e) { }
                delete connections.current[id];
            }
        });

        socketRef.current.on("user-joined", async (id, clients) => {
            clients.forEach((socketListId) => {
                if (!connections.current[socketListId]) {
                    connections.current[socketListId] = new RTCPeerConnection(peerConfigConnections);
                    setupPeerConnection(socketListId);
                }
            });

            if (id === socketIdRef.current) {
                for (let id2 in connections.current) {
                    if (id2 === socketIdRef.current) continue;

                    try {
                        const description = await connections.current[id2].createOffer();
                        await connections.current[id2].setLocalDescription(description);

                        socketRef.current.emit(
                            "signal",
                            id2,
                            JSON.stringify({ sdp: connections.current[id2].localDescription })
                        );
                    } catch (e) {
                        console.log(e);
                    }
                }
            }
        });

        socketRef.current.on("connect", () => {
            socketIdRef.current = socketRef.current.id;
            socketRef.current.emit("join-call", window.location.href);
        });
    };

    const handleVideo = () => {
        setVideo((prev) => !prev);
    };

    const handleAudio = () => {
        setAudio((prev) => !prev);
    };

    const handleScreen = () => {
        setScreen((prev) => !prev);
    };

    const handleEndCall = () => {
        try {
            if (window.localStream) {
                window.localStream.getTracks().forEach((track) => track.stop());
            }
        } catch (e) { }

        if (socketRef.current) {
            socketRef.current.disconnect();
        }

        window.location.href = "/";
    };

    const sendMessage = () => {
        if (!socketRef.current || !message.trim()) return;
        socketRef.current.emit("chat-message", message, username);
        setMessage("");
    };

    const connect = async () => {
        if (!username.trim()) {
            alert("Please enter your name");
            return;
        }

        setAskForUsername(false);
        setVideo(videoAvailable);
        setAudio(audioAvailable);

        const initialStream =
            videoAvailable || audioAvailable
                ? await navigator.mediaDevices.getUserMedia({
                    video: videoAvailable,
                    audio: audioAvailable,
                })
                : createSilentBlackStream();

        attachLocalStream(initialStream);
        connectToSocketServer();
    };

    return (
        <div>
            {askForUsername ? (
                <div>
                    <h2>Enter into Lobby</h2>

                    <TextField
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        id="outlined-basic"
                        label="Enter Your Name"
                        variant="outlined"
                        InputProps={{
                            style: { color: "white" },
                        }}
                        InputLabelProps={{
                            style: { color: "#8b949e" },
                        }}
                    />

                    <Button variant="contained" onClick={connect}>
                        Connect
                    </Button>

                    <div>
                        <video ref={localVideoref} autoPlay muted playsInline />
                    </div>
                </div>
            ) : (
                <div className={styles.meetVideoContainer}>
                    {showModal ? (
                        <div className={styles.chatRoom}>
                            <div className={styles.chatContainer}>
                                <h1>Chat</h1>

                                <div className={styles.chattingDisplay}>
                                    {messages.length !== 0 ? (
                                        messages.map((item, index) => (
                                            <div style={{ marginBottom: "20px" }} key={index}>
                                                <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                                                <p>{item.data}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No Messages Yet</p>
                                    )}
                                </div>

                                <div className={styles.chattingArea}>
                                    <TextField
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        id="outlined-basic"
                                        label="Enter Your chat"
                                        variant="outlined"
                                    />
                                    <Button variant="contained" onClick={sendMessage}>
                                        Send
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    <div className={styles.buttonContainers}>
                        <IconButton onClick={handleVideo} style={{ color: "white" }}>
                            {video ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>

                        <IconButton onClick={handleEndCall} style={{ color: "red" }}>
                            <CallEndIcon />
                        </IconButton>

                        <IconButton onClick={handleAudio} style={{ color: "white" }}>
                            {audio ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>

                        {screenAvailable ? (
                            <IconButton onClick={handleScreen} style={{ color: "white" }}>
                                {screen ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                            </IconButton>
                        ) : null}

                        <Badge badgeContent={newMessages} max={999} color="primary">
                            <IconButton
                                onClick={() => {
                                    setModal(!showModal);
                                    if (!showModal) setNewMessages(0);
                                }}
                                style={{ color: "white" }}
                            >
                                <ChatIcon />
                            </IconButton>
                        </Badge>
                    </div>

                    <video
                        className={styles.meetUserVideo}
                        ref={localVideoref}
                        autoPlay
                        muted
                        playsInline
                    />

                    <div className={styles.conferenceView}>
                        {videos.map((video) => (
                            <div key={video.socketId}>
                                <video
                                    data-socket={video.socketId}
                                    ref={(ref) => {
                                        if (ref && video.stream) {
                                            ref.srcObject = video.stream;
                                        }
                                    }}
                                    autoPlay
                                    playsInline
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}