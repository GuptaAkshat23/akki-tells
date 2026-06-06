import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(posts)
}

export async function POST(req: NextRequest) {
  const { title, body } = await req.json()

  if (!title?.trim() || !body?.trim()) {
    return NextResponse.json({ error: 'title and body are required' }, { status: 400 })
  }

  // Make slug unique by appending a number if needed
  let slug = slugify(title)
  const existing = await prisma.post.findUnique({ where: { slug } })
  if (existing) {
    slug = `${slug}-${Date.now()}`
  }

  const post = await prisma.post.create({
    data: { title: title.trim(), slug, body: body.trim() },
  })

  return NextResponse.json(post, { status: 201 })
}
