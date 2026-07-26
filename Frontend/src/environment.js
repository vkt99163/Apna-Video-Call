let IS_PROD = true;

const serverUrl = IS_PROD 
  ? "https://apna-video-call-h19t.onrender.com" 
  : "http://localhost:8000";

const server = serverUrl.trim();

export { server };
export default server;