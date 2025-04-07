import React, { createContext, useState } from 'react';

export const CertificateContext = createContext();

export const CertificateProvider = ({ children }) => {
  const [certificateImage, setCertificateImage] = useState(null);
  const [names, setNames] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  
  // Text position and styling for the name
  const [namePosition, setNamePosition] = useState({ x: 400, y: 300 });
  const [fontSize, setFontSize] = useState(42);
  const [fontColor, setFontColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontStyle, setFontStyle] = useState('bold');
  const [textRotation, setTextRotation] = useState(0);

  return (
    <CertificateContext.Provider
      value={{
        certificateImage, 
        setCertificateImage,
        names, 
        setNames,
        previewIndex, 
        setPreviewIndex,
        namePosition, 
        setNamePosition,
        fontSize, 
        setFontSize,
        fontColor, 
        setFontColor,
        fontFamily, 
        setFontFamily,
        fontStyle, 
        setFontStyle,
        textRotation, 
        setTextRotation
      }}
    >
      {children}
    </CertificateContext.Provider>
  );
};