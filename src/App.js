import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSupabaseTable, useSupabaseDoc, uploadFile, deleteFile } from './useSupabase'

// ─── Theme ────────────────────────────────────────────────────────────────────
function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  useEffect(() => { document.body.className = theme; localStorage.setItem('theme', theme) }, [theme])
  return [theme, setTheme]
}

function useLS(key, init) {
  const [val, setVal] = useState(() => { try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init } catch { return init } })
  const set = useCallback((v) => { setVal(prev => { const next = typeof v === 'function' ? v(prev) : v; localStorage.setItem(key, JSON.stringify(next)); return next }) }, [key])
  return [val, set]
}

const USERS = [
  { id:1, name:'Admin', username:'admin', password:'combo2025', role:'admin' },
  { id:2, name:'Animador 1', username:'anim1', password:'anim1pass', role:'member' },
  { id:3, name:'Artista 1', username:'arte1', password:'arte1pass', role:'member' },
]

const iStyle = { padding:'7px 10px', fontSize:13, borderRadius:8, border:'0.5px solid var(--border2)', background:'var(--bg2)', color:'var(--text)', width:'100%', outline:'none', marginBottom:2 }
const btnP = { padding:'7px 14px', fontSize:12, borderRadius:8, border:'none', background:'var(--green)', color:'white', cursor:'pointer', fontWeight:500 }
const btnS = { padding:'7px 14px', fontSize:12, borderRadius:8, border:'0.5px solid var(--border2)', background:'transparent', color:'var(--text)', cursor:'pointer' }
const btnD = { padding:'4px 8px', fontSize:11, borderRadius:8, border:'0.5px solid var(--border)', background:'transparent', color:'var(--text3)', cursor:'pointer' }
const card = { background:'var(--bg)', border:'0.5px solid var(--border)', borderRadius:14, padding:'14px 16px', marginBottom:12 }
const TH = { background:'var(--bg3)', padding:'9px 12px', textAlign:'left', fontWeight:500, color:'var(--text2)', borderBottom:'0.5px solid var(--border)', fontSize:11, whiteSpace:'nowrap' }
const TD = { padding:'8px 10px', borderBottom:'0.5px solid var(--border)', color:'var(--text)', verticalAlign:'middle', fontSize:12 }
const TDI = { border:'none', background:'transparent', color:'var(--text)', fontFamily:"'DM Sans',sans-serif", fontSize:12, width:'100%', outline:'none', padding:0 }
const STATUS_COLORS = { done:'#1D9E75', active:'#185FA5', pending:'#854F0B', blocked:'#A32D2D', aprobado:'#1D9E75', revision:'#185FA5', pendiente:'#854F0B', rechazado:'#A32D2D' }
const STATUS_BG = { aprobado:'#1D9E75', revision:'#185FA5', pendiente:'#c48a30', rechazado:'#A32D2D' }
const STATUS_LABEL_COLORS = { aprobado:'white', revision:'white', pendiente:'white', rechazado:'white' }
const fmt = n => '$' + Math.round(n).toLocaleString('es-MX')
const ARTIST_COLORS = ['#1D9E75','#185FA5','#854F0B','#993556','#3B6D11','#533AB7']
const ALL_ARTISTS = ['Enrique','Rubén','Cris','Tam','Laura','Carlos']
const PROJECT_COLOR_PALETTE = ['#1D9E75','#185FA5','#854F0B','#993556','#533AB7','#3B6D11','#c48a30','#0F6E56','#A32D2D','#1a6b8a']
const getProjectColor = (name, allProjects) => {
  const proj = allProjects.find(p => (p.name||p) === name)
  if (proj && proj.color) return proj.color
  const idx = allProjects.findIndex(p => (p.name||p) === name)
  return PROJECT_COLOR_PALETTE[idx >= 0 ? idx % PROJECT_COLOR_PALETTE.length : 0]
}

const seedProjects = []
const seedGantt = []
const seedBudget = []
const seedBreakdown = []
const seedTasks = []
const seedPanels = []

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center' }} onClick={onClose}>
      <div style={{ background:'var(--bg)', borderRadius:16, padding:22, width:400, border:'0.5px solid var(--border2)', maxHeight:'90vh', overflowY:'auto' }} onClick={e=>e.stopPropagation()}>
        <div style={{ fontSize:15, fontWeight:500, marginBottom:14 }}>{title}</div>
        {children}
      </div>
    </div>
  )
}

function LoginScreen({ onLogin }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const submit = () => { const found = USERS.find(u => u.username===user && u.password===pass); if(found){onLogin(found)}else{setErr('Usuario o contraseña incorrectos')} }
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg2)' }}>
      <div style={{ background:'var(--bg)', border:'0.5px solid var(--border2)', borderRadius:16, padding:32, width:320 }}>
        <div style={{ fontSize:20, fontWeight:600, marginBottom:4 }}>Combo<span style={{ color:'var(--green)' }}>App</span></div>
        <div style={{ fontSize:12, color:'var(--text3)', marginBottom:24 }}>Production Studio</div>
        <label style={{ fontSize:11, color:'var(--text2)', display:'block', marginBottom:4 }}>Usuario</label>
        <input value={user} onChange={e=>setUser(e.target.value)} style={iStyle} placeholder="usuario" />
        <label style={{ fontSize:11, color:'var(--text2)', display:'block', marginBottom:4, marginTop:10 }}>Contraseña</label>
        <input type="password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()} style={iStyle} placeholder="••••••••" />
        {err&&<div style={{ fontSize:11, color:'var(--danger)', marginTop:8 }}>{err}</div>}
        <button onClick={submit} style={{ ...btnP, width:'100%', marginTop:16, padding:10 }}>Entrar</button>
        <div style={{ fontSize:10, color:'var(--text3)', marginTop:16, lineHeight:1.7 }}>admin/combo2025 · anim1/anim1pass · arte1/arte1pass</div>
      </div>
    </div>
  )
}

function Dashboard({ projects, tasks, deleteProject }) {
  const pending = tasks.filter(t=>!t.done).length
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {[['Proyectos',projects.length],['Pendientes',pending],['Completadas',tasks.filter(t=>t.done).length],['Equipo',USERS.length]].map(([l,v])=>(
          <div key={l} style={{ background:'var(--bg3)', borderRadius:10, padding:14 }}>
            <div style={{ fontSize:11, color:'var(--text3)', marginBottom:4 }}>{l}</div>
            <div style={{ fontSize:22, fontWeight:500 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize:13, fontWeight:500, marginBottom:12 }}>Proyectos</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12, marginBottom:20 }}>
        {projects.map(p=>(
          <div key={p.id} style={{ ...card, marginBottom:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:getProjectColor(p.name, projects), flexShrink:0 }}></div>
              <div style={{ fontSize:13, fontWeight:500, flex:1 }}>{p.name}</div>
              <button onClick={e=>{e.stopPropagation();if(window.confirm('¿Eliminar proyecto '+p.name+'?'))deleteProject(p.id)}} style={{ background:'none', border:'none', cursor:'pointer', fontSize:11, color:'var(--text3)', padding:'2px 4px' }}>✕</button>
            </div>
            <div style={{ fontSize:11, color:'var(--text3)', marginBottom:10 }}>{p.director} · {p.duration}</div>
            <div style={{ height:4, background:'var(--bg3)', borderRadius:2, overflow:'hidden' }}><div style={{ height:'100%', width:p.progress+'%', background:getProjectColor(p.name,projects), borderRadius:2 }}></div></div>
            <div style={{ fontSize:11, color:'var(--text2)', marginTop:4 }}>{p.progress}% completado</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize:13, fontWeight:500, marginBottom:12 }}>Pendientes</div>
      {tasks.filter(t=>!t.done).slice(0,5).map(t=>(
        <div key={t.id} style={{ ...card, display:'flex', alignItems:'center', gap:12, padding:'11px 14px' }}>
          <div style={{ width:14, height:14, borderRadius:3, border:'1.5px solid var(--border2)', flexShrink:0 }}></div>
          <div style={{ flex:1 }}><div style={{ fontSize:13 }}>{t.name}</div><div style={{ fontSize:11, color:'var(--text3)' }}>{t.project} · {t.week}</div></div>
          <div style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:'var(--bg3)', color:'var(--text2)' }}>{t.assignee}</div>
        </div>
      ))}
    </div>
  )
}

