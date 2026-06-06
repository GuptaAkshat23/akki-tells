'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

function WriteForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')

  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check authed state by pinging the server
    fetch('/api/auth/check').then(r => { if (r.ok) setAuthed(true) })
  }, [])

  useEffect(() => {
    if (authed && editId) {
      fetch(`/api/posts/${editId}`)
        .then((r) => r.json())
        .then((post) => {
          if (post.title) setTitle(post.title)
          if (post.body) setBody(post.body)
        })
    }
  }, [authed, editId])

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
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
      const method = editId ? 'PUT' : 'POST'
      const url = editId ? `/api/posts/${editId}` : '/api/posts'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'failed to save')
      router.push(`/post/${data.slug}`)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'something went wrong')
      setSaving(false)
    }
  }

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
              onChange={(e) => setPassword(e.target.value)}
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

  return (
    <div>
      <div className="write-header">
        <h1>{editId ? 'editing' : 'new post'}</h1>
      </div>
      <form onSubmit={handleSave}>
        <div className="field">
          <label htmlFor="title">heading</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="title of your post"
            autoFocus={!editId}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="body">write</label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="write anything here..."
            required
          />
        </div>
        {error && (
          <p className="auth-error" style={{ marginBottom: '1rem' }}>{error}</p>
        )}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'saving…' : editId ? 'update' : 'publish'}
          </button>
          <a href={editId ? `/post/${editId}` : '/'} className="btn">cancel</a>
        </div>
      </form>
    </div>
  )
}

export default function WritePage() {
  return (
    <Suspense>
      <WriteForm />
    </Suspense>
  )
}
