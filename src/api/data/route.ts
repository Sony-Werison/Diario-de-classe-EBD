
import { put, list, del, head } from '@vercel/blob';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getInitialData } from '@/lib/data';

const DATA_BLOB_KEY = 'data.json';

export async function GET(request: NextRequest) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    return NextResponse.json(
      { message: "Configuração do servidor incompleta: o token para o Vercel Blob não foi definido." }, 
      { status: 500 }
    );
  }

  try {
    const blob = await head(DATA_BLOB_KEY, { token });
    const response = await fetch(blob.url, { cache: 'no-store' });
    
    if (!response.ok) {
        throw new Error(`Erro ao baixar arquivo da Vercel: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    if (error?.status === 404) {
      console.log("Blob data.json não encontrado. Criando novo...");
      const initialData = getInitialData();
      
      await put(DATA_BLOB_KEY, JSON.stringify(initialData), { 
        access: 'public', 
        addRandomSuffix: false,
        token: token 
      });
      
      return NextResponse.json(initialData, { status: 200 });
    }
    
    console.error("Erro no GET /api/data:", error);
    const errorMessage = error.message || 'Erro desconhecido';
    return NextResponse.json(
      { message: "Erro interno ao buscar dados.", error: errorMessage }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    return NextResponse.json(
      { message: "Configuração do servidor incompleta: o token para o Vercel Blob não foi definido." }, 
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    
    await put(DATA_BLOB_KEY, JSON.stringify(body), { 
      access: 'public', 
      addRandomSuffix: false,
      token: token
    });
    
    return NextResponse.json(
      { message: "Dados salvos com sucesso no Blob" }, 
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error("Erro no POST /api/data:", error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { message: "Erro interno ao salvar dados.", error: errorMessage }, 
      { status: 500 }
    );
  }
}
