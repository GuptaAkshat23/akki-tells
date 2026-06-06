import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

function isAuthed(req: NextRequest): boolean {
  const token = req.headers.get('x-blog-password')
  return !!token && token === process.env.BLOG_PASSWORD
}

export async function GET() {
  const posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(posts)
}

export async function POST(req: NextRequest) {
  if (!isAuthed(req))
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { title, body } = await req.json()
  if (!title?.trim() || !body?.trim())
    return NextResponse.json({ error: 'title and body are required' }, { status: 400 })

  let slug = slugify(title)
  const existing = await prisma.post.findUnique({ where: { slug } })
  if (existing) slug = `${slug}-${Date.now()}`

  const post = await prisma.post.create({
    data: { title: title.trim(), slug, body: body.trim() },
  })
  return NextResponse.json(post, { status: 201 })
}
