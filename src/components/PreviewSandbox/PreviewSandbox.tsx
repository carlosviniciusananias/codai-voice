'use client';

import React, { useEffect, useRef, useState } from 'react';

interface PreviewSandboxProps {
  code: string;
  className?: string;
}

export const PreviewSandbox: React.FC<PreviewSandboxProps> = ({ code, className }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);

  const generateSandboxHtml = (userCode: string) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: sans-serif; margin: 0; padding: 1rem; }
          .error-container { color: #ef4444; background: #fee2e2; padding: 1rem; border-radius: 0.5rem; border: 1px solid #fecaca; }
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script>
          window.onerror = function(message, source, lineno, colno, error) {
            window.parent.postMessage({ type: 'error', message: message }, '*');
          };

          window.addEventListener('message', (event) => {
            if (event.data.type === 'render') {
              try {
                const root = document.getElementById('root');
                if (root) root.innerHTML = '';
                
                // Limpar scripts anteriores
                const oldScripts = document.querySelectorAll('script[data-sandbox]');
                oldScripts.forEach(s => s.remove());

                const script = document.createElement('script');
                script.type = 'module';
                script.setAttribute('data-sandbox', 'true');
                script.textContent = \`
                  try {
                    \${event.data.code}
                  } catch (err) {
                    window.parent.postMessage({ 
                      type: 'error', 
                      message: err.message,
                      stack: err.stack 
                    }, '*');
                  }
                \`;
                document.body.appendChild(script);
              } catch (err) {
                window.parent.postMessage({ 
                  type: 'error', 
                  message: err.message 
                }, '*');
              }
            }
          });

          // Capturar erros de carregamento de recursos ou outros erros não pegos pelo try-catch
          window.addEventListener('error', (event) => {
            window.parent.postMessage({ 
              type: 'error', 
              message: event.message || 'Unknown runtime error'
            }, '*');
          }, true);

          // Capturar promessas rejeitadas
          window.addEventListener('unhandledrejection', (event) => {
            window.parent.postMessage({ 
              type: 'error', 
              message: 'Unhandled Promise Rejection: ' + event.reason 
            }, '*');
          });
        </script>
      </body>
      </html>
    \`;
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'error') {
        setError(event.data.message);
        console.error('Sandbox Error:', event.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    setError(null);
    const timeoutId = setTimeout(() => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage({ type: 'render', code }, '*');
      }
    }, 100); // Pequeno delay para garantir que o iframe carregou o srcDoc inicial
    return () => clearTimeout(timeoutId);
  }, [code]);

  return (
    <div className={`relative w-full h-full min-h-[400px] border rounded-lg overflow-hidden bg-white ${className}`}>
      {error && (
        <div className="absolute top-0 left-0 right-0 p-4 bg-red-50 border-b border-red-200 text-red-600 z-10 text-sm">
          <strong>Render Error:</strong> {error}
        </div>
      )}
      <iframe
        ref={iframeRef}
        title="Preview Sandbox"
        sandbox="allow-scripts"
        srcDoc={generateSandboxHtml('')}
        className="w-full h-full border-none"
      />
    </div>
  );
};
