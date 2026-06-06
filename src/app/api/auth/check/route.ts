import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('blog_authed')?.value
  const correct = process.env.BLOG_PASSWORD

  if (cookie && correct && cookie === correct) {
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
}
