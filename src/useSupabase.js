import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from './supabase'

// Optimistic updates + Supabase realtime sync
export function useSupabaseTable(table, localKey, init, orderCol = 'created_at') {
  const [data, setData] = useState(() => {
    try { const s = localStorage.getItem(localKey); return s ? JSON.parse(s) : init }
    catch { return init }
  })

  const persist = useCallback((rows) => {
    setData(rows)
    localStorage.setItem(localKey, JSON.stringify(rows))
  }, [localKey])

  useEffect(() => {
    if (!supabase) return
    // Initial load
    supabase.from(table).select('*').order(orderCol, { ascending: true })
      .then(({ data: rows }) => { if (rows) persist(rows) })

    // Realtime: merge changes instead of replacing everything
    const channel = supabase.channel(`rt_${table}_${localKey}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table }, (payload) => {
        setData(d => {
          // Only add if not already present (avoid duplicate with optimistic)
          if (d.find(x => x.id === payload.new.id)) {
            const n = d.map(x => x.id === payload.new.id ? payload.new : x)
            localStorage.setItem(localKey, JSON.stringify(n))
            return n
          }
          const n = [...d.filter(x => typeof x.id !== 'number' || x.id > 1000000000000), payload.new]
          localStorage.setItem(localKey, JSON.stringify(n))
          return n
        })
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table }, (payload) => {
        setData(d => {
          const n = d.map(x => x.id === payload.new.id ? { ...x, ...payload.new } : x)
          localStorage.setItem(localKey, JSON.stringify(n))
          return n
        })
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table }, (payload) => {
        setData(d => {
          const n = d.filter(x => x.id !== payload.old.id)
          localStorage.setItem(localKey, JSON.stringify(n))
          return n
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [table, localKey, orderCol, persist])

  const insert = async (row) => {
    const tempId = Date.now()
    const tempRow = { ...row, id: tempId }
    // Optimistic: show immediately
    setData(d => { const n=[...d, tempRow]; localStorage.setItem(localKey, JSON.stringify(n)); return n })
    if (!supabase) return tempRow
    const { data: inserted } = await supabase.from(table).insert([row]).select()
    if (inserted?.[0]) {
      // Replace temp with real
      setData(d => { const n=d.map(x=>x.id===tempId?inserted[0]:x); localStorage.setItem(localKey,JSON.stringify(n)); return n })
      return inserted[0]
    }
    return tempRow
  }

  const update = async (id, changes) => {
    // Optimistic local update first
    setData(d => { const n=d.map(x=>x.id===id?{...x,...changes}:x); localStorage.setItem(localKey,JSON.stringify(n)); return n })
    if (!supabase) return
    const { data: updated, error } = await supabase.from(table).update(changes).eq('id', id).select()
    if (error) {
      console.error(`Supabase update error [${table}] id=${id}:`, error.message, error.details, changes)
    } else if (updated && updated[0]) {
      // Sync with actual DB values
      setData(d => { const n=d.map(x=>x.id===id?{...x,...updated[0]}:x); localStorage.setItem(localKey,JSON.stringify(n)); return n })
    }
    return { error, data: updated }
  }

  const remove = async (id) => {
    // Optimistic: remove immediately
    setData(d => { const n=d.filter(x=>x.id!==id); localStorage.setItem(localKey,JSON.stringify(n)); return n })
    if (!supabase) return
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) {
      console.error(`Supabase delete error [${table}] id=${id}:`, error.message)
      // Revert optimistic on error
      supabase.from(table).select('*').order('created_at', { ascending: true })
        .then(({ data: rows }) => { if (rows) { setData(rows); localStorage.setItem(localKey, JSON.stringify(rows)) } })
    } else {
      console.log(`Deleted [${table}] id=${id} OK`)
    }
  }

  return { data, setData, insert, update, remove }
}

// Upload file to Supabase Storage
export async function uploadFile(file, bucket = 'archivos') {
  if (!supabase) return null
  const ext = file.name.split('.').pop()
  const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
  // Detect content type - important for MOV, MP4 etc
  const contentType = file.type || getMimeType(ext)
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType,
    cacheControl: '3600',
    upsert: false
  })
  if (error) { console.error('Upload error:', error); return null }
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return { path, url: data.publicUrl }
}

function getMimeType(ext) {
  const types = {
    jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', gif:'image/gif',
    webp:'image/webp', svg:'image/svg+xml', bmp:'image/bmp',
    mp4:'video/mp4', mov:'video/quicktime', avi:'video/x-msvideo',
    webm:'video/webm', mkv:'video/x-matroska',
    mp3:'audio/mpeg', wav:'audio/wav', m4a:'audio/mp4', ogg:'audio/ogg',
    pdf:'application/pdf'
  }
  return types[ext?.toLowerCase()] || 'application/octet-stream'
}

export async function deleteFile(path, bucket = 'archivos') {
  if (!supabase) return
  await supabase.storage.from(bucket).remove([path])
}

// Hook for single-document tables (scripts, breakdowns, storyboards)
// Stores entire data as JSON in one row per project_key
export function useSupabaseDoc(table, projectKey, init) {
  const lsKey = `${table}_${projectKey}`
  const colName = table === 'scripts' ? 'lines' : table === 'breakdowns' ? 'rows' : table === 'storyboards' ? 'panels' : 'data'
  // Use ref for rowId so save() always has latest value
  const rowIdRef = useRef(null)

  const [data, setDataLocal] = useState(() => {
    try { const s = localStorage.getItem(lsKey); return s ? JSON.parse(s) : init }
    catch { return init }
  })

  useEffect(() => {
    if (!supabase || !projectKey) return
    // Fetch existing row
    supabase.from(table).select('*').eq('project_key', projectKey).limit(1)
      .then(({ data: rows }) => {
        if (rows && rows.length > 0) {
          const row = rows[0]
          rowIdRef.current = row.id
          let parsed = row[colName] || init
          if (Array.isArray(init) && !Array.isArray(parsed)) parsed = init
          setDataLocal(parsed)
          localStorage.setItem(lsKey, JSON.stringify(parsed))
        }
      })
    // Realtime sync from other users
    const channel = supabase.channel(`doc_${table}_${projectKey}_${Date.now()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
        if (payload.new?.project_key === projectKey) {
          rowIdRef.current = payload.new.id
          let parsed = payload.new[colName] || init
          if (Array.isArray(init) && !Array.isArray(parsed)) parsed = init
          setDataLocal(parsed)
          localStorage.setItem(lsKey, JSON.stringify(parsed))
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [table, projectKey, colName])

  const save = useCallback(async (newData) => {
    // Always update local immediately
    setDataLocal(newData)
    localStorage.setItem(lsKey, JSON.stringify(newData))
    if (!supabase) return
    if (rowIdRef.current) {
      // Update existing row
      await supabase.from(table).update({ [colName]: newData, updated_at: new Date().toISOString() }).eq('id', rowIdRef.current)
    } else {
      // Insert new row
      const { data: inserted } = await supabase.from(table).insert([{ project_key: projectKey, [colName]: newData }]).select()
      if (inserted?.[0]) rowIdRef.current = inserted[0].id
    }
  }, [table, projectKey, colName, lsKey])

  return [data, save]
}

// Simple fetch hook - NO realtime subscription, just load once + manual refresh
export function useSupabaseFetch(table, projectKey, orderCol = 'created_at') {
  const lsKey = `${table}_${projectKey}`
  const [data, setData] = useState(() => {
    try { const s = localStorage.getItem(lsKey); return s ? JSON.parse(s) : [] }
    catch { return [] }
  })
  const [loading, setLoading] = useState(false)

  const fetch = async () => {
    if (!supabase) return
    setLoading(true)
    const { data: rows } = await supabase.from(table).select('*')
      .eq('project_key', projectKey)
      .order(orderCol, { ascending: true })
    if (rows) {
      setData(rows)
      localStorage.setItem(lsKey, JSON.stringify(rows))
    }
    setLoading(false)
  }

  useEffect(() => { fetch() }, [projectKey])

  const insert = async (row) => {
    if (!supabase) {
      const newRow = { ...row, id: Date.now() }
      setData(d => { const n=[...d,newRow]; localStorage.setItem(lsKey,JSON.stringify(n)); return n })
      return newRow
    }
    const { data: inserted } = await supabase.from(table).insert([row]).select()
    if (inserted?.[0]) {
      setData(d => { const n=[...d,inserted[0]]; localStorage.setItem(lsKey,JSON.stringify(n)); return n })
      return inserted[0]
    }
    return null
  }

  const update = async (id, changes) => {
    setData(d => { const n=d.map(x=>x.id===id?{...x,...changes}:x); localStorage.setItem(lsKey,JSON.stringify(n)); return n })
    if (supabase) await supabase.from(table).update(changes).eq('id', id)
  }

  const remove = async (id) => {
    setData(d => { const n=d.filter(x=>x.id!==id); localStorage.setItem(lsKey,JSON.stringify(n)); return n })
    if (supabase) await supabase.from(table).delete().eq('id', id)
  }

  return { data, loading, insert, update, remove, refresh: fetch }
}
