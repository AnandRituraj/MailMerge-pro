import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Add Inter font
const interFontLink = document.createElement('link');
interFontLink.rel = 'stylesheet';
interFontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
document.head.appendChild(interFontLink);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
); 