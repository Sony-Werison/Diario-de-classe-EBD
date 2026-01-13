
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getInitialData } from '@/lib/data';

const DATA_BLOB_KEY = 'data.json';

export async function GET(request: NextRequest) {
  try {
    // A função `get` do @vercel/blob/client é para o client-side. 
    // No backend, usamos a API REST diretamente ou o SDK admin, mas aqui vamos simular o client-side `get`
    // para verificar a existência do blob. A forma mais segura é usar o `head` para verificar.
    // No entanto, para simplicidade e compatibilidade com o que parece ser a intenção, vamos tentar buscar
    // e capturar o erro 404.
    const { head } = await import('@vercel/blob');
    await head(`${process.env.BLOB_URL}/${DATA_BLOB_KEY}`, {
        token: process.env.BLOB_READ_WRITE_TOKEN
    });

    // Se o `head` for bem-sucedido, significa que o blob existe. Agora podemos obter o conteúdo.
    const { get } = await import('@vercel/blob/client');
    const blob = await get(DATA_BLOB_KEY, {
        token: process.env.BLOB_READ_WRITE_TOKEN
    });
    const data = await blob.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    if (error.status === 404) {
        // Se o blob não existir (erro 404), crie-o com dados iniciais
        const initialData = getInitialData();
        await put(DATA_BLOB_KEY, JSON.stringify(initialData), { 
            access: 'protected', 
            token: process.env.BLOB_READ_WRITE_TOKEN 
        });
        return NextResponse.json(initialData, { status: 200 });
    }
    
    // Para qualquer outro erro, retorne um 500
    console.error(error);
    return NextResponse.json({ message: "Erro ao buscar os dados", error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const dataString = JSON.stringify(body);
    await put(DATA_BLOB_KEY, dataString, { 
        access: 'protected', 
        token: process.env.BLOB_READ_WRITE_TOKEN 
    });
    return NextResponse.json({ message: "Dados salvos com sucesso" }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: "Erro ao salvar os dados", error: error.message }, { status: 500 });
  }
}
