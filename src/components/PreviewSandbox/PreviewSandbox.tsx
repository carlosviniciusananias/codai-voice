'use client';

import React, { useEffect, useRef, useState } from 'react';

interface PreviewSandboxProps {
  code: string;
  className?: string;
  onError?: (error: { message: string; stack?: string; code?: string }) => void;
}

export const PreviewSandbox: React.FC<PreviewSandboxProps> = ({ code, className, onError }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);

  const generateSandboxHtml = () => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: sans-serif; margin: 0; padding: 1rem; overflow-x: hidden; }
          .error-container { color: #ef4444; background: #fee2e2; padding: 1rem; border-radius: 0.5rem; border: 1px solid #fecaca; font-size: 14px; }
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script>
          const reportError = (message, stack) => {
            window.parent.postMessage({ 
              type: 'error', 
              message: message, 
              stack: stack,
              timestamp: new Date().toISOString()
            }, '*');
          };

          window.onerror = function(message, source, lineno, colno, error) {
            reportError(message, error?.stack);
            return true; // Prevenir log no console do iframe
          };

          window.addEventListener('unhandledrejection', (event) => {
            reportError('Unhandled Promise Rejection: ' + event.reason, event.reason?.stack);
          });

          window.addEventListener('message', (event) => {
            if (event.data.type === 'render') {
              try {
                const root = document.getElementById('root');
                if (root) root.innerHTML = '';
                
                const oldScripts = document.querySelectorAll('script[data-sandbox]');
                oldScripts.forEach(s => s.remove());

                const userCode = event.data.code.trim();
                
                if (userCode.startsWith('<')) {
                  root.innerHTML = userCode;
                  return;
                }

                const script = document.createElement('script');
                script.type = 'module';
                script.setAttribute('data-sandbox', 'true');
                
                // Embrulhar em uma IIFE para isolamento e captura de erro imediata
                script.textContent = \`(function() {
                  try {
                    \${userCode}
                  } catch (err) {
                    window.parent.postMessage({ 
                      type: "error", 
                      message: err.message, 
                      stack: err.stack 
                    }, "*");
                  }
                })();\`;
                
                document.body.appendChild(script);
              } catch (err) {
                reportError(err.message, err.stack);
              }
            }
          });
        </script>
      </body>
      </html>
    \`;
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'error') {
        const errorData = {
          message: event.data.message,
          stack: event.data.stack,
          code: code
        };
        setError(event.data.message);
        console.error('Sandbox Error:', event.data);
        
        if (onError) {
          onError(errorData);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setError(null);
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage({ type: 'render', code }, '*');
      }
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [code]);

  return (
    <div className={`relative w-full h-full min-h-[400px] border rounded-lg overflow-hidden bg-white ${className || ''}`}>
      {error && (
        <div className="absolute top-0 left-0 right-0 p-4 bg-red-50 border-b border-red-200 text-red-600 z-10 text-sm">
          <strong>Render Error:</strong> {error}
        </div>
      )}
      <iframe
        ref={iframeRef}
        title="Preview Sandbox"
        sandbox="allow-scripts"
        srcDoc={generateSandboxHtml()}
        className="w-full h-full border-none"
      />
    </div>
  );
};
