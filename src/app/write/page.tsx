'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense, useCallback } from 'react'

interface Post {
  id: string
  title: string
  slug: string
  body: string
  createdAt: string
}

function WritePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')

  // Auth
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [savedPassword, setSavedPassword] = useState('')
  const [authError, setAuthError] = useState('')

  // View: 'manage' | 'write' | 'edit'
  const [view, setView] = useState<'manage' | 'write' | 'edit'>('manage')

  // Posts list
  const [posts, setPosts] = useState<Post[]>([])

  // Form
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    'x-blog-password': savedPassword,
  }), [savedPassword])

  const loadPosts = useCallback(async () => {
    const res = await fetch('/api/posts')
    if (res.ok) setPosts(await res.json())
  }, [])

  useEffect(() => {
    if (authed) {
      loadPosts()
      if (editId) {
        fetch(`/api/posts/${editId}`)
          .then(r => r.json())
          .then(post => {
            setTitle(post.title)
            setBody(post.body)
            setEditingId(post.id)
            setView('edit')
          })
      }
    }
  }, [authed, editId, loadPosts])

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      setSavedPassword(password)
      setAuthed(true)
    } else {
      setAuthError('wrong password')
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return
    setSaving(true)
    setError('')
    try {
      const isEdit = view === 'edit' && editingId
      const res = await fetch(isEdit ? `/api/posts/${editingId}` : '/api/posts', {
        method: isEdit ? 'PUT' : 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ title, body }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'failed to save')
      setTitle('')
      setBody('')
      setEditingId(null)
      await loadPosts()
      setView('manage')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'something went wrong')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`delete "${title}"?`)) return
    const res = await fetch(`/api/posts/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    if (res.ok) {
      await loadPosts()
      router.refresh()
    } else {
      alert('failed to delete')
    }
  }

  function startEdit(post: Post) {
    setTitle(post.title)
    setBody(post.body)
    setEditingId(post.id)
    setError('')
    setView('edit')
  }

  function startNew() {
    setTitle('')
    setBody('')
    setEditingId(null)
    setError('')
    setView('write')
  }

  function formatDate(s: string) {
    return new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  // ---- AUTH SCREEN ----
  if (!authed) {
    return (
      <div className="auth-wrap">
        <h1>who are you?</h1>
        <form onSubmit={handleAuth}>
          <div className="field">
            <label htmlFor="pw">password</label>
            <input
              id="pw"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
              autoComplete="current-password"
            />
          </div>
          <div className="form-actions" style={{ justifyContent: 'center' }}>
            <button type="submit" className="btn btn-primary">enter</button>
          </div>
          {authError && <p className="auth-error">{authError}</p>}
        </form>
      </div>
    )
  }

  // ---- WRITE / EDIT FORM ----
  if (view === 'write' || view === 'edit') {
    return (
      <div>
        <div className="write-header">
          <h1>{view === 'edit' ? 'editing' : 'new post'}</h1>
        </div>
        <form onSubmit={handleSave}>
          <div className="field">
            <label htmlFor="title">heading</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="title of your post"
              autoFocus
              required
            />
          </div>
          <div className="field">
            <label htmlFor="body">write</label>
            <textarea
              id="body"
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="write anything here..."
              required
            />
          </div>
          {error && <p className="auth-error" style={{ marginBottom: '1rem' }}>{error}</p>}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'saving…' : view === 'edit' ? 'update' : 'publish'}
            </button>
            <button type="button" className="btn" onClick={() => setView('manage')}>cancel</button>
          </div>
        </form>
      </div>
    )
  }

  // ---- MANAGE SCREEN ----
  return (
    <div>
      <div className="write-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1>your posts</h1>
        <button className="btn btn-primary" onClick={startNew}>+ new post</button>
      </div>

      {posts.length === 0 ? (
        <p className="empty-state">nothing here yet. write something.</p>
      ) : (
        <ul className="post-list" style={{ marginTop: '1.5rem' }}>
          {posts.map(post => (
            <li key={post.id} className="post-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div>
                  <div className="post-title-list">{post.title}</div>
                  <div className="post-meta">{formatDate(post.createdAt)}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, paddingTop: '0.2rem' }}>
                  <button className="btn" onClick={() => startEdit(post)}>edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(post.id, post.title)}>delete</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function WritePageWrapper() {
  return (
    <Suspense>
      <WritePage />
    </Suspense>
  )
}
