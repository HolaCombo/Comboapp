import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabase'

// Dedicated hook for storyboard - no realtime that overwrites local state
export function useStoryboard(projectKey) {
  const [panels, setPanels] = useState([])
  const [loading, setLoading] = useState(true)
  const pendingSaves = useRef({})

  // Load once on mount
  useEffect(() => {
    if (!projectKey) return
    load()
  }, [projectKey])

  const load = async () => {
    setLoading(true)
    if (!supabase) { setLoading(false); return }
    const { data, error } = await supabase
      .from('storyboard_panels')
      .select('*')
      .eq('project_key', projectKey)
      .order('panel_order', { ascending: true })
    if (!error && data) {
      setPanels(data.map(p => ({
        ...p,
        img: p.img_url || '',
        desc: p.descripcion || ''
      })))
    }
    setLoading(false)
  }

  const addPanel = async () => {
    const order = panels.length
    if (!supabase) return
    const { data, error } = await supabase
      .from('storyboard_panels')
      .insert([{ project_key: projectKey, panel_order: order, img_url: '', img_path: '', descripcion: '', dialogo: '', comentarios: '', duracion: '', artista: '', estatus: 'pendiente' }])
      .select()
    if (!error && data?.[0]) {
      setPanels(prev => [...prev, { ...data[0], img: '', desc: '' }])
    }
  }

  const removePanel = async (id) => {
    setPanels(prev => prev.filter(p => p.id !== id))
    if (supabase) supabase.from('storyboard_panels').delete().eq('id', id)
  }

  // Update local immediately
  const updateLocal = (id, key, val) => {
    setPanels(prev => prev.map(p => p.id === id ? { ...p, [key]: val } : p))
  }

  // Save to Supabase (call on onBlur)
  const saveField = (id, key, val) => {
    const dbKey = key === 'img' ? 'img_url' : key === 'desc' ? 'descripcion' : key
    if (supabase) supabase.from('storyboard_panels').update({ [dbKey]: val }).eq('id', id)
  }

  // Save image
  const saveImage = async (id, url, path) => {
    updateLocal(id, 'img', url)
    if (supabase) await supabase.from('storyboard_panels').update({ img_url: url, img_path: path || '' }).eq('id', id)
  }

  return { panels, loading, addPanel, removePanel, updateLocal, saveField, saveImage, reload: load }
}
