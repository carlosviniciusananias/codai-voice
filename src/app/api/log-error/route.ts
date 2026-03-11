import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, stack, code, timestamp } = body;

    // Validação básica
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Em um cenário real, poderíamos enviar para Sentry, Logtail, etc.
    // Por enquanto, vamos usar console.error para que apareça nos logs do servidor (Vercel/Docker)
    console.error('[SANDBOX ERROR LOG]', {
      message,
      stack,
      codeSnippet: code?.substring(0, 500), // Limitar tamanho do snippet
      timestamp: timestamp || new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in log-error API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
