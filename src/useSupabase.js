import { useState, useEffect } from 'react'
import { supabase } from './supabase'

// Generic hook: syncs a Supabase table with local state
// Falls back to localStorage if Supabase is not configured
export function useSupabaseTable(table, localKey, init, orderCol = 'created_at') {
  const [data, setData] = useState(() => {
    try { const s = localStorage.getItem(localKey); return s ? JSON.parse(s) : init }
    catch { return init }
  })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!supabase) { setReady(true); return }

    // Initial fetch
    supabase.from(table).select('*').order(orderCol, { ascending: true })
      .then(({ data: rows, error }) => {
        if (!error && rows) {
          setData(rows)
          localStorage.setItem(localKey, JSON.stringify(rows))
        }
        setReady(true)
      })

    // Realtime subscription
    const channel = supabase.channel(`rt_${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        supabase.from(table).select('*').order(orderCol, { ascending: true })
          .then(({ data: rows }) => {
            if (rows) { setData(rows); localStorage.setItem(localKey, JSON.stringify(rows)) }
          })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [table, localKey, orderCol])

  const insert = async (row) => {
    if (!supabase) { const newRow = { ...row, id: Date.now() }; setData(d => { const n=[...d,newRow]; localStorage.setItem(localKey,JSON.stringify(n)); return n }); return newRow }
    const { data: inserted } = await supabase.from(table).insert([row]).select()
    return inserted?.[0]
  }

  const update = async (id, changes) => {
    if (!supabase) { setData(d => { const n=d.map(x=>x.id===id?{...x,...changes}:x); localStorage.setItem(localKey,JSON.stringify(n)); return n }); return }
    await supabase.from(table).update(changes).eq('id', id)
  }

  const remove = async (id) => {
    if (!supabase) { setData(d => { const n=d.filter(x=>x.id!==id); localStorage.setItem(localKey,JSON.stringify(n)); return n }); return }
    await supabase.from(table).delete().eq('id', id)
  }

  const upsert = async (rows) => {
    if (!supabase) { setData(rows); localStorage.setItem(localKey, JSON.stringify(rows)); return }
    await supabase.from(table).upsert(rows)
  }

  return { data, setData, insert, update, remove, upsert, ready }
}
