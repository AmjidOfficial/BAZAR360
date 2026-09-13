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

// Global toast interceptor to silence unnecessary success notifications
if (typeof window !== 'undefined') {
  const forbiddenKeywords = ['success','saved','updated','published','changed','registered','uploaded','deleted','copied','downloaded','exported','added','removed','marked','sent','cleared','selected','applied','authenticated','logged','confirmed','verified','vcard','pdf','signage','clipboard','whatsapp','liked'];
  const isForbidden = (msg:any):boolean => { if(!msg) return false; const s=typeof msg==='string'?msg.toLowerCase():String(msg).toLowerCase(); return forbiddenKeywords.some(k=>s.includes(k))||s.includes('✓')||s.includes('★'); };
  if(hotToast&&typeof hotToast.success==='function'){ const originalHotSuccess=hotToast.success; hotToast.success=(message,options)=>isForbidden(message)?'':originalHotSuccess(message,options); }
  if(sonnerToast&&typeof sonnerToast.success==='function'){ const originalSonnerSuccess=sonnerToast.success; sonnerToast.success=(message,data)=>isForbidden(message)?'':originalSonnerSuccess(message,data); }
}

if(typeof window!=='undefined'){
  window.addEventListener('error',(event)=>{ if(event.message==='Script error.'||event.message==='Script error'){ event.preventDefault(); }});
  window.addEventListener('unhandledrejection',(event)=>{ console.warn('[BAZAR360] Unhandled promise rejection handled:',event.reason); event.preventDefault(); });
}

const queryParams=new URLSearchParams(window.location.search); const redirectPath=queryParams.get('p');
if(redirectPath){ let cleanPath='/'+redirectPath.replace(/~and~/g,'&'); const redirectSearch=queryParams.get('q'); if(redirectSearch) cleanPath+='?'+redirectSearch.replace(/~and~/g,'&'); cleanPath+=window.location.hash; try{window.history.replaceState(null,'',cleanPath);}catch{} }

createRoot(document.getElementById('root')!).render(<StrictMode><ErrorBoundary><HelmetProvider><ThemeProvider><App /></ThemeProvider></HelmetProvider></ErrorBoundary></StrictMode>);

if('serviceWorker' in navigator){ window.addEventListener('load',()=>{ navigator.serviceWorker.register('/sw.js').catch(()=>{}); }); }
