
import { NavLink } from "react-router-dom";

function Nav() {

    function isLoggedIn()
    {
        if (localStorage.getItem('token'))
            return true
        return false
    }


    return (
        <div id = "nav">
            <div class="navbar-container">
                
                <ul class="navbar">
                    <li><NavLink to = "/">Home</NavLink></li>
                    <li><NavLink to = {isLoggedIn()? "/account": "/login"} >{isLoggedIn()? "My Account": "Login"}</NavLink></li>
                </ul>
            
            </div>
            <hr></hr>
        </div>
        
    )
 }

    

export default Nav;