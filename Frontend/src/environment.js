let IS_PROD = true;
const server = IS_PROD ?
    "https://apna-video-call-h19t.onrender.com" :
    "http://localhost:8000";

export { server };
export default server;