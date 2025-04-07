import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdKeyboardBackspace } from "react-icons/md";
import { CertificateContext } from '../context/CertificateContext';
import '../styles/CertificateEditor.css';

const CertificateEditor = () => {
  const navigate = useNavigate();
  const { 
    certificateImage, 
    names,
    previewIndex, setPreviewIndex,
    namePosition, setNamePosition,
    fontSize, setFontSize,
    fontColor, setFontColor,
    fontFamily, setFontFamily,
    fontStyle, setFontStyle,
    textRotation, setTextRotation
  } = useContext(CertificateContext);

  // Refs
  const canvasRef = useRef(null);
  
  // Redirect if no data is loaded
  useEffect(() => {
    if (!certificateImage || names.length === 0) {
      navigate('/');
    }
  }, [certificateImage, names, navigate]);

  // Handle clicking on the canvas to position the name
  const handleCanvasClick = (e) => {
    if (!certificateImage) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setNamePosition({ x, y });
  };
  
  // Render certificate canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !certificateImage) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas size to match image
    canvas.width = certificateImage.width;
    canvas.height = certificateImage.height;
    
    // Draw the certificate background image
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      
      // Save the current context state
      ctx.save();
      
      // Move to the position where we want to draw the text
      ctx.translate(namePosition.x, namePosition.y);
      
      // Rotate the context by the specified angle (in radians)
      ctx.rotate(textRotation * Math.PI / 180);
      
      // Draw the name
      ctx.font = `${fontStyle} ${fontSize}px ${fontFamily}`;
      ctx.fillStyle = fontColor;
      ctx.textAlign = 'center';
      
      const name = names[previewIndex] || 'Your Name Here';
      ctx.fillText(name, 0, 0);
      
      // Restore the context to its original state
      ctx.restore();
      
      // Draw position indicator
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(namePosition.x, namePosition.y, 5, 0, Math.PI * 2);
      ctx.stroke();
      
      // Draw rotation indicator line
      ctx.beginPath();
      ctx.moveTo(namePosition.x, namePosition.y);
      ctx.lineTo(
        namePosition.x + Math.cos(textRotation * Math.PI / 180) * 50,
        namePosition.y + Math.sin(textRotation * Math.PI / 180) * 50
      );
      ctx.stroke();
    };
    img.src = certificateImage.src;
    
  }, [certificateImage, namePosition, previewIndex, names, fontSize, fontColor, fontFamily, fontStyle, textRotation]);
  
  // Download certificate as image
  const downloadCertificate = (name) => {
    if (!name || !certificateImage) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = certificateImage.width;
    canvas.height = certificateImage.height;
    
    // Draw certificate image
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      
      // Save the current context state
      ctx.save();
      
      // Move to the position where we want to draw the text
      ctx.translate(namePosition.x, namePosition.y);
      
      // Rotate the context by the specified angle (in radians)
      ctx.rotate(textRotation * Math.PI / 180);
      
      // Draw the name
      ctx.font = `${fontStyle} ${fontSize}px ${fontFamily}`;
      ctx.fillStyle = fontColor;
      ctx.textAlign = 'center';
      ctx.fillText(name, 0, 0);
      
      // Restore the context to its original state
      ctx.restore();
      
      // Convert canvas to image and download
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `Certificate-${name.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    img.src = certificateImage.src;
  };
  
  // Download all certificates
  const downloadAllCertificates = () => {
    if (names.length === 0 || !certificateImage) return;
    
    // Use setTimeout to avoid blocking the UI
    names.forEach((name, index) => {
      setTimeout(() => {
        downloadCertificate(name);
      }, index * 500); // Stagger downloads to prevent browser issues
    });
  };
  
  // Reset to default settings
  const resetSettings = () => {
    if (certificateImage) {
      setNamePosition({
        x: certificateImage.width / 2,
        y: certificateImage.height / 2
      });
    } else {
      setNamePosition({ x: 400, y: 300 });
    }
    setFontSize(42);
    setFontColor('#000000');
    setFontFamily('Arial');
    setFontStyle('bold');
    setTextRotation(0);
  };

  return (
    <div className="certificate-editor">
      <div className="app-header">
        <div className="container">
          <h1 className="app-title">Certificate Editor</h1>
          <button className="back-button" onClick={() => navigate('/')}>
          <MdKeyboardBackspace className='back-arrow' size={20}/> Back to Upload
          </button>
        </div>
      </div>
      
      <div className="container py-5">
        <div className="row g-4">
          {/* Left side - Preview */}
          <div className="col-lg-7 mb-4">
            <div className="preview-container">
              <div className="preview-header">
                <h5>
                  <i className="bi bi-eye"></i>
                  Certificate Preview
                </h5>
                {certificateImage && names.length > 0 && (
                  <div className="preview-navigation">
                    <button 
                      className="nav-button"
                      onClick={() => setPreviewIndex(prev => (prev > 0 ? prev - 1 : names.length - 1))}
                      disabled={names.length <= 1}
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                    
                    <div className="preview-counter">
                      {previewIndex + 1} / {names.length}
                    </div>
                    
                    <button 
                      className="nav-button"
                      onClick={() => setPreviewIndex(prev => (prev < names.length - 1 ? prev + 1 : 0))}
                      disabled={names.length <= 1}
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </div>
                )}
              </div>
              
              <div className="preview-area">
                {certificateImage ? (
                  <div className="canvas-wrapper">
                    <canvas 
                      ref={canvasRef} 
                      className="certificate-canvas"
                      onClick={handleCanvasClick}
                    />
                    {names.length > 0 && (
                      <div className="certificate-name-display">
                        Currently Previewing: <strong>{names[previewIndex]}</strong>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="canvas-placeholder">
                    <div className="placeholder-content">
                      <div className="placeholder-icon">
                        <i className="bi bi-card-image"></i>
                      </div>
                      <h4>No Template Selected</h4>
                      <p>Please go back and upload a certificate template</p>
                    </div>
                  </div>
                )}
              </div>
              
              {certificateImage && names.length > 0 && (
                <div className="download-actions">
                  <button 
                    className="action-button primary"
                    onClick={() => downloadCertificate(names[previewIndex])}
                  >
                    <i className="bi bi-download"></i>
                    Download Current Certificate
                  </button>
                  
                  <button 
                    className="action-button secondary"
                    onClick={downloadAllCertificates}
                  >
                    <i className="bi bi-file-earmark-zip"></i>
                    Download All ({names.length}) Certificates
                  </button>
                </div>
              )}
            </div>
            
            {/* Stats Panel */}
            {names.length > 0 && (
              <div className="stats-panel">
                <div className="stat-item">
                  <div className="stat-value">{names.length}</div>
                  <div className="stat-label">Total Certificates</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{certificateImage ? "Ready" : "Pending"}</div>
                  <div className="stat-label">Template Status</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{textRotation !== 0 ? "Rotated" : "Straight"}</div>
                  <div className="stat-label">Text Orientation</div>
                </div>
              </div>
            )}
          </div>
          
          {/* Right side - Text Settings */}
          <div className="col-lg-4">
            <div className="settings-container">
              {/* Text Design Settings */}
              <div className="panel">
                <div className="panel-header">
                  <h5>Text Design</h5>
                </div>
                <div className="panel-body">
                  <div className="design-controls">
                    <div className="control-group">
                      <label>Font Size</label>
                      <div className="slider-control">
                        <input 
                          type="range" 
                          className="slider" 
                          min="12" 
                          max="120" 
                          value={fontSize} 
                          onChange={(e) => setFontSize(parseInt(e.target.value))}
                        />
                        <span className="slider-value">{fontSize}px</span>
                      </div>
                    </div>
                    
                    <div className="control-group">
                      <label>Text Rotation</label>
                      <div className="slider-control">
                        <input 
                          type="range" 
                          className="slider" 
                          min="-180" 
                          max="180" 
                          value={textRotation} 
                          onChange={(e) => setTextRotation(parseInt(e.target.value))}
                        />
                        <span className="slider-value">{textRotation}°</span>
                      </div>
                    </div>
                    
                    <div className="control-group">
                      <label>Font Color</label>
                      <div className="color-control">
                        <input 
                          type="color" 
                          className="color-picker" 
                          value={fontColor} 
                          onChange={(e) => setFontColor(e.target.value)}
                        />
                        <span className="color-value">{fontColor}</span>
                      </div>
                    </div>
                    
                    <div className="control-group">
                      <label>Font Family</label>
                      <select 
                        className="select-control" 
                        value={fontFamily} 
                        onChange={(e) => setFontFamily(e.target.value)}
                      >
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Tahoma">Tahoma</option>
                        <option value="Trebuchet MS">Trebuchet MS</option>
                        <option value="Impact">Impact</option>
                        <option value="Palatino">Palatino</option>
                        <option value="Garamond">Garamond</option>
                        <option value="Bookman">Bookman</option>
                        <option value="Avant Garde">Avant Garde</option>
                        {/* Added more font families */}
                        <option value="Helvetica">Helvetica</option>
                        <option value="Calibri">Calibri</option>
                        <option value="Cambria">Cambria</option>
                        <option value="Candara">Candara</option>
                        <option value="Century Gothic">Century Gothic</option>
                        <option value="Franklin Gothic">Franklin Gothic</option>
                        <option value="Copperplate">Copperplate</option>
                        <option value="Optima">Optima</option>
                        <option value="Baskerville">Baskerville</option>
                        <option value="Didot">Didot</option>
                        <option value="Futura">Futura</option>
                        <option value="Geneva">Geneva</option>
                        <option value="Lucida Grande">Lucida Grande</option>
                        <option value="Segoe UI">Segoe UI</option>
                        <option value="Comic Sans MS">Comic Sans MS</option>
                        <option value="Brush Script MT">Brush Script MT</option>
                        <option value="Papyrus">Papyrus</option>
                        <option value="Lucida Calligraphy">Lucida Calligraphy</option>
                        <option value="Perpetua">Perpetua</option>
                        <option value="Rockwell">Rockwell</option>
                      </select>
                    </div>
                    
                    <div className="control-group">
                      <label>Font Style</label>
                      <select 
                        className="select-control" 
                        value={fontStyle} 
                        onChange={(e) => setFontStyle(e.target.value)}
                      >
                        <option value="">Normal</option>
                        <option value="italic">Italic</option>
                        <option value="bold">Bold</option>
                        <option value="bold italic">Bold Italic</option>
                      </select>
                    </div>
                    
                    <div className="control-group">
                      <label>Position</label>
                      <div className="position-controls">
                        <div className="position-input">
                          <span>X:</span>
                          <input 
                            type="number" 
                            value={Math.round(namePosition.x)} 
                            onChange={(e) => setNamePosition(prev => ({...prev, x: parseInt(e.target.value)}))}
                          />
                        </div>
                        <div className="position-input">
                          <span>Y:</span>
                          <input 
                            type="number" 
                            value={Math.round(namePosition.y)} 
                            onChange={(e) => setNamePosition(prev => ({...prev, y: parseInt(e.target.value)}))}
                          />
                        </div>
                      </div>
                      <div className="position-hint">
                        <i className="bi bi-info-circle"></i>
                        <span>Click on the certificate image to set position</span>
                      </div>
                    </div>
                    
                    <button className="reset-button" onClick={resetSettings}>
                      <i className="bi bi-arrow-counterclockwise"></i>
                      Reset Formatting
                    </button>
                  </div>
                </div>
              </div>
              
            </div>
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

export default CertificateEditor;