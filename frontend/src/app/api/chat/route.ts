import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const authHeader = request.headers.get('authorization');
    
    const res = await fetch('http://localhost:4001/api/chat', {
      method: 'POST',
      headers: { 'Authorization': authHeader || '' },
      body: formData,
    });
    
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: 'Bridge Connection Error' }, { status: 500 });
  }
}
