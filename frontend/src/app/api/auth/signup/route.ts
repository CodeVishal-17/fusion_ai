import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Bridge: Sending request to backend...');
    const res = await fetch('http://localhost:4001/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    } else {
      const text = await res.text();
      console.error('Bridge: Backend returned non-JSON:', text.substring(0, 100));
      return NextResponse.json({ error: 'Backend returned HTML (check your routes): ' + text.substring(0, 100) }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Bridge Error:', error);
    return NextResponse.json({ error: 'Bridge Connection Error: ' + error.message }, { status: 500 });
  }
}
