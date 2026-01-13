
import { put, get } from '@vercel/blob';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getInitialData } from '@/lib/data';

const DATA_BLOB_KEY = 'data.json';

export async function GET(request: NextRequest) {
  try {
    const blob = await get(DATA_BLOB_KEY, {
        token: process.env.BLOB_READ_WRITE_TOKEN
    });
    const data = await blob.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
      console.log("Blob não encontrado. Criando com dados iniciais.");
      try {
          const initialData = getInitialData();
          await put(DATA_BLOB_KEY, JSON.stringify(initialData), { 
              access: 'protected', 
              token: process.env.BLOB_READ_WRITE_TOKEN 
          });
          return NextResponse.json(initialData, { status: 200 });
      } catch (putError: any) {
           console.error("Erro ao criar o blob inicial:", putError);
           return NextResponse.json({ message: "Erro interno ao criar os dados iniciais.", error: putError.message }, { status: 500 });
      }
    }
    // Para qualquer outro erro na busca (GET)
    console.error("Erro ao buscar os dados do Blob:", error);
    return NextResponse.json({ message: "Erro interno ao buscar os dados.", error: error.message || 'Erro desconhecido' }, { status: 500 });
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
