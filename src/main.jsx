import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// StrictMode intentionally off — double-mounting effects causes frame
// extraction to fire twice in dev with no benefit here.
createRoot(document.getElementById('root')).render(<App />);
