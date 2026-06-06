import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export const revalidate = 0

export default async function HomePage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, slug: true, body: true, createdAt: true },
  })

  return (
    <>
      {posts.length === 0 ? (
        <p className="empty-state">nothing here yet.</p>
      ) : (
        <ul className="post-list">
          {posts.map((post) => (
            <li key={post.id} className="post-item">
              <Link href={`/post/${post.slug}`} className="post-link">
                <div className="post-title-list">{post.title}</div>
                <div className="post-meta">{formatDate(post.createdAt)}</div>
                {post.body && (
                  <div className="post-excerpt">
                    {post.body.slice(0, 160).trim()}
                    {post.body.length > 160 ? '…' : ''}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
