import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  // Socket.io will be initialized via the custom server
  // This route is just a placeholder for the /api/socket path
  return new Response('Socket.io endpoint', { status: 200 });
}
