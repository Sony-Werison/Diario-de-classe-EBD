
import { get, put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getInitialData } from '@/lib/data';

const DATA_BLOB_KEY = 'data.json';

export async function GET(request: NextRequest) {
  try {
    const blob = await get(DATA_BLOB_KEY);
    if (!blob) {
      // If the blob doesn't exist, return the initial data structure.
      return NextResponse.json(getInitialData(), { status: 200 });
    }
    const data = await blob.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    // The `get` method throws a `BlobNotFoundError` if the file doesn't exist.
    if (error.code === 'NOT_FOUND') {
        const initialData = getInitialData();
        // Also save the initial data to the blob for future requests.
        await put(DATA_BLOB_KEY, JSON.stringify(initialData), { access: 'protected' });
        return NextResponse.json(initialData, { status: 200 });
    }
    console.error(error);
    return NextResponse.json({ message: "Error fetching data", error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const dataString = JSON.stringify(body);
    await put(DATA_BLOB_KEY, dataString, { access: 'protected' });
    return NextResponse.json({ message: "Data saved successfully" }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: "Error saving data", error: error.message }, { status: 500 });
  }
}
