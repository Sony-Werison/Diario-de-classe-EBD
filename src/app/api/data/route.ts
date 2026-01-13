
import { put, get } from '@vercel/blob';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getInitialData } from '@/lib/data';

const DATA_BLOB_KEY = 'data.json';

// Define a type for the error object from Vercel Blob
interface VercelBlobError extends Error {
  code?: string;
  status?: number;
}

export async function GET(request: NextRequest) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json({ message: "Configuração do servidor incompleta: o token para o Vercel Blob não foi definido." }, { status: 500 });
  }

  try {
    const blob = await get(DATA_BLOB_KEY, { token });
    const data = await blob.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const vercelError = error as VercelBlobError;

    if (vercelError.code === 'not_found') {
      console.log("Blob não encontrado. Criando com dados iniciais.");
      try {
          const initialData = getInitialData();
          await put(DATA_BLOB_KEY, JSON.stringify(initialData), { 
              access: 'protected', 
              token
          });
          return NextResponse.json(initialData, { status: 200 });
      } catch (putError: unknown) {
           const putVercelError = putError as VercelBlobError;
           console.error("Erro ao criar o blob inicial:", putVercelError);
           return NextResponse.json({ message: "Erro interno ao criar os dados iniciais.", error: putVercelError.message }, { status: 500 });
      }
    }
    
    console.error("Erro ao buscar os dados do Blob:", vercelError);
    return NextResponse.json({ message: "Erro interno ao buscar os dados.", error: vercelError.message || 'Erro desconhecido' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json({ message: "Configuração do servidor incompleta: o token para o Vercel Blob não foi definido." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const dataString = JSON.stringify(body);
    
    await put(DATA_BLOB_KEY, dataString, { 
        access: 'protected', 
        token
    });
    
    return NextResponse.json({ message: "Dados salvos com sucesso" }, { status: 200 });
  } catch (error: unknown) {
    const vercelError = error as VercelBlobError;
    console.error("Erro ao salvar os dados no Blob:", vercelError);
    return NextResponse.json({ message: "Erro interno ao salvar os dados.", error: vercelError.message }, { status: 500 });
  }
}
