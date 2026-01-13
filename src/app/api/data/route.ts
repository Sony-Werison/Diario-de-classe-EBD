
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getInitialData } from '@/lib/data';

const DATA_BLOB_KEY = 'data.json';

// Esta é a URL base para a API do Vercel Blob
// A variável de ambiente BLOB_URL é injetada automaticamente pela Vercel
const BLOB_STORE_BASE_URL = process.env.BLOB_URL;

export async function GET(request: NextRequest) {
  if (!BLOB_STORE_BASE_URL) {
    console.error("A variável de ambiente BLOB_URL não está definida.");
    return NextResponse.json({ message: "Configuração do servidor incompleta: BLOB_URL faltando." }, { status: 500 });
  }

  const blobUrl = `${BLOB_STORE_BASE_URL}/${DATA_BLOB_KEY}`;
  
  try {
    // Tenta buscar o blob diretamente
    const response = await fetch(blobUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
      }
    });

    if (response.status === 404) {
      // O blob não existe, então o criamos com os dados iniciais
      console.log("Blob não encontrado. Criando com dados iniciais.");
      const initialData = getInitialData();
      await put(DATA_BLOB_KEY, JSON.stringify(initialData), { 
          access: 'protected', 
          token: process.env.BLOB_READ_WRITE_TOKEN 
      });
      // Retorna os dados iniciais que acabamos de salvar
      return NextResponse.json(initialData, { status: 200 });
    }

    if (!response.ok) {
        // Lança um erro se a resposta não for bem-sucedida por outros motivos
        throw new Error(`Erro da API do Blob: ${response.statusText}`);
    }

    // Se o blob existir, retorna seu conteúdo
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error("Erro ao buscar os dados do Blob:", error);
    // Para qualquer outro erro, retorne um 500
    return NextResponse.json({ message: "Erro interno ao buscar os dados.", error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("A variável de ambiente BLOB_READ_WRITE_TOKEN não está definida.");
    return NextResponse.json({ message: "Configuração do servidor incompleta: token de escrita faltando." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const dataString = JSON.stringify(body);
    
    // Salva os dados no blob
    await put(DATA_BLOB_KEY, dataString, { 
        access: 'protected', 
        token: process.env.BLOB_READ_WRITE_TOKEN 
    });
    
    return NextResponse.json({ message: "Dados salvos com sucesso" }, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao salvar os dados no Blob:", error);
    return NextResponse.json({ message: "Erro interno ao salvar os dados.", error: error.message }, { status: 500 });
  }
}
