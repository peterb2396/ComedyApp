import { BrowserRouter, Route, Routes } from "react-router-dom";
import './styles.css';
import Nav from './Nav';
import Home from './Home';

const Main = () => {

  const SERVER_URL = `http://localhost:4242`
  
  document.body.style = 'background: #f2f2f2';

  return (
    <BrowserRouter>
      <Nav/>
        <Routes>
            <Route index          element={<Home host = {SERVER_URL}/>} />
            {/* <Route path="login"   element={<Login host = {SERVER_URL}/>} />
            <Route path="account" element={<Account host = {SERVER_URL}/>} /> */}
        </Routes>
    </BrowserRouter>
  );
};

export default Main;
