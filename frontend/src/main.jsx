import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

console.log('Main.jsx is executing');
const container = document.getElementById('root');
console.log('Root container:', container);

if (container) {
  const root = createRoot(container);
  root.render(<App />);
  console.log('App render called');
} else {
  console.error('Failed to find root container');
}
