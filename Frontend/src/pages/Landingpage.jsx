// import React from 'react'
import { useNavigate  , Link} from "react-router-dom";
import "../App.css";



export default function Landingpage() {
  const navigate = useNavigate();
  return (
    <div className='landingpagecontainer'>
     <nav>
      <div className='navHeader'>
        <h2>Apna Video Call</h2>
      </div>
      <div className='navlist'>
        <p onClick={() =>{
          window.location.href="/q23qsc";
        }}>Join as Guest</p>
        <p  onClick={()=>{
        navigate("/auth")
       }}>Register</p>
       <div onClick={()=>{
        navigate("/auth")
       }} role='button'>
       <p>Login</p>
       </div>
      </div> 
     </nav>



     <div className="landingMainContainer">
      <div>
        <h1> <span style={{color:"#FF9839"}}>Connect</span> with your Loved Ones</h1>
        <p>Cover a distance by Apna Video Call </p>
        <div role="button">
        <Link to={"/auth"}>Get Started</Link>
        </div>
      </div>
      <div>
        <img src="/mobile.png" alt="" />
      </div>

     </div>

    </div>
  )
}
