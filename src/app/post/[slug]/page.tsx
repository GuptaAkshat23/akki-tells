import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 0

interface Props {
  params: { slug: string }
}

export default async function PostPage({ params }: Props) {
  const post = await prisma.post.findUnique({ where: { slug: params.slug } })
  if (!post) notFound()

  return (
    <article style={{ paddingBottom: '4rem' }}>
      <Link href="/" className="back-link">← all posts</Link>
      <h1 className="post-title-single">{post.title}</h1>
      <p className="post-meta">
        {formatDate(post.createdAt)}
        {post.updatedAt > post.createdAt ? ' · edited' : ''}
      </p>
      <div className="post-body">{post.body}</div>
    </article>
  )
}
