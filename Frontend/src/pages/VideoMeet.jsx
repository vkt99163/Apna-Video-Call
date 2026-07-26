// import React, { useEffect, useRef, useState } from 'react'
// import io from "socket.io-client";
// import { Badge, IconButton, TextField } from '@mui/material';
// import { Button } from '@mui/material';
// import VideocamIcon from '@mui/icons-material/Videocam';
// import VideocamOffIcon from '@mui/icons-material/VideocamOff'
// import styles from "../styles/VideoComponent.module.css";
// import CallEndIcon from '@mui/icons-material/CallEnd'
// import MicIcon from '@mui/icons-material/Mic'
// import MicOffIcon from '@mui/icons-material/MicOff'
// import ScreenShareIcon from '@mui/icons-material/ScreenShare';
// import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
// import ChatIcon from '@mui/icons-material/Chat'
// import server from '../environment';

// const server_url = server;

// var connections = {};

// const peerConfigConnections = {
//     "iceServers": [
//         { "urls": "stun:stun.l.google.com:19302" }
//     ]
// }

// export default function VideoMeetComponent() {

//     var socketRef = useRef();
//     let socketIdRef = useRef();

//     let localVideoref = useRef();

//     let [videoAvailable, setVideoAvailable] = useState(true);

//     let [audioAvailable, setAudioAvailable] = useState(true);

//     let [video, setVideo] = useState([]);

//     let [audio, setAudio] = useState();

//     let [screen, setScreen] = useState();

//     let [showModal, setModal] = useState(true);

//     let [screenAvailable, setScreenAvailable] = useState();

//     let [messages, setMessages] = useState([])

//     let [message, setMessage] = useState("");

//     let [newMessages, setNewMessages] = useState(3);

//     let [askForUsername, setAskForUsername] = useState(true);

//     let [username, setUsername] = useState("");

//     const videoRef = useRef([])

//     let [videos, setVideos] = useState([])

//     // TODO
//     // if(isChrome() === false) {


//     // }

//     useEffect(() => {
//         getPermissions();
//     }, []);

//     let getDislayMedia = () => {
//         if (screen) {
//             if (navigator.mediaDevices.getDisplayMedia) {
//                 navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
//                     .then(getDislayMediaSuccess)
//                     .then((stream) => { })
//                     .catch((e) => console.log(e))
//             }
//         }
//     }

//     const getPermissions = async () => {
//         try {
//             const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
//             if (videoPermission) {
//                 setVideoAvailable(true);
//                 console.log('Video permission granted');
//             } else {
//                 setVideoAvailable(false);
//                 console.log('Video permission denied');
//             }

//             const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
//             if (audioPermission) {
//                 setAudioAvailable(true);
//                 console.log('Audio permission granted');
//             } else {
//                 setAudioAvailable(false);
//                 console.log('Audio permission denied');
//             }

//             if (navigator.mediaDevices.getDisplayMedia) {
//                 setScreenAvailable(true);
//             } else {
//                 setScreenAvailable(false);
//             }

//             if (videoAvailable || audioAvailable) {
//                 const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
//                 if (userMediaStream) {
//                     window.localStream = userMediaStream;
//                     if (localVideoref.current) {
//                         localVideoref.current.srcObject = userMediaStream;
//                     }
//                 }
//             }
//         } catch (error) {
//             console.log(error);
//         }
//     };

//     useEffect(() => {
//         if (video !== undefined && audio !== undefined) {
//             getUserMedia();
//             console.log("SET STATE HAS ", video, audio);

//         }


//     }, [video, audio])
//     let getMedia = () => {
//         setVideo(videoAvailable);
//         setAudio(audioAvailable);
//         connectToSocketServer();

//     }




//     let getUserMediaSuccess = (stream) => {
//         try {
//             window.localStream.getTracks().forEach(track => track.stop())
//         } catch (e) { console.log(e) }

//         window.localStream = stream
//         localVideoref.current.srcObject = stream

//         for (let id in connections) {
//             if (id === socketIdRef.current) continue