function ScriptPanel({ projectKey }) {
  const lsMetaKey = `script_meta_${projectKey}`
  const [meta, setMeta] = useLS(lsMetaKey, { titulo:'', autor:'', formato:'Cortometraje' })
  const [lines, setLines] = useSupabaseDoc('scripts', projectKey, [])
  const safeLines = Array.isArray(lines) ? lines : []
  const typeStyles = {
    scene:{ fontWeight:'bold', textTransform:'uppercase', marginTop:20, fontFamily:"'DM Mono',monospace" },
    action:{ marginTop:8 },
    character:{ textAlign:'center', fontWeight:'bold', marginTop:16 },
    dialogue:{ paddingLeft:80, paddingRight:80 },
    parenthetical:{ paddingLeft:100, paddingRight:100, fontStyle:'italic', color:'var(--text2)' }
  }
  const add = type => setLines([...safeLines, {type, text:''}])
  const update = (i, text) => setLines(safeLines.map((x,idx)=>idx===i?{...x,text}:x))
  const remove = i => setLines(safeLines.filter((_,idx)=>idx!==i))

  // Auto-resize all textareas on mount/update
  const containerRef = useRef()
  useEffect(() => {
    if (!containerRef.current) return
    containerRef.current.querySelectorAll('textarea').forEach(ta => {
      ta.style.height = 'auto'
      ta.style.height = ta.scrollHeight + 'px'
    })
  }, [safeLines])

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:16 }}>
        <div><label style={{ fontSize:11, color:'var(--text2)', display:'block', marginBottom:3 }}>Título</label>
          <input style={iStyle} value={meta.titulo} onChange={e=>setMeta(m=>({...m,titulo:e.target.value}))} placeholder="Título del guión..." /></div>
        <div><label style={{ fontSize:11, color:'var(--text2)', display:'block', marginBottom:3 }}>Autor</label>
          <input style={iStyle} value={meta.autor} onChange={e=>setMeta(m=>({...m,autor:e.target.value}))} placeholder="Nombre del autor..." /></div>
        <div><label style={{ fontSize:11, color:'var(--text2)', display:'block', marginBottom:3 }}>Formato</label>
          <select style={iStyle} value={meta.formato} onChange={e=>setMeta(m=>({...m,formato:e.target.value}))}>
            {['Cortometraje','Largometraje','Serie','Spot','Documental','Animación'].map(f=><option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      </div>
      <div ref={containerRef} style={{ background:'var(--bg)', border:'0.5px solid var(--border)', borderRadius:14, padding:'24px 32px', fontFamily:"'DM Mono',monospace", fontSize:13, lineHeight:2 }}>
        {safeLines.length === 0 && <div style={{ color:'var(--text3)', fontSize:12, textAlign:'center', padding:20 }}>Agrega elementos con los botones de abajo</div>}
        {safeLines.map((line,i)=>(
          <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start', ...typeStyles[line.type] }}>
            <div style={{ flex:1, ...typeStyles[line.type] }}>
              <textarea
                value={line.text||''}
                onChange={e=>{update(i,e.target.value); e.target.style.height='auto'; e.target.style.height=e.target.scrollHeight+'px'}}
                placeholder={line.type==='scene'?'INT./EXT. LOCACIÓN - TIEMPO':line.type==='character'?'NOMBRE PERSONAJE':line.type==='dialogue'?'Línea de diálogo...':line.type==='parenthetical'?'(indicación)':'Descripción de la acción...'}
                style={{ width:'100%', border:'none', background:'transparent', resize:'none', fontFamily:'inherit', fontSize:'inherit', color:'var(--text)', outline:'none', lineHeight:'inherit', minHeight:'1.5em', overflow:'hidden', display:'block' }}
                rows={1}
              />
            </div>
            <button onClick={()=>remove(i)} style={{ ...btnD, marginTop:4, flexShrink:0 }}>✕</button>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap' }}>
        {[['Escena','scene'],['Acción','action'],['Personaje','character'],['Diálogo','dialogue'],['Paréntesis','parenthetical']].map(([label,type])=>(
          <button key={type} style={btnS} onClick={()=>add(type)}>+ {label}</button>
        ))}
      </div>
    </div>
  )
}

function BreakdownPanel({ projectKey }) {
  const [rows, setRows] = useSupabaseDoc('breakdowns', projectKey, [])
  const safeRows = Array.isArray(rows) ? rows : []
  const [mode, setMode] = useState('arte')
  const [importing, setImporting] = useState(false)
  const [selected, setSelected] = useState(new Set())
  const [showConfirmClear, setShowConfirmClear] = useState(false)
  const [externalLink, setExternalLink] = useLS(`breakdown_link_${projectKey}`, '')
  const artistColor = name => { const idx = ALL_ARTISTS.indexOf(name); return ARTIST_COLORS[idx>=0?idx:0] }
  const update = (id,key,val) => setRows(safeRows.map(x=>x.id===id?{...x,[key]:val}:x))
  const addRow = () => setRows([...safeRows,{ id:Date.now(), numEscena:'', secuencia:'', inF:0, outF:0, frames:0, fps:8, timecode:'', personajes:'', desglosArte:'', desglosAnim:'', layout:'', rough:'', clean:'', color:'', composite:'', artista:'', animador:'', dias:0, estatus:'pendiente', comentarios:'' }])
  const remove = id => setRows(safeRows.filter(x=>x.id!==id))
  const toggleSelect = id => setSelected(s => { const n=new Set(s); n.has(id)?n.delete(id):n.add(id); return n })
  const deleteSelected = () => { setRows(safeRows.filter(x=>!selected.has(x.id))); setSelected(new Set()) }
  const clearAll = () => { setRows([]); setShowConfirmClear(false) }

  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImporting(true)
    e.target.value = ''
    const isImg = file.type.startsWith('image/')
    const isPDF = file.type === 'application/pdf'
    const isXLSX = file.name.match(/\.xlsx?$/i)
    const isCSV = file.name.match(/\.csv$/i)
    try {
      if (isImg || isPDF) {
        const reader = new FileReader()
        reader.onload = ev => {
          setRows([...(Array.isArray(rows)?rows:[]), { id:Date.now(), numEscena:String((rows||[]).length+1), secuencia:'', inF:0, outF:0, frames:0, fps:8, timecode:'', personajes:'', desglosArte:`Importado: ${file.name}`, desglosAnim:'', layout:'', rough:'', clean:'', color:'', composite:'', artista:'', animador:'', dias:0, estatus:'pendiente', comentarios:'' }])
          setImporting(false)
        }
        reader.readAsDataURL(file)
      } else if (isXLSX) {
        // Load SheetJS from CDN to parse XLSX
        if (!window.XLSX) {
          await new Promise((res, rej) => {
            const s = document.createElement('script')
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
            s.onload = res; s.onerror = rej
            document.head.appendChild(s)
          })
        }
        const reader = new FileReader()
        reader.onload = ev => {
          try {
            const wb = window.XLSX.read(ev.target.result, { type:'array' })
            const ws = wb.Sheets[wb.SheetNames[0]]
            const data = window.XLSX.utils.sheet_to_json(ws, { defval:'' })
            const newRows = data.map((obj,i) => {
              // Try multiple possible column names (case insensitive)
              const keys = Object.keys(obj)
              const find = (...names) => {
                for (const n of names) {
                  const found = keys.find(k=>k.toLowerCase().includes(n.toLowerCase()))
                  if (found && obj[found]!==undefined && obj[found]!=='') return String(obj[found])
                }
                return ''
              }
              return {
                id:Date.now()+i,
                numEscena: find('escena','#','num','scene') || String(i+1),
                secuencia: find('secuencia','seq','sequence'),
                inF: parseInt(find('in','inicio')) || 0,
                outF: parseInt(find('out','fin')) || 0,
                frames: parseInt(find('frame','cuadro','rough')) || 0,
                fps: parseInt(find('fps')) || 8,
                timecode: find('timecode','tiempo','h:m'),
                personajes: find('personaje','character','cast','elenco'),
                desglosArte: find('arte','art','opening','desglose arte','field 2','imagen referencia'),
                desglosAnim: find('anim','storyline','accion','breakdown','field'),
                artista: find('artista','artist','andrea','martin','yisus'),
                animador: find('animador','animator'),
                dias: parseInt(find('dia','day','tiempo')) || 0,
                estatus: find('estatus','status','estado') || 'pendiente',
                comentarios: find('comentario','comment','nota','note','dialogo','dialogue')
              }
            })
            setRows([...(Array.isArray(rows)?rows:[]), ...newRows])
          } catch(err) { alert('Error al leer el XLSX: '+err.message) }
          setImporting(false)
        }
        reader.readAsArrayBuffer(file)
      } else if (isCSV) {
        const reader = new FileReader()
        reader.onload = ev => {
          try {
            const text = ev.target.result
            const csvLines = text.split('\n').filter(l=>l.trim())
            const headers = csvLines[0].split(',').map(h=>h.trim().toLowerCase().replace(/^"|"$/g,''))
            const newRows = csvLines.slice(1).map((line,i) => {
              const vals = line.split(',').map(v=>v.trim().replace(/^"|"$/g,''))
              const obj = {}; headers.forEach((h,idx)=>{ obj[h]=vals[idx]||'' })
              return { id:Date.now()+i, numEscena:obj['escena']||obj['#']||String(i+1), secuencia:obj['secuencia']||'', inF:parseInt(obj['in'])||0, outF:parseInt(obj['out'])||0, frames:parseInt(obj['frames'])||0, fps:parseInt(obj['fps'])||8, timecode:obj['timecode']||'', personajes:obj['personajes']||'', desglosArte:obj['desglose arte']||obj['arte']||'', desglosAnim:obj['desglose animacion']||'', artista:obj['artista']||'', animador:obj['animador']||'', dias:parseInt(obj['dias'])||0, estatus:obj['estatus']||'pendiente', comentarios:obj['comentarios']||'' }
            })
            setRows([...(Array.isArray(rows)?rows:[]), ...newRows])
          } catch(err) { alert('Error al leer CSV: '+err.message) }
          setImporting(false)
        }
        reader.readAsText(file)
      } else {
        alert('Formato no soportado. Usa XLSX, CSV, PDF o imagen.')
        setImporting(false)
      }
    } catch(err) {
      alert('Error al importar: '+err.message)
      setImporting(false)
    }
  }

  const arteColumns = [{ key:'numEscena', label:'Esc.', w:40 },{ key:'imagen', label:'Img', w:70 },{ key:'secuencia', label:'Secuencia', w:80 },{ key:'inF', label:'In', w:50 },{ key:'outF', label:'Out', w:50 },{ key:'frames', label:'Frames', w:60 },{ key:'timecode', label:'Timecode', w:100 },{ key:'personajes', label:'Personajes', w:130 },{ key:'desglosArte', label:'Desglose Arte', w:180 },{ key:'artista', label:'Artista', w:90 },{ key:'dias', label:'Días', w:50 },{ key:'estatus', label:'Estatus', w:140 },{ key:'comentarios', label:'Comentarios', w:200 }]
  const animColumns = [{ key:'numEscena', label:'Esc.', w:40 },{ key:'imagen', label:'Img', w:70 },{ key:'secuencia', label:'Secuencia', w:80 },{ key:'inF', label:'In', w:50 },{ key:'outF', label:'Out', w:50 },{ key:'frames', label:'Frames', w:60 },{ key:'fps', label:'FPS', w:45 },{ key:'timecode', label:'H:M:S:F', w:100 },{ key:'personajes', label:'Personajes', w:130 },{ key:'desglosAnim', label:'Desglose Animación', w:180 },{ key:'layout', label:'Layout', w:55 },{ key:'rough', label:'Rough', w:55 },{ key:'clean', label:'Clean', w:55 },{ key:'color', label:'Color', w:55 },{ key:'composite', label:'Comp.', w:55 },{ key:'animador', label:'Animador', w:90 },{ key:'dias', label:'Días', w:50 },{ key:'estatus', label:'Estatus', w:140 },{ key:'comentarios', label:'Comentarios', w:200 }]
  const cols = mode==='arte' ? arteColumns : animColumns

  return (
    <div>
      <div style={{ display:'flex', gap:8, marginBottom:16, alignItems:'center', flexWrap:'wrap' }}>
        {[['arte','Modo Arte'],['animacion','Modo Animación']].map(([m,label])=>(
          <button key={m} style={{ padding:'6px 16px', fontSize:12, borderRadius:20, border:'0.5px solid var(--border2)', background:mode===m?'var(--green)':'transparent', color:mode===m?'white':'var(--text2)', cursor:'pointer' }} onClick={()=>setMode(m)}>{label}</button>
        ))}
        <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          {selected.size>0&&<button style={{ ...btnS, color:'var(--danger)', borderColor:'var(--danger)' }} onClick={deleteSelected}>🗑 Eliminar {selected.size} seleccionadas</button>}
          <button style={{ ...btnS, color:'var(--danger)' }} onClick={()=>setShowConfirmClear(true)}>Borrar todo</button>
          <div style={{ position:'relative' }}>
            <button style={btnS}>{importing?'Importando...':'↑ Importar'}</button>
            <input type="file" accept=".csv,.xlsx,.xls,.pdf,image/*" onChange={handleImport} style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer' }} disabled={importing} />
          </div>
        </div>
      </div>
      {showConfirmClear&&(
        <div style={{ background:'var(--danger-light)', border:'0.5px solid var(--danger)', borderRadius:10, padding:'12px 16px', marginBottom:12, display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:13, color:'var(--danger)', flex:1 }}>¿Seguro que quieres borrar TODAS las filas? Esta acción no se puede deshacer.</span>
          <button style={{ ...btnS, color:'var(--danger)', borderColor:'var(--danger)' }} onClick={clearAll}>Sí, borrar todo</button>
          <button style={btnS} onClick={()=>setShowConfirmClear(false)}>Cancelar</button>
        </div>
      )}
      <div style={{ overflowX:'auto', border:'0.5px solid var(--border)', borderRadius:14 }}>
        <table style={{ borderCollapse:'collapse', fontSize:12, background:'var(--bg)' }}>
          <thead><tr><th style={{ ...TH, width:28 }}><input type='checkbox' onChange={e=>setSelected(e.target.checked?new Set(safeRows.map(r=>r.id)):new Set())} /></th>{cols.map(c=><th key={c.key} style={{ ...TH, width:c.w, minWidth:c.w }}>{c.label}</th>)}<th style={TH}></th></tr></thead>
          <tbody>
            {safeRows.map(row=>{
              const assignee = mode==='arte' ? row.artista : row.animador
              const color = assignee ? artistColor(assignee) : null
              const sColor = STATUS_COLORS[row.estatus]||'#888'
              return (
                <tr key={row.id} style={{ borderLeft: color?`3px solid ${color}55`:'3px solid transparent', background: selected.has(row.id)?'var(--danger-light)':'transparent' }}>
                  <td style={{ ...TD, width:28, textAlign:'center' }}><input type='checkbox' checked={selected.has(row.id)} onChange={()=>toggleSelect(row.id)} /></td>
                  {cols.map(c=>(
                    <td key={c.key} style={{ ...TD, width:c.w, minWidth:c.w, verticalAlign:'top', paddingTop:8 }}>
                      {c.key==='imagen' ? (
                        <div style={{ position:'relative', width:60, height:40, background:'var(--bg3)', borderRadius:4, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                          {row.imagen ? <img src={row.imagen} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span style={{ fontSize:10, color:'var(--text3)' }}>+img</span>}
                          <input type="file" accept="image/*" onChange={e=>{if(e.target.files[0]){const r=new FileReader();r.onload=ev=>update(row.id,'imagen',ev.target.result);r.readAsDataURL(e.target.files[0])}}} style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer' }} />
                        </div>
                      ) : c.key==='estatus' ? (
                        <select value={row[c.key]||'pendiente'} onChange={e=>update(row.id,c.key,e.target.value)} style={{ ...TDI, background:STATUS_BG[row[c.key]]||'var(--bg3)', color:'white', fontWeight:500, cursor:'pointer', borderRadius:6, padding:'3px 6px' }}>
                          {['pendiente','revision','aprobado','rechazado'].map(s=><option key={s} value={s}>{s}</option>)}
                        </select>
                      ) : c.key==='artista'||c.key==='animador' ? (
                        <input value={row[c.key]||''} onChange={e=>update(row.id,c.key,e.target.value)} style={{ ...TDI, color:row[c.key]?artistColor(row[c.key]):'var(--text3)', fontWeight:500 }} placeholder="—" />
                      ) : c.key==='comentarios'||c.key==='desglosArte'||c.key==='desglosAnim'||c.key==='personajes' ? (
                        <textarea value={row[c.key]||''} onChange={e=>update(row.id,c.key,e.target.value)} rows={1} style={{ ...TDI, resize:'none', lineHeight:1.5, overflow:'hidden' }} onInput={e=>{e.target.style.height='auto';e.target.style.height=e.target.scrollHeight+'px'}} />
                      ) : (
                        <input value={row[c.key]||''} onChange={e=>update(row.id,c.key,e.target.value)} style={TDI} />
                      )}
                    </td>
                  ))}
                  <td style={TD}><button style={btnD} onClick={()=>remove(row.id)}>✕</button></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap', alignItems:'center' }}>
        <button style={btnS} onClick={addRow}>+ Agregar escena</button>
        <div style={{ height:20, width:1, background:'var(--border2)' }}></div>
        <span style={{ fontSize:11, color:'var(--text3)' }}>¿Tienes un breakdown externo?</span>
        <input
          style={{ ...iStyle, width:320, marginBottom:0, fontSize:11 }}
          placeholder="Pega liga de Google Sheets, Google Docs o Drive..."
          value={externalLink||''}
          onChange={e=>setExternalLink(e.target.value)}
        />
        {externalLink&&<a href={externalLink} target="_blank" rel="noreferrer" style={{ ...btnS, textDecoration:'none', fontSize:11 }}>Abrir ↗</a>}
      </div>
    </div>
  )
}

function StoryboardPanel({ projectKey }) {
  // Use local state ONLY - sync to Supabase manually on blur/change
  const { data: dbPanels, insert: insertPanel, update: updatePanelDB, remove: removePanelDB } = useSupabaseTable('storyboard_panels', `sb_${projectKey}`, [], 'panel_order')
  const [panels, setPanels] = useState([])
  const [view, setView] = useState('cards')
  const [syncing, setSyncing] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Load from DB on mount and when projectKey changes
  // We only sync FROM db when local panels is empty (page load/refresh)
  // After that, local state is the source of truth until page reload
  useEffect(() => {
    if (!Array.isArray(dbPanels)) return
    const filtered = dbPanels
      .filter(p=>p.project_key===projectKey)
      .sort((a,b)=>(a.panel_order||0)-(b.panel_order||0))
    setPanels(prev => {
      if (prev.length === 0) {
        // Fresh load - take everything from DB
        return filtered.map(p=>({...p, img:p.img_url||'', desc:p.descripcion||''}))
      }
      // Already have local data - only add panels that don't exist locally yet
      const existingIds = new Set(prev.map(x=>x.id))
      const newFromDb = filtered.filter(p=>!existingIds.has(p.id))
      if (newFromDb.length > 0) {
        return [...prev, ...newFromDb.map(p=>({...p,img:p.img_url||'',desc:p.descripcion||''}))]
      }
      return prev
    })
    setInitialized(true)
  }, [dbPanels, projectKey])

  const add = async () => {
    const order = panels.length
    const newPanel = await insertPanel({ project_key:projectKey, panel_order:order, img_url:'', img_path:'', descripcion:'', dialogo:'', comentarios:'', duracion:'', artista:'', estatus:'pendiente' })
    if (newPanel) {
      setPanels(prev => [...prev, {...newPanel, img:'', desc:''}])
    }
  }

  const remove = id => {
    setPanels(prev => prev.filter(x=>x.id!==id))
    removePanelDB(id)
  }

  // Update local immediately, save to DB on blur
  const updateLocal = (id, key, val) => {
    setPanels(prev => prev.map(p=>p.id===id?{...p,[key]:val}:p))
  }

  const saveToDb = async (id, key, val) => {
    if (!id) return
    const dbKey = key==='img'?'img_url':key==='desc'?'descripcion':key
    try {
      await updatePanelDB(id, { [dbKey]: val })
    } catch(e) {
      console.error('saveToDb error:', key, e)
    }
  }

  const loadImg = async (id, file) => {
    // Show preview immediately
    const reader = new FileReader()
    reader.onload = async e => {
      const localUrl = e.target.result
      updateLocal(id, 'img', localUrl)
      // Upload to Supabase in background
      const uploaded = await uploadFile(file)
      if (uploaded) {
        updateLocal(id, 'img', uploaded.url)
        updatePanelDB(id, { img_url: uploaded.url, img_path: uploaded.path })
      } else {
        updatePanelDB(id, { img_url: localUrl, img_path: '' })
      }
    }
    reader.readAsDataURL(file)
  }

  const artistColor = name => { const idx=ALL_ARTISTS.indexOf(name); return ARTIST_COLORS[idx>=0?idx:0] }

  const syncToBreakdown = async () => {
    setSyncing(true)
    try {
      const lsKey = `breakdown_rows_${projectKey}`
      const newRows = panels.map((p,i) => ({
        id: Date.now()+i, numEscena:String(i+1), imagen:p.img||'',
        secuencia:'', inF:0, outF:0, frames:0, fps:8, timecode:'',
        personajes:'', desglosArte:p.desc||p.descripcion||'',
        desglosAnim:p.dialogo||'', layout:'', rough:'', clean:'', color:'', composite:'',
        artista:p.artista||'', animador:'', dias:0,
        estatus:p.estatus||'pendiente', comentarios:p.comentarios||''
      }))
      localStorage.setItem(lsKey, JSON.stringify(newRows))
      alert(`✅ ${newRows.length} paneles sincronizados al Breakdown.`)
    } catch(err) { alert('Error: '+err.message) }
    setSyncing(false)
  }

  return (
    <div>
      <div style={{ display:'flex', gap:8, marginBottom:16, alignItems:'center', flexWrap:'wrap' }} className="no-print">
        {[['cards','Tarjetas'],['table','Breakdown-Storyboard']].map(([v,label])=>(
          <button key={v} style={{ padding:'6px 16px', fontSize:12, borderRadius:20, border:'0.5px solid var(--border2)', background:view===v?'var(--green)':'transparent', color:view===v?'white':'var(--text2)', cursor:'pointer' }} onClick={()=>setView(v)}>{label}</button>
        ))}
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          <button style={{ ...btnS, background:'var(--blue-light)', color:'var(--blue)', borderColor:'var(--blue)' }} onClick={syncToBreakdown} disabled={syncing}>
            {syncing?'Sincronizando...':'⇄ Sync al Breakdown'}
          </button>
          <button style={btnS} onClick={()=>window.print()}>↓ PDF</button>
        </div>
      </div>

      {view==='cards' ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:16 }}>
          {panels.map((p,i)=>(
            <div key={p.id} style={{ background:'var(--bg)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
              <div style={{ fontSize:10, color:'var(--text3)', padding:'8px 12px 4px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span>Panel {i+1}</span>
                <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                  <select value={p.estatus||'pendiente'}
                    onChange={e=>{updateLocal(p.id,'estatus',e.target.value);saveToDb(p.id,'estatus',e.target.value)}}
                    style={{ fontSize:10, border:'none', background:STATUS_BG[p.estatus]||'var(--bg3)', color:'white', cursor:'pointer', outline:'none', borderRadius:4, padding:'2px 4px', fontWeight:500 }}>
                    {['pendiente','revision','aprobado','rechazado'].map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                  <button style={{ ...btnD, fontSize:10 }} className="no-print" onClick={()=>remove(p.id)}>✕</button>
                </div>
              </div>
              <div style={{ position:'relative', aspectRatio:'16/9', background:'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                {p.img ? <img src={p.img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> :
                  <div style={{ textAlign:'center', pointerEvents:'none' }}><div style={{ fontSize:22, color:'var(--text3)' }}>+</div><div style={{ fontSize:11, color:'var(--text3)' }}>Subir imagen</div></div>}
                <input type="file" accept="image/*" className="no-print" onChange={e=>e.target.files[0]&&loadImg(p.id,e.target.files[0])} style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer' }} />
              </div>
              <div style={{ padding:'8px 12px 4px' }}>
                <textarea value={p.desc||''} placeholder="Descripción / Acción..."
                  onChange={e=>updateLocal(p.id,'desc',e.target.value)}
                  onBlur={e=>saveToDb(p.id,'desc',e.target.value)}
                  rows={1} style={{ width:'100%', border:'none', background:'transparent', resize:'none', fontSize:12, color:'var(--text2)', fontFamily:"'DM Sans',sans-serif", outline:'none', lineHeight:1.5, overflow:'hidden' }}
                  onInput={e=>{e.target.style.height='auto';e.target.style.height=e.target.scrollHeight+'px'}} />
              </div>
              <div style={{ padding:'0 12px 4px' }}>
                <textarea value={p.dialogo||''} placeholder="Diálogo / Guión..."
                  onChange={e=>updateLocal(p.id,'dialogo',e.target.value)}
                  onBlur={e=>saveToDb(p.id,'dialogo',e.target.value)}
                  rows={1} style={{ width:'100%', border:'none', background:'transparent', resize:'none', fontSize:11, color:'var(--text3)', fontFamily:"'DM Sans',sans-serif", outline:'none', lineHeight:1.5, fontStyle:'italic', overflow:'hidden' }}
                  onInput={e=>{e.target.style.height='auto';e.target.style.height=e.target.scrollHeight+'px'}} />
              </div>
              <div style={{ padding:'0 12px 4px' }}>
                <textarea value={p.comentarios||''} placeholder="Comentarios..."
                  onChange={e=>updateLocal(p.id,'comentarios',e.target.value)}
                  onBlur={e=>saveToDb(p.id,'comentarios',e.target.value)}
                  rows={1} style={{ width:'100%', border:'none', background:'var(--green-light)', resize:'none', fontSize:11, color:'var(--green-dark)', fontFamily:"'DM Sans',sans-serif", outline:'none', lineHeight:1.5, borderRadius:6, padding:'3px 6px', overflow:'hidden' }}
                  onInput={e=>{e.target.style.height='auto';e.target.style.height=e.target.scrollHeight+'px'}} />
              </div>
              <div style={{ padding:'6px 12px 10px', display:'flex', gap:8, alignItems:'center' }}>
                <input value={p.duracion||''} placeholder="Dur: 3s"
                  onChange={e=>updateLocal(p.id,'duracion',e.target.value)}
                  onBlur={e=>saveToDb(p.id,'duracion',e.target.value)}
                  style={{ ...TDI, fontSize:11, color:'var(--text3)', width:70 }} />
                <input value={p.artista||''} placeholder="Artista"
                  onChange={e=>updateLocal(p.id,'artista',e.target.value)}
                  onBlur={e=>saveToDb(p.id,'artista',e.target.value)}
                  style={{ ...TDI, fontSize:11, color:p.artista?artistColor(p.artista):'var(--text3)', flex:1 }} />
              </div>
            </div>
          ))}
          <button onClick={add} className="no-print" style={{ border:'1.5px dashed var(--border2)', background:'transparent', borderRadius:14, aspectRatio:'16/9', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text3)', fontSize:12 }}>+ Nuevo panel</button>
        </div>
      ) : (
        <div style={{ overflowX:'auto', border:'0.5px solid var(--border)', borderRadius:14 }}>
          <table style={{ borderCollapse:'collapse', fontSize:12, background:'var(--bg)', width:'100%' }}>
            <thead>
              <tr>{['#','Imagen','Descripción','Artista','Diálogo','Comentarios','Dur.','Estatus'].map(h=><th key={h} style={TH}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {panels.map((p,i)=>(
                <tr key={p.id}>
                  <td style={{ ...TD, width:30, textAlign:'center', color:'var(--text3)', fontWeight:500 }}>{i+1}</td>
                  <td style={{ ...TD, width:120 }}>
                    <div style={{ position:'relative', width:100, height:56, background:'var(--bg3)', borderRadius:6, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {p.img?<img src={p.img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />:<span style={{ fontSize:10, color:'var(--text3)' }}>Sin imagen</span>}
                      <input type="file" accept="image/*" onChange={e=>e.target.files[0]&&loadImg(p.id,e.target.files[0])} style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer' }} />
                    </div>
                  </td>
                  <td style={{ ...TD, width:200 }}>
                    <textarea value={p.desc||''} onChange={e=>updateLocal(p.id,'desc',e.target.value)} onBlur={e=>saveToDb(p.id,'desc',e.target.value)} rows={1} style={{ ...TDI, resize:'none', lineHeight:1.4, overflow:'hidden' }} onInput={e=>{e.target.style.height='auto';e.target.style.height=e.target.scrollHeight+'px'}} />
                  </td>
                  <td style={{ ...TD, width:90 }}>
                    <input value={p.artista||''} onChange={e=>updateLocal(p.id,'artista',e.target.value)} onBlur={e=>saveToDb(p.id,'artista',e.target.value)} style={{ ...TDI, color:p.artista?artistColor(p.artista):'var(--text3)' }} placeholder="—" />
                  </td>
                  <td style={{ ...TD, width:180 }}>
                    <textarea value={p.dialogo||''} onChange={e=>updateLocal(p.id,'dialogo',e.target.value)} onBlur={e=>saveToDb(p.id,'dialogo',e.target.value)} rows={1} style={{ ...TDI, resize:'none', lineHeight:1.4, fontStyle:'italic', overflow:'hidden' }} onInput={e=>{e.target.style.height='auto';e.target.style.height=e.target.scrollHeight+'px'}} />
                  </td>
                  <td style={{ ...TD, width:160 }}>
                    <textarea value={p.comentarios||''} onChange={e=>updateLocal(p.id,'comentarios',e.target.value)} onBlur={e=>saveToDb(p.id,'comentarios',e.target.value)} rows={1} style={{ ...TDI, resize:'none', lineHeight:1.4, color:'var(--green-dark)', overflow:'hidden' }} onInput={e=>{e.target.style.height='auto';e.target.style.height=e.target.scrollHeight+'px'}} />
                  </td>
                  <td style={{ ...TD, width:70 }}>
                    <input value={p.duracion||''} onChange={e=>updateLocal(p.id,'duracion',e.target.value)} onBlur={e=>saveToDb(p.id,'duracion',e.target.value)} style={{ ...TDI, width:60 }} placeholder="3s" />
                  </td>
                  <td style={{ ...TD, width:100 }}>
                    <select value={p.estatus||'pendiente'} onChange={e=>{updateLocal(p.id,'estatus',e.target.value);saveToDb(p.id,'estatus',e.target.value)}} style={{ ...TDI, background:STATUS_BG[p.estatus]||'var(--bg3)', color:'white', fontWeight:500, cursor:'pointer', borderRadius:6, padding:'3px 6px' }}>
                      {['pendiente','revision','aprobado','rechazado'].map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {view==='table'&&<button style={{ ...btnS, marginTop:12 }} onClick={add}>+ Agregar panel</button>}
    </div>
  )
}

function GanttPanel({ projects, projectKey }) {
  const { data: rawRows, insert: insertRow, update: updateRowDB, remove: removeRowDB } = useSupabaseTable('gantt_tasks', `gantt_rows_${projectKey}`, [], 'created_at')
  const filteredRows = (Array.isArray(rawRows) ? rawRows : []).filter(r => !r.project_key || r.project_key === projectKey)
  const [zoom, setZoom] = useState('week')
  const [showForm, setShowForm] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [newRow, setNewRow] = useState({ task:'', start:'', end:'', assignee:'', status:'pending', project:projects[0]?.name||'' })
  const dragRef = useRef(null)
  const gridRef = useRef(null)

  const parseDate = s => { if(!s) return new Date(); const [y,m,d]=s.split('-').map(Number); return new Date(y,m-1,d) }
  const addDays = (d,n) => { const r=new Date(d); r.setDate(r.getDate()+n); return r }
  const diffDays = (a,b) => Math.round((b-a)/86400000)
  const toDateStr = d => { const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${day}` }
  const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  const STATUS_OP = { done:1, active:1, pending:1, blocked:1 }
  const STATUS_COLORS_BAR = { done:'#1D9E75', active:'#185FA5', pending:'#c48a30', blocked:'#A32D2D' }
  const STATUS_PATTERNS = { done:'none', active:'none', pending:'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.25) 5px, rgba(255,255,255,0.25) 7px)', blocked:'repeating-linear-gradient(90deg, transparent, transparent 5px, rgba(255,255,255,0.3) 5px, rgba(255,255,255,0.3) 7px)' }
  const CELL = zoom==='week' ? 36 : 110

  const addRow = async () => { if(!newRow.task||!newRow.start||!newRow.end) return; await insertRow({task:newRow.task, start_date:newRow.start, end_date:newRow.end, assignee:newRow.assignee, status:newRow.status, project_key:projectKey}); setShowForm(false) }
  const remove = id => removeRowDB(id)
  const updateRow = (id, changes) => {
    const dbChanges = {}
    if(changes.task!==undefined) dbChanges.task=changes.task
    if(changes.start!==undefined) dbChanges.start_date=changes.start
    if(changes.end!==undefined) dbChanges.end_date=changes.end
    if(changes.assignee!==undefined) dbChanges.assignee=changes.assignee
    if(changes.status!==undefined) dbChanges.status=changes.status
    if(Object.keys(dbChanges).length) updateRowDB(id, dbChanges)
  }
  // Normalize: map start_date/end_date → start/end for display
  const rows = filteredRows.map(r => ({...r, start: r.start_date||r.start||'', end: r.end_date||r.end||''}))

  const isValidDate = s => s && s.match(/^\d{4}-\d{2}-\d{2}$/) && !isNaN(new Date(s))
  const validRows = rows.filter(r=>isValidDate(r.start)&&isValidDate(r.end))
  const allDates = validRows.flatMap(r=>[parseDate(r.start),parseDate(r.end)])
  let minD = allDates.length ? new Date(Math.min(...allDates)) : new Date()
  let maxD = allDates.length ? new Date(Math.max(...allDates)) : addDays(new Date(),60)
  minD = addDays(minD,-7); maxD = addDays(maxD,21)
  const dow = minD.getDay(); minD = addDays(minD, dow===0?-6:1-dow)

  const cols = []
  if(zoom==='week'){let d=new Date(minD);while(d<=maxD){cols.push(new Date(d));d=addDays(d,7)}}
  else{let d=new Date(minD.getFullYear(),minD.getMonth(),1);while(d<=maxD){cols.push(new Date(d));d=new Date(d.getFullYear(),d.getMonth()+1,1)}}
  const totalW = cols.length*CELL
  const allProjects = [...new Set(rows.map(r=>r.project||'General'))]

  const pxToDate = (px) => {
    if(zoom==='week') return addDays(minD, Math.round((px/CELL)*7))
    return addDays(minD, Math.round((px/totalW)*diffDays(minD,maxD)))
  }

  // Drag to move bar
  const onBarMouseDown = (e, rowId, type) => {
    e.preventDefault()
    e.stopPropagation()
    const row = rows.find(r=>r.id===rowId)
    if(!row) return
    const startX = e.clientX
    const origStart = parseDate(row.start)
    const origEnd = parseDate(row.end)
    const origDur = diffDays(origStart, origEnd)

    dragRef.current = { rowId, type, startX, origStart, origEnd, origDur }

    const onMove = (e) => {
      if(!dragRef.current) return
      const dx = e.clientX - dragRef.current.startX
      const daysDelta = zoom==='week' ? Math.round((dx/CELL)*7) : Math.round((dx/totalW)*diffDays(minD,maxD))
      if(dragRef.current.type === 'move') {
        const newStart = addDays(dragRef.current.origStart, daysDelta)
        const newEnd = addDays(dragRef.current.origEnd, daysDelta)
        updateRow(rowId, { start: toDateStr(newStart), end: toDateStr(newEnd) })
      } else if(dragRef.current.type === 'resize') {
        const newEnd = addDays(dragRef.current.origEnd, daysDelta)
        if(diffDays(dragRef.current.origStart, newEnd) >= 1) {
          updateRow(rowId, { end: toDateStr(newEnd) })
        }
      }
    }
    const onUp = () => {
      dragRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div>
      <div style={{ display:'flex', gap:8, marginBottom:14, alignItems:'center' }}>
        {[['week','Semana'],['month','Mes']].map(([z,label])=>(
          <button key={z} style={{ padding:'5px 14px', fontSize:12, borderRadius:20, border:'0.5px solid var(--border2)', background:zoom===z?'var(--green)':'transparent', color:zoom===z?'white':'var(--text2)', cursor:'pointer' }} onClick={()=>setZoom(z)}>{label}</button>
        ))}
        <div style={{ fontSize:11, color:'var(--text3)', marginLeft:4 }}>Arrastra las barras para mover · jala el borde derecho para redimensionar</div>
        <button style={{ ...btnS, marginLeft:'auto' }} onClick={()=>setShowForm(v=>!v)}>+ Agregar tarea</button>
      </div>

      {showForm&&(
        <div style={{ ...card, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:16 }}>
          {[['task','Tarea'],['assignee','Responsable']].map(([k,l])=>(<div key={k}><label style={{ fontSize:11, color:'var(--text2)', display:'block', marginBottom:3 }}>{l}</label><input style={iStyle} value={newRow[k]} onChange={e=>setNewRow(r=>({...r,[k]:e.target.value}))} /></div>))}
          <div><label style={{ fontSize:11, color:'var(--text2)', display:'block', marginBottom:3 }}>Proyecto</label><select style={iStyle} value={newRow.project} onChange={e=>setNewRow(r=>({...r,project:e.target.value}))}>{projects.map(p=><option key={p.id} value={p.name}>{p.name}</option>)}</select></div>
          {[['start','Inicio'],['end','Fin']].map(([k,l])=>(<div key={k}><label style={{ fontSize:11, color:'var(--text2)', display:'block', marginBottom:3 }}>{l}</label><input type="date" style={iStyle} value={newRow[k]} onChange={e=>setNewRow(r=>({...r,[k]:e.target.value}))} /></div>))}
          <div><label style={{ fontSize:11, color:'var(--text2)', display:'block', marginBottom:3 }}>Estado</label><select style={iStyle} value={newRow.status} onChange={e=>setNewRow(r=>({...r,status:e.target.value}))}>{Object.entries({pending:'Pendiente',active:'En curso',done:'Listo',blocked:'Bloqueado'}).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
          <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}><button style={btnP} onClick={addRow}>Guardar</button><button style={btnS} onClick={()=>setShowForm(false)}>Cancelar</button></div>
        </div>
      )}

      {/* Edit modal */}
      {editingRow && (
        <Modal open={!!editingRow} onClose={()=>setEditingRow(null)} title="Editar tarea">
          {[['task','Tarea'],['assignee','Responsable']].map(([k,l])=>(
            <div key={k} style={{ marginBottom:8 }}>
              <label style={{ fontSize:11, color:'var(--text2)', display:'block', marginBottom:3 }}>{l}</label>
              <input style={iStyle} value={editingRow[k]||''} onChange={e=>setEditingRow(r=>({...r,[k]:e.target.value}))} />
            </div>
          ))}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
            {[['start','Inicio'],['end','Fin']].map(([k,l])=>(
              <div key={k}>
                <label style={{ fontSize:11, color:'var(--text2)', display:'block', marginBottom:3 }}>{l}</label>
                <input type="date" style={iStyle} value={editingRow[k]||''} onChange={e=>setEditingRow(r=>({...r,[k]:e.target.value}))} />
              </div>
            ))}
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:11, color:'var(--text2)', display:'block', marginBottom:3 }}>Estado</label>
            <select style={iStyle} value={editingRow.status||'pending'} onChange={e=>setEditingRow(r=>({...r,status:e.target.value}))}>
              {Object.entries({pending:'Pendiente',active:'En curso',done:'Listo',blocked:'Bloqueado'}).map(([k,v])=><option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
            <button style={{ ...btnS, color:'var(--danger)' }} onClick={()=>{remove(editingRow.id);setEditingRow(null)}}>Eliminar</button>
            <button style={btnS} onClick={()=>setEditingRow(null)}>Cancelar</button>
            <button style={btnP} onClick={()=>{updateRow(editingRow.id,editingRow);setEditingRow(null)}}>Guardar</button>
          </div>
        </Modal>
      )}

      {validRows.length===0 ? (
        <div style={{ padding:40, textAlign:'center', color:'var(--text3)', fontSize:13 }}>
          Sin tareas aún. <button style={{ ...btnS, marginLeft:8 }} onClick={()=>setShowForm(true)}>+ Agregar tarea</button>
        </div>
      ) : (
        <div style={{ display:'flex', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden', background:'var(--bg)' }}>
          {/* Labels */}
          <div style={{ width:200, minWidth:200, borderRight:'0.5px solid var(--border)', flexShrink:0 }}>
            <div style={{ height:36, background:'var(--bg3)', borderBottom:'0.5px solid var(--border)' }}></div>
            {allProjects.map(proj=>(
              <React.Fragment key={proj}>
                <div style={{ padding:'5px 12px', background:'var(--bg3)', borderBottom:'0.5px solid var(--border)', fontSize:11, fontWeight:500, color:'var(--text2)' }}>{proj}</div>
                {rows.filter(r=>(r.project||'General')===proj).map(r=>(
                  <div key={r.id} style={{ height:44, display:'flex', alignItems:'center', padding:'0 12px', borderBottom:'0.5px solid var(--border)', gap:8, cursor:'pointer' }} onClick={()=>setEditingRow({...r})}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:STATUS_COLORS_BAR[r.status]||getProjectColor(r.project, projects)||'#888', flexShrink:0 }}></div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{r.task}</div>
                      <div style={{ fontSize:10, color:'var(--text3)' }}>{r.start} → {r.end}</div>
                    </div>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>

          {/* Grid */}
          <div ref={gridRef} style={{ flex:1, overflowX:'auto' }}>
            <div style={{ minWidth:totalW }}>
              {/* Date header */}
              <div style={{ height:36, display:'flex', background:'var(--bg3)', borderBottom:'0.5px solid var(--border)' }}>
                {cols.map((col,i)=>(
                  <div key={i} style={{ width:CELL, minWidth:CELL, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'var(--text3)', borderRight:'0.5px solid var(--border)' }}>
                    {zoom==='week'?`${col.getDate()} ${MONTHS[col.getMonth()]}`:MONTHS[col.getMonth()]+' '+col.getFullYear()}
                  </div>
                ))}
              </div>

              {allProjects.map(proj=>(
                <React.Fragment key={proj}>
                  <div style={{ height:26, background:'var(--bg3)', borderBottom:'0.5px solid var(--border)', minWidth:totalW }}></div>
                  {validRows.filter(r=>(r.project||'General')===proj).map(r=>{
                    const color = STATUS_COLORS_BAR[r.status]||'#1D9E75'
                    const op = 1
                    const sD=parseDate(r.start), eD=parseDate(r.end)
                    const barL = zoom==='week'?(diffDays(minD,sD)/7)*CELL:((sD-minD)/(maxD-minD))*totalW
                    const barW = zoom==='week'?Math.max(CELL,(diffDays(sD,eD)/7)*CELL):Math.max(24,((eD-sD)/(maxD-minD))*totalW)
                    return (
                      <div key={r.id} style={{ height:44, position:'relative', borderBottom:'0.5px solid var(--border)', minWidth:totalW }}>
                        {cols.map((_,i)=><div key={i} style={{ position:'absolute', left:i*CELL, top:0, bottom:0, width:CELL, borderRight:'0.5px solid var(--border)', opacity:0.15 }}></div>)}
                        {/* Bar */}
                        <div
                          onMouseDown={e=>onBarMouseDown(e,r.id,'move')}
                          style={{ position:'absolute', left:barL, top:10, height:24, width:barW, background:color, backgroundImage:STATUS_PATTERNS[r.status]||'none', opacity:op, borderRadius:6, display:'flex', alignItems:'center', padding:'0 8px', fontSize:10, fontWeight:500, color:'white', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', zIndex:2, cursor:'grab', userSelect:'none' }}>
                          {r.task}
                          {/* Resize handle */}
                          <div
                            onMouseDown={e=>onBarMouseDown(e,r.id,'resize')}
                            style={{ position:'absolute', right:0, top:0, bottom:0, width:8, cursor:'ew-resize', background:'rgba(255,255,255,0.3)', borderRadius:'0 6px 6px 0' }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ display:'flex', gap:12, marginTop:10, flexWrap:'wrap', alignItems:'center' }}>
        {[...new Set(rows.map(r=>r.project||'General'))].map((proj,i)=>(<div key={proj} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'var(--text2)' }}><div style={{ width:10, height:10, borderRadius:2, background:getProjectColor(proj,projects) }}></div>{proj}</div>))}
        {[['Listo','done','#1D9E75'],['En curso','active','#185FA5'],['Pendiente','pending','#854F0B'],['Bloqueado','blocked','#A32D2D']].map(([l,k,c])=>(<div key={l} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'var(--text2)' }}><div style={{ width:24, height:10, borderRadius:2, background:c, backgroundImage:STATUS_PATTERNS[k]||'none', opacity:STATUS_OP[k]||0.5 }}></div>{l}</div>))}
        <div style={{ fontSize:11, color:'var(--text3)', marginLeft:'auto' }}>Clic en una tarea para editar fechas</div>
      </div>
    </div>
  )
}


function CalendarPanel({ projectKey }) {
  const { data: calRows, insert: insertEvent, remove: removeEvent } = useSupabaseTable('calendar_events', `cal_events_${projectKey}`, [], 'created_at')
  const filteredCalRows = (Array.isArray(calRows) ? calRows : []).filter(r => r.project_key === projectKey)
  const events = filteredCalRows.reduce((acc, r) => { acc[r.event_date] = r.event_name; return acc }, {})
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())
  const [adding, setAdding] = useState(null)
  const [newEvt, setNewEvt] = useState('')
  const MONTHS_FULL = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  const pad = d => String(d).padStart(2,'0')
  const keyFor = d => `${year}-${pad(month+1)}-${pad(d)}`
  const firstDay = new Date(year,month,1).getDay()
  const offset = firstDay===0?6:firstDay-1
  const daysInMonth = new Date(year,month+1,0).getDate()
  const prevMonth = () => { if(month===0){setMonth(11);setYear(y=>y-1)}else setMonth(m=>m-1) }
  const nextMonth = () => { if(month===11){setMonth(0);setYear(y=>y+1)}else setMonth(m=>m+1) }
  const today = new Date()
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
        <button style={btnS} onClick={prevMonth}>←</button>
        <div style={{ fontSize:14, fontWeight:500, flex:1, textAlign:'center' }}>{MONTHS_FULL[month]} {year}</div>
        <button style={btnS} onClick={nextMonth}>→</button>
        <button style={{ ...btnS, fontSize:11 }} onClick={()=>{setMonth(today.getMonth());setYear(today.getFullYear())}}>Hoy</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, marginBottom:6 }}>
        {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d=><div key={d} style={{ textAlign:'center', fontSize:11, color:'var(--text3)', padding:4 }}>{d}</div>)}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4 }}>
        {Array(offset).fill(null).map((_,i)=><div key={'e'+i}></div>)}
        {Array.from({length:daysInMonth},(_,i)=>i+1).map(d=>{
          const key=keyFor(d); const evt=events[key]
          const isToday = today.getDate()===d&&today.getMonth()===month&&today.getFullYear()===year
          return <div key={d} onClick={()=>{setAdding(key);setNewEvt(evt||'')}}
            style={{ background:'var(--bg)', border:`0.5px solid ${isToday?'var(--green)':'var(--border)'}`, borderRadius:10, minHeight:52, padding:6, cursor:'pointer' }}>
            <div style={{ fontSize:12, fontWeight:isToday?500:400, color:isToday?'var(--green)':'var(--text)' }}>{d}</div>
            {evt&&<div style={{ fontSize:9, background:'var(--green-light)', color:'var(--green-dark)', padding:'1px 4px', borderRadius:3, marginTop:2, lineHeight:1.4 }}>{evt}</div>}
          </div>
        })}
      </div>
      <Modal open={!!adding} onClose={()=>setAdding(null)} title={`Evento — ${adding}`}>
        <input style={iStyle} value={newEvt} onChange={e=>setNewEvt(e.target.value)} placeholder="Nombre del evento..." autoFocus />
        <div style={{ display:'flex', gap:8, marginTop:12, justifyContent:'flex-end' }}>
          <button style={btnS} onClick={()=>setAdding(null)}>Cancelar</button>
          {events[adding]&&<button style={{ ...btnS, color:'var(--danger)' }} onClick={()=>{
            const existing = filteredCalRows.find(r=>r.event_date===adding)
            if(existing) removeEvent(existing.id)
            setAdding(null)
          }}>Eliminar</button>}
          <button style={btnP} onClick={async ()=>{
            if(newEvt.trim()) {
              const existing = filteredCalRows.find(r=>r.event_date===adding)
              if(existing) await removeEvent(existing.id)
              await insertEvent({event_date:adding, event_name:newEvt.trim(), project_key:projectKey})
            }
            setAdding(null)
          }}>Guardar</button>
        </div>
      </Modal>
    </div>
  )
}

function BudgetPanel({ projectKey }) {
  const lsKeyB = `budget_rows_${projectKey}`
  const [rows, setRows] = useLS(lsKeyB, seedBudget)
  const update = (id,key,val) => setRows(r=>r.map(x=>x.id===id?{...x,[key]:key==='concept'||key==='section'?val:parseFloat(val)||0}:x))
  const remove = id => setRows(r=>r.filter(x=>x.id!==id))
  const addRow = () => setRows(r=>[...r,{id:Date.now(),section:'General',concept:'',days:0,unitario:0,iva:0.16}])
  const calc = row => { const costo=row.days*row.unitario; const ivaAmt=costo*row.iva; return { costo, ivaAmt, total:costo+ivaAmt } }
  const sections = [...new Set(rows.map(r=>r.section))]
  const grandTotal = rows.reduce((a,r)=>a+calc(r).total,0)
  const grandSub = rows.reduce((a,r)=>a+calc(r).costo,0)
  const grandIVA = rows.reduce((a,r)=>a+calc(r).ivaAmt,0)
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
        {[['Subtotal',grandSub],['IVA',grandIVA],['Total',grandTotal]].map(([l,v])=>(
          <div key={l} style={{ background:'var(--bg3)', borderRadius:10, padding:14 }}>
            <div style={{ fontSize:11, color:'var(--text3)', marginBottom:4 }}>{l}</div>
            <div style={{ fontSize:20, fontWeight:500, color:l==='Total'?'var(--green)':'var(--text)' }}>{fmt(v)}</div>
          </div>
        ))}
      </div>
      <div style={{ border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ borderCollapse:'collapse', fontSize:12, background:'var(--bg)', width:'100%' }}>
            <thead><tr>{['Concepto','Días/Hrs','Unitario','Costo','IVA %','IVA $','Total',''].map((h,i)=><th key={i} style={{ ...TH, textAlign:i>=3&&i<7?'right':'left' }}>{h}</th>)}</tr></thead>
            <tbody>
              {sections.map(sec=>(
                <React.Fragment key={sec}>
                  <tr><td colSpan={8} style={{ ...TD, background:'var(--bg3)', fontWeight:500, fontSize:11, color:'var(--text2)' }}>{sec}</td></tr>
                  {rows.filter(r=>r.section===sec).map(row=>{
                    const {costo,ivaAmt,total}=calc(row)
                    return (
                      <tr key={row.id}>
                        <td style={TD}><input style={TDI} value={row.concept} onChange={e=>update(row.id,'concept',e.target.value)} placeholder="Concepto..." /></td>
                        <td style={TD}><input type="number" style={{ ...TDI, width:60 }} value={row.days} onChange={e=>update(row.id,'days',e.target.value)} /></td>
                        <td style={TD}><input type="number" style={{ ...TDI, width:80 }} value={row.unitario} onChange={e=>update(row.id,'unitario',e.target.value)} /></td>
                        <td style={{ ...TD, textAlign:'right', color:'var(--text2)' }}>{fmt(costo)}</td>
                        <td style={TD}><input type="number" style={{ ...TDI, width:45 }} value={Math.round(row.iva*100)} onChange={e=>update(row.id,'iva',(parseFloat(e.target.value)||0)/100)} /></td>
                        <td style={{ ...TD, textAlign:'right', color:'var(--text2)' }}>{fmt(ivaAmt)}</td>
                        <td style={{ ...TD, textAlign:'right', fontWeight:500 }}>{fmt(total)}</td>
                        <td style={TD}><button style={btnD} onClick={()=>remove(row.id)}>✕</button></td>
                      </tr>
                    )
                  })}
                </React.Fragment>
              ))}
              <tr>
                <td colSpan={5} style={{ ...TD, fontWeight:500, borderTop:'1.5px solid var(--border2)' }}>Total general</td>
                <td style={{ ...TD, textAlign:'right', fontWeight:500, borderTop:'1.5px solid var(--border2)' }}>{fmt(grandIVA)}</td>
                <td style={{ ...TD, textAlign:'right', fontWeight:500, color:'var(--green)', borderTop:'1.5px solid var(--border2)', fontSize:14 }}>{fmt(grandTotal)}</td>
                <td style={{ ...TD, borderTop:'1.5px solid var(--border2)' }}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <button style={{ ...btnS, marginTop:12 }} onClick={addRow}>+ Agregar línea</button>
    </div>
  )
}

function TrackingPanel({ projectKey }) {
  const { data: allTasks, insert: insertTaskDB, update: updateTask, remove: removeTaskDB } = useSupabaseTable('tracking', `tracking_${projectKey}`, [], 'created_at')
  const tasks = (Array.isArray(allTasks)?allTasks:[]).filter(r => !r.project_key || r.project_key === projectKey)
  const insertTask = row => insertTaskDB({...row, project_key: projectKey})

  const { data: allTFiles, insert: insertTFile, remove: removeTFile } = useSupabaseTable('tracking_files', `tfiles_${projectKey}`, [], 'created_at')
  const taskFiles = (Array.isArray(allTFiles)?allTFiles:[]).filter(f => f.project_key === projectKey)

  const { data: allComments, insert: insertComment, remove: removeComment } = useSupabaseTable('task_comments', `tcomments_${projectKey}`, [], 'created_at')
  const taskComments = (Array.isArray(allComments)?allComments:[]).filter(c => c.project_key === projectKey)

  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState(null)
  const [newName, setNewName] = useState('')
  const [newAssignee, setNewAssignee] = useState('')
  const [uploading, setUploading] = useState(null)
  const [newComment, setNewComment] = useState({})

  const toggle = id => { const task = tasks.find(x=>x.id===id); if(task) updateTask(id,{done:!task.done}) }
  const addTask = () => { if(!newName.trim()) return; insertTask({name:newName.trim(),project:'General',assignee:newAssignee||'Sin asignar',done:false,week:'hoy'}); setNewName(''); setNewAssignee('') }

  const addFile = async (taskId, file) => {
    setUploading(taskId)
    try {
      const uploaded = await uploadFile(file)
      if (uploaded) {
        await insertTFile({ task_id:String(taskId), project_key:projectKey, name:file.name, file_type:file.type||'', size:file.size, url:uploaded.url, path:uploaded.path, upload_date:new Date().toLocaleDateString('es-MX') })
      } else {
        if (file.size > 5*1024*1024) { alert(`${file.name} es muy grande.`); return }
        const url = await new Promise((res,rej)=>{const r=new FileReader();r.onload=ev=>res(ev.target.result);r.onerror=rej;r.readAsDataURL(file)})
        await insertTFile({ task_id:String(taskId), project_key:projectKey, name:file.name, file_type:file.type||'', size:file.size, url, path:'', upload_date:new Date().toLocaleDateString('es-MX') })
      }
    } catch(err) { alert(`Error: ${err.message}`) }
    setUploading(null)
  }

  const removeFile = async (fileId) => {
    const f = taskFiles.find(x=>x.id===fileId)
    if (f?.path) await deleteFile(f.path)
    removeTFile(fileId)
  }

  const sendComment = (taskId, userName) => {
    const text = (newComment[taskId]||'').trim()
    if (!text) return
    insertComment({ task_id:String(taskId), project_key:projectKey, user_name:userName, message:text })
    setNewComment(c=>({...c,[taskId]:''}))
  }

  const visible = tasks.filter(t=>filter==='all'||(filter==='pending'&&!t.done)||(filter==='done'&&t.done))

  return (
    <div>
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        {[['all','Todos'],['pending','Pendientes'],['done','Completados']].map(([k,l])=>(
          <button key={k} style={{ padding:'5px 14px', fontSize:12, borderRadius:20, border:'0.5px solid var(--border2)', background:filter===k?'var(--green)':'transparent', color:filter===k?'white':'var(--text2)', cursor:'pointer' }} onClick={()=>setFilter(k)}>{l}</button>
        ))}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {visible.map(t=>{
          const tFiles = taskFiles.filter(f=>String(f.task_id)===String(t.id))
          const tComments = taskComments.filter(c=>String(c.task_id)===String(t.id))
          return (
            <div key={t.id} style={{ background:'var(--bg)', border:'0.5px solid var(--border)', borderRadius:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 14px', cursor:'pointer' }} onClick={()=>setExpanded(expanded===t.id?null:t.id)}>
                <div onClick={e=>{e.stopPropagation();toggle(t.id)}} style={{ width:18, height:18, borderRadius:4, border:t.done?'none':'1.5px solid var(--border2)', background:t.done?'var(--green)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, color:'white', fontSize:11 }}>{t.done&&'✓'}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, textDecoration:t.done?'line-through':'none', color:t.done?'var(--text3)':'var(--text)' }}>{t.name}</div>
                  <div style={{ fontSize:11, color:'var(--text3)' }}>{t.project} · {t.week}{tFiles.length>0?` · ${tFiles.length} arch.`:''}{tComments.length>0?` · ${tComments.length} comentarios`:''}</div>
                </div>
                <div style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:'var(--bg3)', color:'var(--text2)' }}>{t.assignee}</div>
                <div style={{ fontSize:11, color:'var(--text3)' }}>{expanded===t.id?'▲':'▼'}</div>
              </div>

              {expanded===t.id&&(
                <div style={{ borderTop:'0.5px solid var(--border)', padding:'12px 14px' }}>

                  {/* Archivos adjuntos */}
                  <div style={{ fontSize:11, fontWeight:500, color:'var(--text2)', marginBottom:8 }}>Archivos adjuntos</div>
                  {tFiles.length===0&&<div style={{ fontSize:12, color:'var(--text3)', marginBottom:8 }}>Sin archivos aún.</div>}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:8, marginBottom:12 }}>
                    {tFiles.map(f=>{
                      const ext=f.name?.split('.').pop()?.toLowerCase()
                      const isImg=f.file_type?.startsWith('image/')||['jpg','jpeg','png','gif','webp'].includes(ext)
                      const isVid=f.file_type?.startsWith('video/')||['mp4','mov','avi','webm'].includes(ext)
                      return (
                        <div key={f.id} style={{ background:'var(--bg2)', border:'0.5px solid var(--border)', borderRadius:10, overflow:'hidden' }}>
                          <div style={{ aspectRatio:'16/9', background:'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                            {isImg&&<img src={f.url} alt={f.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />}
                            {isVid&&<video src={f.url} style={{ width:'100%', height:'100%', objectFit:'cover' }} muted controls />}
                            {!isImg&&!isVid&&<div style={{ fontSize:24 }}>📄</div>}
                          </div>
                          <div style={{ padding:'8px 10px' }}>
                            <div style={{ fontSize:11, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{f.name}</div>
                            <div style={{ fontSize:10, color:'var(--text3)' }}>{f.upload_date} · {f.size?(f.size/1024/1024).toFixed(1)+'MB':''}</div>
                            {f.url&&!f.url.startsWith('data:')&&<a href={f.url} target="_blank" rel="noreferrer" style={{ fontSize:10, color:'var(--blue)', display:'block', marginTop:3 }}>Ver / Descargar ↗</a>}
                            <button style={{ ...btnD, marginTop:4, fontSize:10 }} onClick={()=>removeFile(f.id)}>Eliminar</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ position:'relative', display:'inline-block', marginBottom:16 }}>
                    <button style={btnS} disabled={uploading===t.id}>{uploading===t.id?'Subiendo...':'+ Adjuntar archivo'}</button>
                    <input type="file" multiple accept="image/*,video/*,audio/*,.pdf,.zip,.jpg,.jpeg,.png,.mov,.mp4" onChange={e=>Array.from(e.target.files).forEach(f=>addFile(t.id,f))} style={{ position:'absolute', inset:0, opacity:0, cursor:uploading===t.id?'wait':'pointer' }} disabled={uploading===t.id} />
                  </div>

                  {/* Thread de comentarios */}
                  <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:12 }}>
                    <div style={{ fontSize:11, fontWeight:500, color:'var(--text2)', marginBottom:10 }}>Comentarios del equipo</div>
                    {tComments.length===0&&<div style={{ fontSize:12, color:'var(--text3)', marginBottom:10 }}>Sin comentarios aún.</div>}
                    <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:12 }}>
                      {tComments.map(c=>(
                        <div key={c.id} style={{ background:'var(--bg2)', borderRadius:10, padding:'8px 12px', border:'0.5px solid var(--border)' }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:4 }}>
                            <span style={{ fontSize:11, fontWeight:500, color:'var(--green-dark)' }}>{c.user_name}</span>
                            <span style={{ fontSize:10, color:'var(--text3)' }}>{new Date(c.created_at).toLocaleString('es-MX',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</span>
                          </div>
                          <div style={{ fontSize:13, color:'var(--text)', lineHeight:1.5, whiteSpace:'pre-wrap' }}>{c.message}</div>
                          <button style={{ ...btnD, fontSize:10, marginTop:4 }} onClick={()=>removeComment(c.id)}>Eliminar</button>
                        </div>
                      ))}
                    </div>
                    <TrackingCommentBox taskId={t.id} value={newComment[t.id]||''} onChange={v=>setNewComment(c=>({...c,[t.id]:v}))} onSend={userName=>sendComment(t.id,userName)} />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div style={{ display:'flex', gap:8, marginTop:16 }}>
        <input style={{ ...iStyle, flex:1, marginBottom:0 }} value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Nueva tarea..." onKeyDown={e=>e.key==='Enter'&&addTask()} />
        <input style={{ ...iStyle, width:140, marginBottom:0 }} value={newAssignee} onChange={e=>setNewAssignee(e.target.value)} placeholder="Responsable" />
        <button style={btnP} onClick={addTask}>Agregar</button>
      </div>
    </div>
  )
}

function TrackingCommentBox({ taskId, value, onChange, onSend }) {
  const savedUser = localStorage.getItem('combo_user')
  const user = savedUser ? JSON.parse(savedUser) : { name:'Usuario' }
  return (
    <div style={{ display:'flex', gap:8, alignItems:'flex-end', background:'var(--bg)', border:'0.5px solid var(--border2)', borderRadius:12, padding:'8px 10px' }}>
      <textarea
        value={value}
        onChange={e=>onChange(e.target.value)}
        onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();onSend(user.name)} }}
        placeholder="Escribe un comentario... (Enter para enviar)"
        rows={1}
        style={{ flex:1, border:'none', background:'transparent', resize:'none', fontSize:13, color:'var(--text)', fontFamily:"'DM Sans',sans-serif", outline:'none', lineHeight:1.5, overflow:'hidden' }}
        onInput={e=>{e.target.style.height='auto';e.target.style.height=Math.min(e.target.scrollHeight,120)+'px'}}
      />
      <button style={{ ...btnP, flexShrink:0, padding:'6px 12px' }} onClick={()=>onSend(user.name)}>Enviar</button>
    </div>
  )
}

function FilesPanel({ projectKey }) {
  const { data: allFiles, insert: insertFile, update: updateFileDB, remove: removeFileDB } = useSupabaseTable('project_files', `project_files_${projectKey}`, [], 'created_at')
  const files = (Array.isArray(allFiles)?allFiles:[]).filter(f => f.project_key === projectKey)
  const [uploadStatus, setUploadStatus] = useState('')

  const handleUpload = async e => {
    const fileList = Array.from(e.target.files)
    e.target.value = ''
    for (const file of fileList) {
      setUploadStatus(`Subiendo: ${file.name}`)
      try {
        const uploaded = await uploadFile(file)
        if (uploaded) {
          await insertFile({ project_key:projectKey, name:file.name, file_type:file.type||`image/${file.name.split('.').pop()}`, size:file.size, url:uploaded.url, path:uploaded.path, comment:'', upload_date:new Date().toLocaleDateString('es-MX') })
        } else {
          if (file.size > 5*1024*1024) { alert(`No se pudo subir ${file.name}. Verifica tu conexión.`); continue }
          const url = await new Promise((res,rej) => { const r=new FileReader(); r.onload=ev=>res(ev.target.result); r.onerror=rej; r.readAsDataURL(file) })
          await insertFile({ project_key:projectKey, name:file.name, file_type:file.type||'', size:file.size, url, path:'', comment:'', upload_date:new Date().toLocaleDateString('es-MX') })
        }
      } catch(err) { alert(`Error al subir ${file.name}: ${err.message}`) }
    }
    setUploadStatus('')
  }

  const updateComment = (id, comment) => updateFileDB(id, { comment })
  const remove = async id => {
    const file = files.find(x=>x.id===id)
    if (file?.path) await deleteFile(file.path)
    removeFileDB(id)
  }

  return (
    <div>
      <div onDragOver={e=>{e.preventDefault()}} onDrop={e=>{e.preventDefault();handleUpload({target:{files:e.dataTransfer.files,value:''}})}}
        style={{ border:`1.5px dashed ${uploadStatus?'var(--green)':'var(--border2)'}`, borderRadius:14, padding:30, textAlign:'center', background:uploadStatus?'var(--green-light)':'var(--bg2)', position:'relative', marginBottom:20, cursor:uploadStatus?'wait':'pointer', transition:'all 0.2s' }}>
        <div style={{ fontSize:22, marginBottom:8 }}>📁</div>
        <div style={{ fontSize:13, color:'var(--text2)', marginBottom:4 }}>{uploadStatus||'Arrastra archivos aquí o haz clic'}</div>
        <div style={{ fontSize:12, color:'var(--text3)' }}>{uploadStatus?'...':'Imágenes, video, audio · JPG, PNG, MOV, MP4, MP3, etc.'}</div>
        <input type="file" multiple accept="image/*,video/*,audio/*,.jpg,.jpeg,.png,.gif,.webp,.mp4,.mov,.mp3,.wav,.m4a" onChange={handleUpload} style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer' }} disabled={!!uploadStatus} />
      </div>
      {files.length===0&&!uploadStatus&&<div style={{ textAlign:'center', color:'var(--text3)', fontSize:13, padding:40 }}>Sin archivos aún</div>}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:12 }}>
        {files.map(f=>{
          const ext = f.name?.split('.').pop()?.toLowerCase()
          const imgExts = ['jpg','jpeg','png','gif','webp','bmp','svg']
          const vidExts = ['mp4','mov','avi','webm','mkv']
          const isImg = f.file_type?.startsWith('image/') || imgExts.includes(ext)
          const isVid = f.file_type?.startsWith('video/') || vidExts.includes(ext)
          return (
            <div key={f.id} style={{ background:'var(--bg)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
              <div style={{ aspectRatio:'16/9', background:'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                {isImg&&<img src={f.url} alt={f.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />}
                {isVid&&<video src={f.url} style={{ width:'100%', height:'100%', objectFit:'cover' }} muted controls />}
                {!isImg&&!isVid&&<div style={{ fontSize:28 }}>🎵</div>}
              </div>
              <div style={{ padding:'8px 10px' }}>
                <div style={{ fontSize:11, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{f.name}</div>
                <div style={{ fontSize:10, color:'var(--text3)', marginTop:1 }}>{f.upload_date} · {f.size?(f.size/1024/1024).toFixed(1)+'MB':''}</div>
                <textarea style={{ ...iStyle, marginTop:6, fontSize:11, padding:'4px 7px', resize:'none', overflow:'hidden', lineHeight:1.5 }} value={f.comment||''} onChange={e=>updateComment(f.id,e.target.value)} placeholder="Comentario..." rows={1} onInput={e=>{e.target.style.height="auto";e.target.style.height=e.target.scrollHeight+"px"}} />
                {f.url&&!f.url.startsWith('data:')&&<a href={f.url} target="_blank" rel="noreferrer" style={{ fontSize:10, color:'var(--blue)', display:'block', marginTop:4 }}>Ver / Descargar ↗</a>}
                <button style={{ ...btnD, marginTop:6 }} onClick={()=>remove(f.id)}>Eliminar</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const SEMAFORO = [
  { value:'rojo', label:'🔴 Urgente', color:'#E24B4A' },
  { value:'amarillo', label:'🟡 En proceso', color:'#EF9F27' },
  { value:'verde', label:'🟢 Listo', color:'#1D9E75' },
]

function MiSemanaPanel({ user }) {
  const [cortes, setCortes] = useLS(`misemana_${user.id}`, [])
  const [showNew, setShowNew] = useState(false)
  const [currentCorte, setCurrentCorte] = useState(null)
  const [editingCorte, setEditingCorte] = useState(null)

  const newCorte = () => {
    const hoy = new Date().toLocaleDateString('es-MX', { weekday:'long', year:'numeric', month:'long', day:'numeric' })
    const corte = { id:Date.now(), fecha:hoy, proyectos:[] }
    setEditingCorte(corte)
    setShowNew(true)
  }

  const saveCorte = (corte) => {
    setCortes(c => {
      const exists = c.find(x => x.id===corte.id)
      return exists ? c.map(x=>x.id===corte.id?corte:x) : [corte, ...c]
    })
    setShowNew(false)
    setEditingCorte(null)
    setCurrentCorte(corte.id)
  }

  const deleteCorte = id => { setCortes(c=>c.filter(x=>x.id!==id)); if(currentCorte===id) setCurrentCorte(null) }

  const activeCorte = cortes.find(c=>c.id===currentCorte) || cortes[0]

  return (
    <div style={{ display:'flex', gap:16, minHeight:400, alignItems:'flex-start' }}>
      {/* Sidebar de cortes */}
      <div style={{ width:200, minWidth:200, display:'flex', flexDirection:'column', gap:8 }}>
        <button style={{ ...btnP, width:'100%' }} onClick={newCorte}>+ Nuevo corte</button>
        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:6 }}>
          {cortes.map(c=>(
            <div key={c.id} onClick={()=>setCurrentCorte(c.id)}
              style={{ background: currentCorte===c.id||(!currentCorte&&cortes[0]?.id===c.id)?'var(--green-light)':'var(--bg)', border:`0.5px solid ${currentCorte===c.id?'var(--green)':'var(--border)'}`, borderRadius:10, padding:'10px 12px', cursor:'pointer' }}>
              <div style={{ fontSize:12, fontWeight:500, color: currentCorte===c.id?'var(--green-dark)':'var(--text)' }}>{c.fecha}</div>
              <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{c.proyectos?.length||0} proyectos</div>
            </div>
          ))}
          {cortes.length===0 && <div style={{ fontSize:12, color:'var(--text3)', textAlign:'center', padding:20 }}>Sin cortes aún</div>}
        </div>
      </div>

      {/* Contenido del corte */}
      <div style={{ flex:1, overflowY:'auto' }}>
        {showNew && editingCorte ? (
          <CorteEditor corte={editingCorte} onSave={saveCorte} onCancel={()=>{setShowNew(false);setEditingCorte(null)}} />
        ) : activeCorte ? (
          <CorteView corte={activeCorte} onEdit={()=>{setEditingCorte(activeCorte);setShowNew(true)}} onDelete={()=>deleteCorte(activeCorte.id)} />
        ) : (
          <div style={{ textAlign:'center', padding:60, color:'var(--text3)', fontSize:13 }}>Crea tu primer corte semanal</div>
        )}
      </div>
    </div>
  )
}

function CorteEditor({ corte, onSave, onCancel }) {
  const [fecha, setFecha] = useState(corte.fecha)
  const [proyectos, setProyectos] = useState(corte.proyectos||[])

  const addProyecto = () => setProyectos(p=>[...p,{ id:Date.now(), nombre:'', semaforo:'amarillo', tareas:[] }])
  const removeProyecto = id => setProyectos(p=>p.filter(x=>x.id!==id))
  const updateProyecto = (id,key,val) => setProyectos(p=>p.map(x=>x.id===id?{...x,[key]:val}:x))
  const addTarea = (projId) => setProyectos(p=>p.map(x=>x.id===projId?{...x,tareas:[...x.tareas,{id:Date.now(),texto:'',responsable:''}]}:x))
  const removeTarea = (projId,tareaId) => setProyectos(p=>p.map(x=>x.id===projId?{...x,tareas:x.tareas.filter(t=>t.id!==tareaId)}:x))
  const updateTarea = (projId,tareaId,key,val) => setProyectos(p=>p.map(x=>x.id===projId?{...x,tareas:x.tareas.map(t=>t.id===tareaId?{...t,[key]:val}:t)}:x))

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <input style={{ ...iStyle, flex:1, fontSize:14, fontWeight:500 }} value={fecha} onChange={e=>setFecha(e.target.value)} placeholder="Fecha del corte..." />
        <button style={btnP} onClick={()=>onSave({...corte,fecha,proyectos})}>Guardar corte</button>
        <button style={btnS} onClick={onCancel}>Cancelar</button>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {proyectos.map(proj=>(
          <div key={proj.id} style={{ ...card, borderLeft:`3px solid ${SEMAFORO.find(s=>s.value===proj.semaforo)?.color||'#888'}`, marginBottom:0 }}>
            <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:12 }}>
              <select value={proj.semaforo} onChange={e=>updateProyecto(proj.id,'semaforo',e.target.value)}
                style={{ ...iStyle, width:140, marginBottom:0, fontWeight:500 }}>
                {SEMAFORO.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <input value={proj.nombre} onChange={e=>updateProyecto(proj.id,'nombre',e.target.value)}
                style={{ ...iStyle, flex:1, marginBottom:0, fontWeight:500 }} placeholder="Nombre del proyecto..." />
              <button style={btnD} onClick={()=>removeProyecto(proj.id)}>✕</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:10 }}>
              {proj.tareas.map(t=>(
                <div key={t.id} style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--text3)', flexShrink:0 }}></div>
                  <input value={t.texto} onChange={e=>updateTarea(proj.id,t.id,'texto',e.target.value)}
                    style={{ ...iStyle, flex:1, marginBottom:0, fontSize:12 }} placeholder="Tarea o nota..." />
                  <input value={t.responsable} onChange={e=>updateTarea(proj.id,t.id,'responsable',e.target.value)}
                    style={{ ...iStyle, width:100, marginBottom:0, fontSize:11 }} placeholder="@quien" />
                  <button style={btnD} onClick={()=>removeTarea(proj.id,t.id)}>✕</button>
                </div>
              ))}
            </div>
            <button style={{ ...btnS, fontSize:11 }} onClick={()=>addTarea(proj.id)}>+ Tarea</button>
          </div>
        ))}
      </div>
      <button style={{ ...btnS, marginTop:12, width:'100%' }} onClick={addProyecto}>+ Agregar proyecto</button>
    </div>
  )
}

function CorteView({ corte, onEdit, onDelete }) {
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <div style={{ fontSize:15, fontWeight:500, flex:1 }}>Corte — {corte.fecha}</div>
        <button style={btnS} onClick={onEdit}>Editar</button>
        <button style={{ ...btnS, color:'var(--danger)', borderColor:'var(--danger)' }} onClick={onDelete}>Eliminar</button>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {(corte.proyectos||[]).map(proj=>{
          const sem = SEMAFORO.find(s=>s.value===proj.semaforo)
          return (
            <div key={proj.id} style={{ ...card, borderLeft:`3px solid ${sem?.color||'#888'}`, marginBottom:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                <span style={{ fontSize:16 }}>{sem?.label.split(' ')[0]}</span>
                <span style={{ fontSize:14, fontWeight:500 }}>{proj.nombre}</span>
              </div>
              {(proj.tareas||[]).map(t=>(
                <div key={t.id} style={{ display:'flex', gap:8, alignItems:'baseline', padding:'3px 0' }}>
                  <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--text3)', flexShrink:0, marginTop:6 }}></div>
                  <span style={{ fontSize:13, flex:1, color:'var(--text)' }}>{t.texto}</span>
                  {t.responsable&&<span style={{ fontSize:11, color:'var(--green-dark)', background:'var(--green-light)', padding:'1px 7px', borderRadius:20 }}>{t.responsable}</span>}
                </div>
              ))}
            </div>
          )
        })}
        {(!corte.proyectos||corte.proyectos.length===0)&&<div style={{ fontSize:13, color:'var(--text3)', textAlign:'center', padding:40 }}>Sin proyectos en este corte</div>}
      </div>
    </div>
  )
}

// ─── Notas compartidas ────────────────────────────────────────────────────────
function NotasPanel({ user, projects, projectKey }) {
  const { data: notas, insert: insertNota, remove: removeNota } = useSupabaseTable('notas', 'notas_compartidas', [])
  const [proyecto, setProyecto] = useState('todos')
  const [texto, setTexto] = useState('')
  const textareaRef = useRef()

  const send = async () => {
    if (!texto.trim()) return
    const fecha = new Date().toLocaleString('es-MX', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })
    const projName = proyecto==='todos' ? (currentProjName||'General') : proyecto
    await insertNota({ user_name: user.name, texto: texto.trim(), proyecto: projName, fecha })
    setTexto('')
  }

  const remove = id => removeNota(id)
  const currentProjName = projects.find((_,i)=>i===parseInt(projectKey.replace('p','')))?.name || null
  const visible = notas.filter(n => {
    const matchesProj = proyecto==='todos' ? true : n.proyecto===proyecto
    return matchesProj
  })
  const USER_COLORS = { 'Admin':'#1D9E75', 'Animador 1':'#185FA5', 'Artista 1':'#854F0B' }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 132px)' }}>
      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
        <button style={{ padding:'5px 14px', fontSize:12, borderRadius:20, border:'0.5px solid var(--border2)', background:proyecto==='todos'?'var(--green)':'transparent', color:proyecto==='todos'?'white':'var(--text2)', cursor:'pointer' }} onClick={()=>setProyecto('todos')}>Todos</button>
        {projects.map(p=>(
          <button key={p.id} style={{ padding:'5px 14px', fontSize:12, borderRadius:20, border:'0.5px solid var(--border2)', background:proyecto===p.name?'var(--green)':'transparent', color:proyecto===p.name?'white':'var(--text2)', cursor:'pointer' }} onClick={()=>setProyecto(p.name)}>{p.name}</button>
        ))}
      </div>
      <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:10, marginBottom:14 }}>
        {visible.length===0&&<div style={{ textAlign:'center', color:'var(--text3)', fontSize:13, padding:40 }}>Sin notas aún. ¡Escribe la primera!</div>}
        {[...visible].reverse().map(n=>{
          const nombre = n.user_name || n.user || '?'
          const color = USER_COLORS[nombre]||'#888'
          const isMe = nombre===user.name
          return (
            <div key={n.id} style={{ display:'flex', flexDirection: isMe?'row-reverse':'row', gap:10, alignItems:'flex-start' }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:color+'22', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:500, color, flexShrink:0 }}>
                {nombre.charAt(0)}
              </div>
              <div style={{ maxWidth:'70%' }}>
                <div style={{ display:'flex', gap:8, alignItems:'baseline', marginBottom:4, flexDirection: isMe?'row-reverse':'row' }}>
                  <span style={{ fontSize:11, fontWeight:500, color }}>{nombre}</span>
                  <span style={{ fontSize:10, color:'var(--text3)' }}>{n.fecha}</span>
                  <span style={{ fontSize:10, padding:'1px 6px', borderRadius:20, background:'var(--bg3)', color:'var(--text3)' }}>{n.proyecto}</span>
                </div>
                <div style={{ background: isMe?'var(--green-light)':'var(--bg)', border:'0.5px solid var(--border)', borderRadius: isMe?'14px 14px 4px 14px':'14px 14px 14px 4px', padding:'10px 14px', fontSize:13, color:'var(--text)', lineHeight:1.5, position:'relative' }}>
                  {n.texto}
                  {isMe&&<button onClick={()=>remove(n.id)} style={{ position:'absolute', top:4, right:6, background:'none', border:'none', cursor:'pointer', fontSize:10, color:'var(--text3)', opacity:0.6 }}>✕</button>}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Input */}
      <div style={{ display:'flex', gap:8, alignItems:'flex-end', background:'var(--bg)', border:'0.5px solid var(--border2)', borderRadius:14, padding:'10px 12px' }}>
        <select value={proyecto} onChange={e=>setProyecto(e.target.value)}
          style={{ padding:'6px 8px', fontSize:11, borderRadius:8, border:'0.5px solid var(--border2)', background:'var(--bg2)', color:'var(--text)', cursor:'pointer', flexShrink:0 }}>
          <option value="todos">General</option>
          {projects.map(p=><option key={p.id} value={p.name}>{p.name}</option>)}
        </select>
        <textarea ref={textareaRef} value={texto} onChange={e=>setTexto(e.target.value)}
          onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()} }}
          placeholder="Escribe una nota... (Enter para enviar, Shift+Enter para nueva línea)" rows={1}
          style={{ flex:1, border:'none', background:'transparent', resize:'none', fontSize:13, color:'var(--text)', fontFamily:"'DM Sans',sans-serif", outline:'none', lineHeight:1.5 }}
          onInput={e=>{e.target.style.height='auto';e.target.style.height=Math.min(e.target.scrollHeight,120)+'px'}} />
        <button style={{ ...btnP, flexShrink:0 }} onClick={send}>Enviar</button>
      </div>
    </div>
  )
}

// ─── Panels list & App ────────────────────────────────────────────────────────
// ─── Transcripción ────────────────────────────────────────────────────────────
// ─── Transcripción ────────────────────────────────────────────────────────────
function TranscripcionPanel({ projectKey }) {
  const lsKey = `transcripciones_${projectKey}`
  const [items, setItems] = useLS(lsKey, [])
  const [queue, setQueue] = useState([])
  const [processing, setProcessing] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [mode, setMode] = useState('texto') // texto | timecodes

  const OPENAI_KEY = process.env.REACT_APP_OPENAI_KEY

  const fmtTC = s => {
    const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = Math.floor(s%60)
    return h>0 ? `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}` : `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  }

  const buildTimecoded = (segments) => {
    if (!segments || !segments.length) return ''
    return segments.map(seg => `[${fmtTC(seg.start)}]  ${seg.text.trim()}`).join('\n')
  }

  const addFiles = (files) => {
    const newItems = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      file,
      status: 'pending',
      text: '',
      textTC: '',
      duration: null,
    }))
    setQueue(q => [...q, ...newItems])
  }

  const transcribeOne = async (item) => {
    if (!OPENAI_KEY) return { ...item, status:'error', text:'No hay API key de OpenAI configurada. Agrega REACT_APP_OPENAI_KEY en Vercel.' }
    setQueue(q => q.map(x => x.id===item.id ? {...x, status:'processing'} : x))
    try {
      const formData = new FormData()
      formData.append('file', item.file, item.name)
      formData.append('model', 'whisper-1')
      formData.append('language', 'es')
      formData.append('response_format', 'verbose_json')
      formData.append('timestamp_granularities[]', 'segment')

      const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${OPENAI_KEY}` },
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json()
        return { ...item, status:'error', text: err.error?.message || 'Error al transcribir' }
      }
      const data = await res.json()
      const textTC = buildTimecoded(data.segments)
      return { ...item, status:'done', text: data.text, textTC, duration: data.duration ? Math.round(data.duration) : null }
    } catch (err) {
      return { ...item, status:'error', text: 'Error: ' + err.message }
    }
  }

  const transcribeAll = async () => {
    if (processing) return
    const pending = queue.filter(x => x.status==='pending' || x.status==='error')
    if (!pending.length) return
    setProcessing(true)
    for (const item of pending) {
      const result = await transcribeOne(item)
      setQueue(q => q.map(x => x.id===item.id ? result : x))
      if (result.status==='done') {
        const saved = { id: Date.now(), name: result.name, text: result.text, textTC: result.textTC, duration: result.duration, date: new Date().toLocaleDateString('es-MX'), size: result.size }
        setItems(prev => [saved, ...prev])
      }
    }
    setProcessing(false)
  }

  const removeQueue = id => setQueue(q => q.filter(x => x.id!==id))
  const removeItem = id => setItems(prev => prev.filter(x => x.id!==id))
  const copyText = (item) => {
    const text = mode==='timecodes' ? (item.textTC||item.text) : item.text
    navigator.clipboard.writeText(text)
  }
  const downloadText = (item, fmt) => {
    const text = fmt==='timecodes' ? (item.textTC||item.text) : item.text
    const filename = item.name.replace(/\.[^.]+$/, '') + (fmt==='timecodes' ? '_timecodes' : '') + '.txt'
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }

  const fmtSize = b => b > 1024*1024 ? (b/1024/1024).toFixed(1)+'MB' : (b/1024).toFixed(0)+'KB'
  const fmtDur = s => s ? `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')} min` : ''
  const statusColor = { pending:'var(--text3)', processing:'var(--amber)', done:'var(--green)', error:'var(--danger)' }
  const statusLabel = { pending:'Pendiente', processing:'Transcribiendo...', done:'Listo', error:'Error' }

  return (
    <div>
      {/* Mode selector */}
      <div style={{ display:'flex', gap:8, marginBottom:16, alignItems:'center' }}>
        <div style={{ fontSize:12, color:'var(--text2)', marginRight:4 }}>Formato:</div>
        {[['texto','Solo texto'],['timecodes','Con timecodes']].map(([m,label])=>(
          <button key={m} style={{ padding:'5px 14px', fontSize:12, borderRadius:20, border:'0.5px solid var(--border2)', background:mode===m?'var(--green)':'transparent', color:mode===m?'white':'var(--text2)', cursor:'pointer' }} onClick={()=>setMode(m)}>{label}</button>
        ))}
        <div style={{ fontSize:11, color:'var(--text3)', marginLeft:8 }}>
          {mode==='timecodes' ? '📍 Con marcas de tiempo por segmento' : '📄 Texto limpio para guiones'}
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e=>{e.preventDefault();setDragOver(true)}}
        onDragLeave={()=>setDragOver(false)}
        onDrop={e=>{e.preventDefault();setDragOver(false);addFiles(e.dataTransfer.files)}}
        style={{ border:`1.5px dashed ${dragOver?'var(--green)':'var(--border2)'}`, borderRadius:14, padding:30, textAlign:'center', background: dragOver?'var(--green-light)':'var(--bg2)', position:'relative', marginBottom:20, cursor:'pointer', transition:'all 0.15s' }}>
        <div style={{ fontSize:24, marginBottom:8 }}>🎙️</div>
        <div style={{ fontSize:13, color:'var(--text2)', marginBottom:4 }}>Arrastra tus audios o videos aquí</div>
        <div style={{ fontSize:12, color:'var(--text3)', marginBottom:12 }}>MP3, MP4, M4A, WAV, MOV, WEBM — puedes subir varios a la vez</div>
        <input type="file" multiple accept="audio/*,video/*,.mp3,.mp4,.m4a,.wav,.mov,.webm,.ogg" onChange={e=>addFiles(e.target.files)}
          style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer' }} />
        <div style={{ display:'inline-block', padding:'7px 20px', background:'var(--green)', color:'white', borderRadius:8, fontSize:12, fontWeight:500 }}>Seleccionar archivos</div>
      </div>

      {/* Queue */}
      {queue.length > 0 && (
        <div style={{ ...card, marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div style={{ fontSize:13, fontWeight:500 }}>Cola — {queue.length} archivo{queue.length!==1?'s':''}</div>
            <button style={btnP} onClick={transcribeAll} disabled={processing}>
              {processing ? '⏳ Transcribiendo...' : `▶ Transcribir todo (${queue.filter(x=>x.status==='pending'||x.status==='error').length})`}
            </button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {queue.map(item => (
              <div key={item.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', background:'var(--bg2)', borderRadius:10, border:'0.5px solid var(--border)' }}>
                <div style={{ fontSize:20 }}>{item.file?.type?.startsWith('video')?'🎬':'🎙️'}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:500 }}>{item.name}</div>
                  <div style={{ fontSize:11, color:'var(--text3)' }}>{fmtSize(item.size)}</div>
                  {item.status==='error'&&<div style={{ fontSize:11, color:'var(--danger)', marginTop:2 }}>{item.text}</div>}
                </div>
                <div style={{ fontSize:11, fontWeight:500, color:statusColor[item.status] }}>
                  {item.status==='processing' ? (
                    <span style={{ display:'inline-flex', alignItems:'center', gap:5 }}>
                      <span style={{ display:'inline-block', width:10, height:10, borderRadius:'50%', border:'2px solid var(--amber)', borderTopColor:'transparent', animation:'spin 0.8s linear infinite' }}></span>
                      Transcribiendo...
                    </span>
                  ) : statusLabel[item.status]}
                </div>
                {item.status!=='processing'&&<button style={btnD} onClick={()=>removeQueue(item.id)}>✕</button>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Saved */}
      {items.length > 0 && (
        <div>
          <div style={{ fontSize:13, fontWeight:500, marginBottom:12 }}>Transcripciones guardadas — {items.length}</div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {items.map(item => {
              const displayText = mode==='timecodes' ? (item.textTC||item.text) : item.text
              return (
                <div key={item.id} style={card}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                    <div style={{ fontSize:16 }}>📄</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:500 }}>{item.name}</div>
                      <div style={{ fontSize:11, color:'var(--text3)' }}>{item.date}{item.duration?` · ${fmtDur(item.duration)}`:''}</div>
                    </div>
                    <button style={btnS} onClick={()=>copyText(item)}>Copiar</button>
                    <button style={btnS} onClick={()=>downloadText(item,'texto')}>↓ .txt</button>
                    {item.textTC&&<button style={btnS} onClick={()=>downloadText(item,'timecodes')}>↓ .txt TC</button>}
                    <button style={btnD} onClick={()=>removeItem(item.id)}>✕</button>
                  </div>
                  {mode==='timecodes' && item.textTC ? (
                    <div style={{ background:'var(--bg2)', borderRadius:8, padding:'10px 12px', fontSize:12, color:'var(--text)', lineHeight:2, maxHeight:280, overflowY:'auto', fontFamily:"'DM Mono',monospace" }}>
                      {item.textTC.split('\n').map((line,i) => {
                        const match = line.match(/^(\[\d+:\d+(?::\d+)?\])(.*)/)
                        return match ? (
                          <div key={i} style={{ display:'flex', gap:10, padding:'2px 0', borderBottom:'0.5px solid var(--border)' }}>
                            <span style={{ color:'var(--green-dark)', fontWeight:500, flexShrink:0, minWidth:60 }}>{match[1]}</span>
                            <span style={{ color:'var(--text)' }}>{match[2]}</span>
                          </div>
                        ) : <div key={i}>{line}</div>
                      })}
                    </div>
                  ) : (
                    <div style={{ background:'var(--bg2)', borderRadius:8, padding:'10px 12px', fontSize:13, color:'var(--text)', lineHeight:1.7, maxHeight:200, overflowY:'auto', whiteSpace:'pre-wrap' }}>
                      {displayText}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {items.length===0 && queue.length===0 && (
        <div style={{ textAlign:'center', color:'var(--text3)', fontSize:13, padding:40 }}>
          Sube tus audios o videos para transcribirlos con Whisper AI
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}



const PANELS = [
  { id:'dashboard', label:'Dashboard', group:'General' },
  { id:'misemana', label:'Mi Semana', group:'General' },
  { id:'script', label:'Guión', group:'Preproducción' },
  { id:'breakdown', label:'Breakdown', group:'Preproducción' },
  { id:'storyboard', label:'Storyboard', group:'Preproducción' },
  { id:'gantt', label:'Timeline / Gantt', group:'Producción' },
  { id:'calendar', label:'Cronograma', group:'Producción' },
  { id:'budget', label:'Presupuesto', group:'Finanzas', adminOnly:true },
  { id:'tracking', label:'Seguimiento', group:'Equipo' },
  { id:'notas', label:'Notas del equipo', group:'Equipo' },
  { id:'files', label:'Archivos', group:'Equipo' },
  { id:'transcripcion', label:'Transcripción', group:'Herramientas' },
]

export default function App() {
  const [theme, setTheme] = useTheme()
  const [user, setUser] = useState(null)
  const [active, setActive] = useState('dashboard')
  const { data: projects, insert: insertProject, remove: deleteProject } = useSupabaseTable('projects', 'projects', seedProjects)
  const { data: tasks } = useSupabaseTable('tasks', 'tracking_tasks', seedTasks)
  const [currentProject, setCurrentProject] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [newProj, setNewProj] = useState({ name:'', director:'', duration:'', color:'' })

  useEffect(() => { const saved = localStorage.getItem('combo_user'); if(saved) try { setUser(JSON.parse(saved)) } catch {} }, [])
  const login = u => { setUser(u); localStorage.setItem('combo_user', JSON.stringify(u)) }
  const logout = () => { setUser(null); localStorage.removeItem('combo_user') }

  if (!user) return <LoginScreen onLogin={login} />

  const visiblePanels = PANELS.filter(p => {
    if (p.adminOnly && user.role!=='admin') return false
    if (p.id==='misemana' && user.role!=='admin') return false
    return true
  })
  const groups = [...new Set(visiblePanels.map(p=>p.group))]
  const createProject = async () => { if(!newProj.name.trim()) return; await insertProject({ name:newProj.name, director:newProj.director, duration:newProj.duration, progress:0, color:newProj.color||'' }); setNewProj({name:'',director:'',duration:'',color:''}); setShowModal(false) }

  const proj = projects[currentProject]
  const projectKey = proj ? proj.name.toLowerCase().replace(/[^a-z0-9]/g,'_').slice(0,30) : `proj_${currentProject}`

  const renderPanel = () => {
    switch(active) {
      case 'dashboard': return <Dashboard projects={projects} tasks={tasks} deleteProject={deleteProject} />
      case 'misemana': return <MiSemanaPanel user={user} />
      case 'script': return <ScriptPanel projectKey={projectKey} />
      case 'breakdown': return <BreakdownPanel projectKey={projectKey} />
      case 'storyboard': return <StoryboardPanel projectKey={projectKey} />
      case 'gantt': return <GanttPanel projects={projects} projectKey={projectKey} />
      case 'calendar': return <CalendarPanel projectKey={projectKey} />
      case 'budget': return user.role==='admin'?<BudgetPanel projectKey={projectKey} />:<div style={{ padding:40, textAlign:'center', color:'var(--text3)' }}>Sin acceso</div>
      case 'tracking': return <TrackingPanel projectKey={projectKey} />
      case 'notas': return <NotasPanel user={user} projects={projects} projectKey={projectKey} />
      case 'files': return <FilesPanel projectKey={projectKey} />
      case 'transcripcion': return <TranscripcionPanel projectKey={projectKey} />
      default: return null
    }
  }

  const current = visiblePanels.find(p=>p.id===active)
  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'var(--bg2)' }}>
      <div style={{ width:220, minWidth:220, background:'var(--bg)', borderRight:'0.5px solid var(--border)', display:'flex', flexDirection:'column', overflow:'hidden' }} className="no-print">
        <div style={{ padding:'16px 14px', borderBottom:'0.5px solid var(--border)' }}>
          <img src="/logo.png" alt="ComboApp" style={{ height:44, maxWidth:180, objectFit:'contain' }} onError={e=>{e.target.style.display='none';e.target.nextSibling.style.display='block'}} /><div style={{ fontSize:16, fontWeight:600, letterSpacing:'-0.5px', display:'none' }}>Combo<span style={{ color:'var(--green)' }}>App</span></div>
          <div style={{ marginTop:10 }}>
            <div style={{ fontSize:10, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:4 }}>Proyecto activo</div>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background: getProjectColor(projects[currentProject]?.name, projects), flexShrink:0 }}></div>
              <select style={{ flex:1, padding:'6px 8px', fontSize:12, borderRadius:8, border:'0.5px solid var(--border2)', background:'var(--bg2)', color:'var(--text)', cursor:'pointer' }} value={currentProject} onChange={e=>{setCurrentProject(Number(e.target.value));setActive('dashboard')}}>
                {projects.map((p,i)=><option key={p.id||i} value={i}>{p.name}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div style={{ padding:8, flex:1, overflowY:'auto' }}>
          {groups.map(group=>(
            <React.Fragment key={group}>
              <div style={{ fontSize:10, fontWeight:500, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.7px', padding:'10px 8px 4px' }}>{group}</div>
              {visiblePanels.filter(p=>p.group===group).map(p=>(
                <div key={p.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 8px', borderRadius:8, cursor:'pointer', fontSize:13, color:active===p.id?'var(--green-dark)':'var(--text2)', background:active===p.id?'var(--green-light)':'transparent', fontWeight:active===p.id?500:400, transition:'all 0.12s' }} onClick={()=>setActive(p.id)}>
                  {p.label}
                  {p.adminOnly&&<span style={{ fontSize:9, background:'var(--amber-light)', color:'var(--amber)', padding:'1px 5px', borderRadius:4, marginLeft:'auto' }}>admin</span>}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
        <div style={{ padding:'10px 14px', borderTop:'0.5px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontSize:12, color:'var(--text2)' }}>{user.name}</div>
          <button style={btnD} onClick={logout}>Salir</button>
        </div>
      </div>
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ padding:'0 20px', height:52, borderBottom:'0.5px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--bg)' }} className="no-print">
          <div style={{ fontSize:14, fontWeight:500 }}>{current?.label}</div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <div style={{ fontSize:12, color:'var(--text3)', marginRight:4 }}>{projects[currentProject]?.name}</div>
            <button style={btnS} onClick={()=>setShowModal(true)}>+ Proyecto</button>
            <button onClick={()=>setTheme(t=>t==='light'?'dark':'light')} style={{ padding:'6px 10px', fontSize:14, borderRadius:8, border:'0.5px solid var(--border2)', background:'transparent', color:'var(--text2)', cursor:'pointer' }}>
              {theme==='light'?'🌙':'☀️'}
            </button>
          </div>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:20 }}>{renderPanel()}</div>
      </div>
      <Modal open={showModal} onClose={()=>setShowModal(false)} title="Nuevo proyecto">
        {[['name','Nombre del proyecto'],['director','Director / responsable'],['duration','Duración (ej: 8 semanas)']].map(([k,ph])=>(
          <div key={k} style={{ marginBottom:8 }}><input style={iStyle} value={newProj[k]} onChange={e=>setNewProj(p=>({...p,[k]:e.target.value}))} placeholder={ph} /></div>
        ))}
        <div style={{ marginBottom:8 }}>
          <label style={{ fontSize:11, color:'var(--text2)', display:'block', marginBottom:6 }}>Color del proyecto</label>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {PROJECT_COLOR_PALETTE.map(c=>(
              <div key={c} onClick={()=>setNewProj(p=>({...p,color:c}))}
                style={{ width:28, height:28, borderRadius:'50%', background:c, cursor:'pointer', border: newProj.color===c ? '3px solid var(--text)' : '3px solid transparent', transition:'transform 0.1s', transform: newProj.color===c?'scale(1.2)':'scale(1)' }} />
            ))}
          </div>
          {newProj.color && <div style={{ fontSize:11, color:'var(--text3)', marginTop:6, display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:12, height:12, borderRadius:'50%', background:newProj.color }}></div>
            Color seleccionado
          </div>}
        </div>
        <div style={{ display:'flex', gap:8, marginTop:12, justifyContent:'flex-end' }}>
          <button style={btnS} onClick={()=>setShowModal(false)}>Cancelar</button>
          <button style={btnP} onClick={createProject}>Crear</button>
        </div>
      </Modal>
    </div>
  )
}
