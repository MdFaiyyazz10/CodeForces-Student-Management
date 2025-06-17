import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {Toaster} from 'react-hot-toast'
import Home from './components/Home';
import ThemeProvider from './components/ThemeProvider';
import StudentProfile from './pages/StudentProfile.jsx';
import './App.css'
import Navbar from './components/Navbar.jsx';

const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
      <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/student/:id" element={<StudentProfile />} />
        </Routes>
          <Toaster />
      </BrowserRouter>
    </ThemeProvider>
   
  );
};

export default App;


export const backendUrl = 'http://localhost:4000/api/v1'