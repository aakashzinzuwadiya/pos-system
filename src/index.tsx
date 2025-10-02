import React from 'react';
import ReactDOM from 'react-dom/client'; // Use createRoot from react-dom/client in React 18
import './index.css';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <Router>
            <App />
      </Router>
    </React.StrictMode>
  );
}
