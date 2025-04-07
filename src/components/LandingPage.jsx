import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { GoArrowUpRight } from 'react-icons/go';
import { CertificateContext } from '../context/CertificateContext';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const { setCertificateImage, setNames } = useContext(CertificateContext);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [imageSelected, setImageSelected] = useState(false);
  const [namesSelected, setNamesSelected] = useState(false);

  // Handle certificate image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setCertificateImage({
          src: event.target.result,
          width: img.width,
          height: img.height
        });
        setImageSelected(true);
      };
      img.src = event.target.result;
    };
    
    reader.readAsDataURL(file);
  };
  
  // Handle Excel file upload
  const handleFileUpload = (e) => {
    setLoading(true);
    setErrorMessage('');
    const file = e.target.files[0];
    
    if (!file) {
      setLoading(false);
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        
        if (jsonData.length === 0) {
          throw new Error("No data found in the Excel sheet");
        }
        
        // Extract names (try multiple possible column names)
        const extractedNames = jsonData.map(row => {
          // Try to find a name field (case insensitive)
          const nameKey = Object.keys(row).find(
            key => key.toLowerCase() === 'name' || 
                   key.toLowerCase().includes('name') || 
                   key.toLowerCase().includes('participant') ||
                   key.toLowerCase().includes('student')
          );
          
          return nameKey ? row[nameKey] : null;
        }).filter(Boolean);
        
        if (extractedNames.length === 0) {
          throw new Error("Could not find any name columns in the Excel sheet");
        }
        
        setNames(extractedNames);
        setNamesSelected(true);
      } catch (error) {
        setErrorMessage(`Error processing file: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      setErrorMessage("Failed to read the file");
      setLoading(false);
    };
    
    reader.readAsArrayBuffer(file);
  };

  const handleGenerateCertificates = () => {
    if (imageSelected && namesSelected) {
      navigate('/editor');
    } else {
      setErrorMessage("Please upload both a certificate template and an Excel file with names");
    }
  };

  // Function to navigate to LinkedIn profile
  const navigateToLinkedIn = () => {
    window.open('https://www.linkedin.com/in/ashish-lukka/', '_blank');
  };

  return (
    <div className="landing-page">
      <div className="app-header">
        <div className="container">
          <div className="d-flex">
          <h1 className="app-title">Professional Certificate Generator</h1>
          <p className="app-subtitle">Create beautiful, customized certificates in minutes</p>
          </div>
          <div className="creator-info" onClick={navigateToLinkedIn}>
            <p>Created by</p>
            <span className="name">Ashish Lukka</span><GoArrowUpRight size={22} className="external-link-icon" />
          </div>
        </div>
      </div>
      
      <div className="container py-5">
        <div className="upload-section">
          <div className="upload-container">
            <div className="upload-panel">
              <div className="panel-header">
                <h5>Certificate Template</h5>
              </div>
              <div className="panel-body">
                <div className="upload-area">
                  <input 
                    type="file" 
                    id="certificate-upload"
                    className="upload-input" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="certificate-upload" className="upload-label">
                    <div className="upload-text">
                      <span className="primary-text">Choose a template image</span>
                      <span className="secondary-text">or drag and drop here</span>
                    </div>
                  </label>
                </div>
                {imageSelected && (
                  <div className="status-indicator success">
                    <i className="bi bi-check-circle"></i>
                    <span>Template image uploaded successfully</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="upload-panel">
              <div className="panel-header">
                <h5>Names Data</h5>
              </div>
              <div className="panel-body">
                <div className="upload-area">
                  <input 
                    type="file" 
                    id="excel-upload"
                    className="upload-input" 
                    accept=".xlsx,.xls,.csv" 
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="excel-upload" className="upload-label">
                    <div className="upload-text">
                      <span className="primary-text">Upload Excel or CSV file</span>
                      <span className="secondary-text">with participant names</span>
                    </div>
                  </label>
                </div>
                
                {loading && (
                  <div className="status-indicator loading">
                    <div className="spinner"></div>
                    <span>Processing file...</span>
                  </div>
                )}
                
                {namesSelected && !loading && (
                  <div className="status-indicator success">
                    <i className="bi bi-check-circle"></i>
                    <span>Names data loaded successfully</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {errorMessage && (
            <div className="error-message mt-3">
              <i className="bi bi-exclamation-triangle"></i>
              <span>{errorMessage}</span>
            </div>
          )}
          
          <div className="generate-button-container">
            <button 
              className={`generate-button ${(!imageSelected || !namesSelected) ? 'disabled' : ''}`}
              onClick={handleGenerateCertificates}
              disabled={!imageSelected || !namesSelected}
            >
              <i className="bi bi-magic"></i>
              Generate Certificates
            </button>
          </div>
          
          <div className="quick-guide">
            <h4>Quick Guide</h4>
            <ol>
              <li>Upload your certificate template image</li>
              <li>Upload Excel file with participant names</li>
              <li>Click "Generate Certificates" to proceed to the editor</li>
              <li>Position and style your text in the editor</li>
              <li>Preview and download your certificates</li>
            </ol>
          </div>
        </div>
      </div>
      
      <footer className="app-footer">
        <div className="container">
          <div className="footer-content">
            <p>&copy; 2025 Professional Certificate Generator. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;