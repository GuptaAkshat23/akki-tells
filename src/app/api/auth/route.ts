import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  const correct = process.env.BLOG_PASSWORD

  if (!correct) {
    return NextResponse.json({ error: 'BLOG_PASSWORD not set' }, { status: 500 })
  }

  if (password !== correct) {
    return NextResponse.json({ error: 'wrong password' }, { status: 401 })
  }

  return NextResponse.json({ ok: true })
}
