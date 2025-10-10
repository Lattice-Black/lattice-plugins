import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();

  // Simulate checkout process
  return NextResponse.json({
    success: true,
    orderId: `order_${Date.now()}`,
    amount: body.amount,
    status: 'completed'
  });
}