//             connections[id].addStream(window.localStream)

//             connections[id].createOffer().then((description) => {
//                 console.log(description)
//                 connections[id].setLocalDescription(description)
//                     .then(() => {
//                         socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
//                     })
//                     .catch(e => console.log(e))
//             })
//         }

//         stream.getTracks().forEach(track => track.onended = () => {
//             setVideo(false);
//             setAudio(false);

//             try {
//                 let tracks = localVideoref.current.srcObject.getTracks()
//                 tracks.forEach(track => track.stop())
//             } catch (e) { console.log(e) }

//             let blackSilence = (...args) => new MediaStream([black(...args), silence()])
//             window.localStream = blackSilence()
//             localVideoref.current.srcObject = window.localStream

//             for (let id in connections) {
//                 connections[id].addStream(window.localStream)

//                 connections[id].createOffer().then((description) => {
//                     connections[id].setLocalDescription(description)
//                         .then(() => {
//                             socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
//                         })
//                         .catch(e => console.log(e))
//                 })
//             }
//         })
//     }

//     let getUserMedia = () => {
//         if ((video && videoAvailable) || (audio && audioAvailable)) {
//             navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
//                 .then(getUserMediaSuccess)
//                 .then((stream) => { })
//                 .catch((e) => console.log(e))
//         } else {
//             try {
//                 let tracks = localVideoref.current.srcObject.getTracks()
//                 tracks.forEach(track => track.stop())
//             } catch (e) { }
//         }
//     }





//     let getDislayMediaSuccess = (stream) => {
//         console.log("HERE")
//         try {
//             window.localStream.getTracks().forEach(track => track.stop())
//         } catch (e) { console.log(e) }

//         window.localStream = stream
//         localVideoref.current.srcObject = stream

//         for (let id in connections) {
//             if (id === socketIdRef.current) continue

//             connections[id].addStream(window.localStream)

//             connections[id].createOffer().then((description) => {
//                 connections[id].setLocalDescription(description)
//                     .then(() => {
//                         socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
//                     })
//                     .catch(e => console.log(e))
//             })
//         }

//         stream.getTracks().forEach(track => track.onended = () => {
//             setScreen(false)

//             try {
//                 let tracks = localVideoref.current.srcObject.getTracks()
//                 tracks.forEach(track => track.stop())
//             } catch (e) { console.log(e) }

//             let blackSilence = (...args) => new MediaStream([black(...args), silence()])
//             window.localStream = blackSilence()
//             localVideoref.current.srcObject = window.localStream

//             getUserMedia()

//         })
//     }

//     let gotMessageFromServer = (fromId, message) => {
//         var signal = JSON.parse(message)

//         if (fromId !== socketIdRef.current) {
//             if (signal.sdp) {
//                 connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
//                     if (signal.sdp.type === 'offer') {
//                         connections[fromId].createAnswer().then((description) => {
//                             connections[fromId].setLocalDescription(description).then(() => {
//                                 socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
//                             }).catch(e => console.log(e))
//                         }).catch(e => console.log(e))
//                     }
//                 }).catch(e => console.log(e))
//             }

//             if (signal.ice) {
//                 connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
//             }
//         }
//     }




//     // let connectToSocketServer = () => {
//     //     socketRef.current = io.connect(server_url, { secure: false })

//     //     socketRef.current.on('signal', gotMessageFromServer)

//     //     socketRef.current.on('connect', () => {
//     //         socketRef.current.emit('join-call', window.location.href)
//     //         socketIdRef.current = socketRef.current.id

//     //         socketRef.current.on('chat-message', addMessage)

//     //         socketRef.current.on('user-left', (id) => {
//     //             setVideos((videos) => videos.filter((video) => video.socketId !== id))
//     //         })

//     let connectToSocketServer = () => {
//         socketRef.current = io(server_url, {
//             transports: ["websocket", "polling"],
//         });

//         socketRef.current.on("signal", gotMessageFromServer);

//         socketRef.current.on("connect", () => {
//             socketIdRef.current = socketRef.current.id;
//             socketRef.current.emit("join-call", window.location.href);
//         });
//     };

