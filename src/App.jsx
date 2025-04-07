import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import CertificateEditor from './components/CertificateEditor';
import { CertificateProvider } from './context/CertificateContext';
import './App.css';

function App() {
  return (
    <CertificateProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/editor" element={<CertificateEditor />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </CertificateProvider>
  );
}

export default App;