import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

interface Params {
  params: { id: string }
}

function isAuthed(req: NextRequest): boolean {
  const cookie = req.cookies.get('blog_authed')?.value
  return cookie === process.env.BLOG_PASSWORD
}

export async function GET(_req: NextRequest, { params }: Params) {
  const post = await prisma.post.findUnique({ where: { id: params.id } })
  if (!post) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json(post)
}

export async function PUT(req: NextRequest, { params }: Params) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { title, body } = await req.json()

  if (!title?.trim() || !body?.trim()) {
    return NextResponse.json({ error: 'title and body are required' }, { status: 400 })
  }

  const existing = await prisma.post.findUnique({ where: { id: params.id } })
  if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 })

  // Regenerate slug only if title changed
  let slug = existing.slug
  if (title.trim() !== existing.title) {
    slug = slugify(title)
    const taken = await prisma.post.findFirst({
      where: { slug, NOT: { id: params.id } },
    })
    if (taken) slug = `${slug}-${Date.now()}`
  }

  const post = await prisma.post.update({
    where: { id: params.id },
    data: { title: title.trim(), slug, body: body.trim() },
  })

  return NextResponse.json(post)
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const existing = await prisma.post.findUnique({ where: { id: params.id } })
  if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 })

  await prisma.post.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
