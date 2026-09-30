import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {HelmetProvider} from 'react-helmet-async';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './components/ThemeContext';
import { toast as hotToast } from 'react-hot-toast';
import { toast as sonnerToast } from 'sonner';
import './index.css';
import './styles/bazar360-v2.css';
import './styles/worldclass-ui.css';

// Keep user feedback and runtime errors visible. Production code should not globally suppress
// successful actions or unhandled promise rejections.

const queryParams=new URLSearchParams(window.location.search); const redirectPath=queryParams.get('p');
if(redirectPath){ let cleanPath='/'+redirectPath.replace(/~and~/g,'&'); const redirectSearch=queryParams.get('q'); if(redirectSearch) cleanPath+='?'+redirectSearch.replace(/~and~/g,'&'); cleanPath+=window.location.hash; try{window.history.replaceState(null,'',cleanPath);}catch{} }

createRoot(document.getElementById('root')!).render(<StrictMode><ErrorBoundary><HelmetProvider><ThemeProvider><App /></ThemeProvider></HelmetProvider></ErrorBoundary></StrictMode>);

if('serviceWorker' in navigator){ window.addEventListener('load',()=>{ navigator.serviceWorker.register('/sw.js').catch(()=>{}); }); }
