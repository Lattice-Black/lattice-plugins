import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    products: [
      { id: 1, name: 'Widget A', price: 19.99 },
      { id: 2, name: 'Widget B', price: 29.99 },
      { id: 3, name: 'Widget C', price: 39.99 },
    ]
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({
    success: true,
    product: {
      id: Date.now(),
      ...body
    }
  });
}
