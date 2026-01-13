
import { get, put } from '@vercel/blob';
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
    if (error.status === 404) {
        const initialData = getInitialData();
        await put(DATA_BLOB_KEY, JSON.stringify(initialData), { access: 'protected', token: process.env.BLOB_READ_WRITE_TOKEN });
        return NextResponse.json(initialData, { status: 200 });
    }
    console.error(error);
    return NextResponse.json({ message: "Erro ao buscar os dados", error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const dataString = JSON.stringify(body);
    await put(DATA_BLOB_KEY, dataString, { access: 'protected', token: process.env.BLOB_READ_WRITE_TOKEN });
    return NextResponse.json({ message: "Dados salvos com sucesso" }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: "Erro ao salvar os dados", error: error.message }, { status: 500 });
  }
}
