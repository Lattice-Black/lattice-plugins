import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    items: [],
    total: 0
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({
    success: true,
    cartItem: body
  });
}

export async function DELETE() {
  return NextResponse.json({
    success: true,
    message: 'Cart cleared'
  });
}
