import { BrowserRouter, Route, Routes } from "react-router-dom";

import './styles.css';
import Nav from './Nav';
import Home from './Home';
import ComicSearch from "./ComicSearch";

// main collects all pages and prepares to show them to the users when they change the URL (through navbar)
const Main = () => {

  const SERVER_URL = `http://localhost:4242`
  
  document.body.style = 'background: #f2f2f2';

  return (
    <BrowserRouter>
      <Nav/>
        <Routes>
            <Route index                    element={<Home host = {SERVER_URL}/>} />
            <Route path="/comic-search"     element={<ComicSearch host = {SERVER_URL}/>} />
            {/* <Route path="login"   element={<Login host = {SERVER_URL}/>} />
            <Route path="account" element={<Account host = {SERVER_URL}/>} /> */}
        </Routes>
    </BrowserRouter>
  );
};

export default Main;
