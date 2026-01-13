import { put, list } from '@vercel/blob';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getInitialData } from '@/lib/data';

const DATA_BLOB_KEY = 'data.json';

export async function GET(request: NextRequest) {
  // O Next.js lê automaticamente o .env.local da raiz
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    return NextResponse.json(
      { message: "ERRO: Token do Vercel Blob não encontrado no .env.local" }, 
      { status: 500 }
    );
  }

  try {
    // 1. Procura o arquivo na lista de blobs usando o token explicitamente
    const { blobs } = await list({ 
      prefix: DATA_BLOB_KEY, 
      limit: 1,
      token: token // Garante o uso da credencial correta
    });

    const blobExists = blobs.length > 0;

    // 2. Se NÃO existe, cria o arquivo inicial
    if (!blobExists) {
      console.log("Blob data.json não encontrado. Criando novo...");
      const initialData = getInitialData();
      
      await put(DATA_BLOB_KEY, JSON.stringify(initialData), { 
        access: 'public', 
        addRandomSuffix: false, // Mantém o nome fixo "data.json"
        token: token 
      });
      
      return NextResponse.json(initialData, { status: 200 });
    }

    // 3. Se existe, faz o download do JSON usando a URL retornada
    const blobUrl = blobs[0].url;
    
    // fetch com 'no-store' garante que não pegaremos cache antigo (importante para "bancos de dados")
    const response = await fetch(blobUrl, { cache: 'no-store' });
    
    if (!response.ok) {
        throw new Error(`Erro ao baixar arquivo da Vercel: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });

  } catch (error: unknown) {
    console.error("Erro no GET /api/data:", error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
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
      { message: "ERRO: Token do Vercel Blob não encontrado no .env.local" }, 
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    
    // Sobrescreve o arquivo "data.json" com os novos dados
    await put(DATA_BLOB_KEY, JSON.stringify(body), { 
      access: 'public', 
      addRandomSuffix: false, // Força a substituição do arquivo existente (com mesmo nome)
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