//     socketRef.current.on('user-joined', (id, clients) => {
//         clients.forEach((socketListId) => {

//             connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
//             // Wait for their ice candidate       
//             connections[socketListId].onicecandidate = function (event) {
//                 if (event.candidate != null) {
//                     socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
//                 }
//             }

//             // Wait for their video stream
//             connections[socketListId].onaddstream = (event) => {
//                 console.log("BEFORE:", videoRef.current);
//                 console.log("FINDING ID: ", socketListId);

//                 let videoExists = videoRef.current.find(video => video.socketId === socketListId);

//                 if (videoExists) {
//                     console.log("FOUND EXISTING");

//                     // Update the stream of the existing video
//                     setVideos(videos => {
//                         const updatedVideos = videos.map(video =>
//                             video.socketId === socketListId ? { ...video, stream: event.stream } : video
//                         );
//                         videoRef.current = updatedVideos;
//                         return updatedVideos;
//                     });
//                 } else {
//                     // Create a new video
//                     console.log("CREATING NEW");
//                     let newVideo = {
//                         socketId: socketListId,
//                         stream: event.stream,
//                         autoplay: true,
//                         playsinline: true
//                     };

//                     setVideos(videos => {
//                         const updatedVideos = [...videos, newVideo];
//                         videoRef.current = updatedVideos;
//                         return updatedVideos;
//                     });
//                 }
//             };


//             // Add the local video stream
//             if (window.localStream !== undefined && window.localStream !== null) {
//                 connections[socketListId].addStream(window.localStream)
//             } else {
//                 let blackSilence = (...args) => new MediaStream([black(...args), silence()])
//                 window.localStream = blackSilence()
//                 connections[socketListId].addStream(window.localStream)
//             }
//         })

//         if (id === socketIdRef.current) {
//             for (let id2 in connections) {
//                 if (id2 === socketIdRef.current) continue

//                 try {
//                     connections[id2].addStream(window.localStream)
//                 } catch (e) { }

//                 connections[id2].createOffer().then((description) => {
//                     connections[id2].setLocalDescription(description)
//                         .then(() => {
//                             socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
//                         })
//                         .catch(e => console.log(e))
//                 })
//             }
//         }
//     })
// })
//     }

// let silence = () => {
//     let ctx = new AudioContext()
//     let oscillator = ctx.createOscillator()
//     let dst = oscillator.connect(ctx.createMediaStreamDestination())
//     oscillator.start()
//     ctx.resume()
//     return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
// }
// let black = ({ width = 640, height = 480 } = {}) => {
//     let canvas = Object.assign(document.createElement("canvas"), { width, height })
//     canvas.getContext('2d').fillRect(0, 0, width, height)
//     let stream = canvas.captureStream()
//     return Object.assign(stream.getVideoTracks()[0], { enabled: false })
// }

// let handleVideo = () => {
//     setVideo(!video);
//     getUserMedia();
// }
// let handleAudio = () => {
//     setAudio(!audio)
//     getUserMedia();
// }

// useEffect(() => {
//     if (screen !== undefined) {
//         getDislayMedia();
//     }
// }, [screen])
// let handleScreen = () => {
//     setScreen(!screen);
// }

// let handleEndCall = () => {
//     try {
//         let tracks = localVideoref.current.srcObject.getTracks()
//         tracks.forEach(track => track.stop())
//     } catch (e) { }
//     window.location.href = "/"
// }

// let openChat = () => {
//     setModal(true);
//     setNewMessages(0);
// }
// let closeChat = () => {
//     setModal(false);
// }
// let handleMessage = (e) => {
//     setMessage(e.target.value);
// }

// const addMessage = (data, sender, socketIdSender) => {
//     setMessages((prevMessages) => [
//         ...prevMessages,
//         { sender: sender, data: data }
//     ]);
//     if (socketIdSender !== socketIdRef.current) {
//         setNewMessages((prevNewMessages) => prevNewMessages + 1);
//     }
// };



