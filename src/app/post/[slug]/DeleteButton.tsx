'use client'

import { useRouter } from 'next/navigation'

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('delete this post?')) return
    const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/')
      router.refresh()
    } else {
      const { error } = await res.json()
      alert(error || 'something went wrong')
    }
  }

  return (
    <button className="btn btn-danger" onClick={handleDelete}>
      delete
    </button>
  )
}
