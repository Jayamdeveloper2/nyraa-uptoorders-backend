import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <BrowserRouter basename="/nyraa-admin-panel">
      <App />
    </BrowserRouter>
  );
} else {
  console.error('Root element not found');
}