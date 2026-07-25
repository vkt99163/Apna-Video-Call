import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import './App.css'
import Landingpage from './pages/Landingpage';
import Authentication from './pages/Authentication';
import { AuthProvider } from './context/AuthContext';
import VideoMeetComponent from './pages/VideoMeet';
import HomeComponent from './pages/Home';
import History from './pages/history';
function App(){
  return( <>
 
 <Router>
  <AuthProvider>
  <Routes>
    <Route path="/" element={<Landingpage/>}/>

    <Route path="/auth" element={<Authentication/>}/>
    <Route path="/home" element={<HomeComponent/>}/>
    <Route path="/history" element= {<History/>}/>

    <Route path="/:url" element={<VideoMeetComponent/>}/>

  </Routes>
  </AuthProvider>
 </Router>

  </>
  );
}

export default App;