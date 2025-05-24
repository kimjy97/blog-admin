import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
    if (!token) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Authentication required' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }
  }

  const protectedPages = ['/', '/dashboard'];
  const isProtectedPage = protectedPages.some(page => pathname === page || (page !== '/' && pathname.startsWith(page)));


  if (isProtectedPage) {
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      if (pathname !== '/login') {
        loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
      }
      return NextResponse.redirect(loginUrl);
    } else if (pathname === '/login' && token) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    if (pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return NextResponse.next();
}

// 미들웨어가 실행될 경로를 지정합니다.
export const config = {
  matcher: [
    '/',                      // 루트 경로
    '/login',                 // 로그인 페이지 (로그인된 사용자가 접근 시 리디렉션 처리 위함)
    '/api/:path((?!auth).*)', // /api/auth 를 제외한 모든 /api/ 경로
    '/dashboard/:path*',      // /dashboard 로 시작하는 모든 경로
  ],
};
