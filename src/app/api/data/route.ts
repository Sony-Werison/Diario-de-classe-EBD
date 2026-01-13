import { put, list } from '@vercel/blob';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getInitialData } from '@/lib/data';

const DATA_BLOB_KEY = 'data.json';

export async function GET(request: NextRequest) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    return NextResponse.json(
      { message: "Token do Vercel Blob não configurado." }, 
      { status: 500 }
    );
  }

  try {
    // 1. Procura se o arquivo já existe no Blob Storage
    const { blobs } = await list({ 
      prefix: DATA_BLOB_KEY, 
      limit: 1,
      token 
    });

    const blobExists = blobs.length > 0;

    // 2. Se NÃO existe, cria com os dados iniciais
    if (!blobExists) {
      console.log("Blob não encontrado. Criando dados iniciais...");
      const initialData = getInitialData();
      
      await put(DATA_BLOB_KEY, JSON.stringify(initialData), { 
        access: 'public', 
        addRandomSuffix: false, // Importante para manter o nome fixo
        token
      });
      
      return NextResponse.json(initialData, { status: 200 });
    }

    // 3. Se existe, pega a URL e faz o download do JSON
    const blobUrl = blobs[0].url;
    
    // Usamos fetch com 'no-store' para evitar cache antigo
    const response = await fetch(blobUrl, { cache: 'no-store' });
    
    if (!response.ok) {
      throw new Error(`Falha ao baixar o arquivo: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });

  } catch (error: unknown) {
    console.error("Erro no GET:", error);
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
      { message: "Token do Vercel Blob não configurado." }, 
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const dataString = JSON.stringify(body);
    
    // Sobrescreve o arquivo existente com o novo conteúdo
    await put(DATA_BLOB_KEY, dataString, { 
      access: 'public', 
      addRandomSuffix: false, // Mantém o mesmo nome de arquivo
      token
    });
    
    return NextResponse.json(
      { message: "Dados salvos com sucesso" }, 
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error("Erro no POST:", error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { message: "Erro interno ao salvar dados.", error: errorMessage }, 
      { status: 500 }
    );
  }
}