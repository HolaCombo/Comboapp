import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

export function useSupabaseTable(table, localKey, init, orderCol = 'created_at') {
  const [data, setData] = useState(() => {
    try { const s = localStorage.getItem(localKey); return s ? JSON.parse(s) : init }
    catch { return init }
  })
  const persist = useCallback((rows) => {
    setData(rows); localStorage.setItem(localKey, JSON.stringify(rows))
  }, [localKey])
  useEffect(() => {
    if (!supabase) return
    supabase.from(table).select('*').order(orderCol, { ascending: true })
      .then(({ data: rows }) => { if (rows) persist(rows) })
    const channel = supabase.channel(`rt_${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        supabase.from(table).select('*').order(orderCol, { ascending: true })
          .then(({ data: rows }) => { if (rows) persist(rows) })
      }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [table, localKey, orderCol, persist])
  const insert = async (row) => {
    const tempId = Date.now()
    const tempRow = { ...row, id: tempId }
    setData(d => { const n=[...d,tempRow]; localStorage.setItem(localKey,JSON.stringify(n)); return n })
    if (!supabase) return tempRow
    const { data: inserted } = await supabase.from(table).insert([row]).select()
    if (inserted?.[0]) {
      setData(d => { const n=d.map(x=>x.id===tempId?inserted[0]:x); localStorage.setItem(localKey,JSON.stringify(n)); return n })
      return inserted[0]
    }
    return tempRow
  }
  const update = async (id, changes) => {
    setData(d => { const n=d.map(x=>x.id===id?{...x,...changes}:x); localStorage.setItem(localKey,JSON.stringify(n)); return n })
    if (!supabase) return
    supabase.from(table).update(changes).eq('id', id)
  }
  const remove = async (id) => {
    setData(d => { const n=d.filter(x=>x.id!==id); localStorage.setItem(localKey,JSON.stringify(n)); return n })
    if (!supabase) return
    supabase.from(table).delete().eq('id', id)
  }
  return { data, setData, insert, update, remove }
}

export async function uploadFile(file, bucket = 'archivos') {
  if (!supabase) return null
  const ext = file.name.split('.').pop()
  const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from(bucket).upload(path, file)
  if (error) return null
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return { path, url: data.publicUrl }
}

export async function deleteFile(path, bucket = 'archivos') {
  if (!supabase) return
  await supabase.storage.from(bucket).remove([path])
}
