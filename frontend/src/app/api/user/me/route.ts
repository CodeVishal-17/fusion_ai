import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const res = await fetch('http://localhost:4001/api/user/me', {
      headers: { 'Authorization': authHeader || '' },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: 'Bridge Connection Error' }, { status: 500 });
  }
}