// let sendMessage = () => {
//     if (!socketRef.current) {
//         console.log("Socket not connected yet");
//         return;
//     }

//     socketRef.current.emit("chat-message", message, username);
//     setMessage("");
// };


// let connect = () => {
//     setAskForUsername(false);
//     getMedia();
// }


// return (
//     <div>

//         {askForUsername === true ?

//             <div>


//                 <h2>Enter into Lobby </h2>
//                 {/* <TextField id="outlined-basic" label="Username" value={username} onChange={e => setUsername(e.target.value)} variant="outlined" /> */}

//                 <TextField
//                     value={message}
//                     onChange={(e) => setMessage(e.target.value)}
//                     id="outlined-basic"
//                     label="Enter Your chat"
//                     variant="outlined"
//                     InputProps={{
//                         style: { color: 'white' }
//                     }}
//                     InputLabelProps={{
//                         style: { color: '#8b949e' }
//                     }}
//                 />
//                 <Button variant="contained" onClick={connect}>Connect</Button>


//                 <div>
//                     <video ref={localVideoref} autoPlay muted></video>
//                 </div>

//             </div> :


//             <div className={styles.meetVideoContainer}>

//                 {showModal ? <div className={styles.chatRoom}>

//                     <div className={styles.chatContainer}>
//                         <h1>Chat</h1>

//                         <div className={styles.chattingDisplay}>

//                             {messages.length !== 0 ? messages.map((item, index) => {

//                                 console.log(messages)
//                                 return (
//                                     <div style={{ marginBottom: "20px" }} key={index}>
//                                         <p style={{ fontWeight: "bold" }}>{item.sender}</p>
//                                         <p>{item.data}</p>
//                                     </div>
//                                 )
//                             }) : <p>No Messages Yet</p>}


//                         </div>

//                         <div className={styles.chattingArea}>
//                             <TextField value={message} onChange={(e) => setMessage(e.target.value)} id="outlined-basic" label="Enter Your chat" variant="outlined" />
//                             <Button variant='contained' onClick={sendMessage}>Send</Button>
//                         </div>


//                     </div>
//                 </div> : <></>}


//                 <div className={styles.buttonContainers}>
//                     <IconButton onClick={handleVideo} style={{ color: "white" }}>
//                         {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
//                     </IconButton>
//                     <IconButton onClick={handleEndCall} style={{ color: "red" }}>
//                         <CallEndIcon />
//                     </IconButton>
//                     <IconButton onClick={handleAudio} style={{ color: "white" }}>
//                         {audio === true ? <MicIcon /> : <MicOffIcon />}
//                     </IconButton>

//                     {screenAvailable === true ?
//                         <IconButton onClick={handleScreen} style={{ color: "white" }}>
//                             {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
//                         </IconButton> : <></>}

//                     <Badge badgeContent={newMessages} max={999} color='orange'>
//                         <IconButton onClick={() => setModal(!showModal)} style={{ color: "white" }}>
//                             <ChatIcon />                        </IconButton>
//                     </Badge>

//                 </div>


//                 <video className={styles.meetUserVideo} ref={localVideoref} autoPlay muted></video>

//                 <div className={styles.conferenceView}>
//                     {videos.map((video) => (
//                         <div key={video.socketId}>
//                             <video

//                                 data-socket={video.socketId}
//                                 ref={ref => {
//                                     if (ref && video.stream) {
//                                         ref.srcObject = video.stream;
//                                     }
//                                 }}
//                                 autoPlay
//                             >
//                             </video>
//                         </div>

//                     ))}

//                 </div>

//             </div>

//         }

//     </div>
// )
// }


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

const server_url = server;
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
        } catch (e) {}
      });

      try {
        if (window.localStream) {
          window.localStream.getTracks().forEach((track) => track.stop());
        }
      } catch (e) {}
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
    } catch (e) {}

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
      } catch (e) {}

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
    socketRef.current = io(server_url, {
      transports: ["websocket", "polling"],
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
        } catch (e) {}
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
    } catch (e) {}

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