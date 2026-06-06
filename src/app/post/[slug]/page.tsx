import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import DeleteButton from './DeleteButton'

export const revalidate = 0

interface Props {
  params: { slug: string }
}

export default async function PostPage({ params }: Props) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
  })

  if (!post) notFound()

  const cookieStore = cookies()
  const isOwner = cookieStore.get('blog_authed')?.value === process.env.BLOG_PASSWORD

  return (
    <article style={{ paddingBottom: '4rem' }}>
      <Link href="/" className="back-link">← all posts</Link>
      <div className="post-header">
        <h1 className="post-title-single">{post.title}</h1>
        <p className="post-meta">
          {formatDate(post.createdAt)}
          {post.updatedAt > post.createdAt ? ' · edited' : ''}
        </p>
      </div>
      <div className="post-body">{post.body}</div>
      {isOwner && (
        <div className="post-actions">
          <Link href={`/write?edit=${post.id}`} className="btn">edit</Link>
          <DeleteButton id={post.id} />
        </div>
      )}
    </article>
  )
}
