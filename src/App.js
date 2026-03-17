import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  app: { display:'flex', height:'100vh', overflow:'hidden', background:'var(--bg2)' },
  sidebar: { width:220, minWidth:220, background:'var(--bg)', borderRight:'0.5px solid var(--border)', display:'flex', flexDirection:'column', overflow:'hidden' },
  sidebarHeader: { padding:'16px 14px', borderBottom:'0.5px solid var(--border)' },
  logo: { fontSize:16, fontWeight:600, letterSpacing:'-0.5px', color:'var(--text)' },
  logoAccent: { color:'var(--green)' },
  projectWrap: { marginTop:10 },
  projectLabel: { fontSize:10, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:4 },
  projectSelect: { width:'100%', padding:'6px 8px', fontSize:12, borderRadius:'var(--radius)', border:'0.5px solid var(--border2)', background:'var(--bg2)', color:'var(--text)', cursor:'pointer' },
  nav: { padding:8, flex:1, overflowY:'auto' },
  navSection: { fontSize:10, fontWeight:500, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.7px', padding:'10px 8px 4px', marginTop:4 },
  navItem: (active) => ({ display:'flex', alignItems:'center', gap:8, padding:'7px 8px', borderRadius:'var(--radius)', cursor:'pointer', fontSize:13, color: active ? 'var(--green-dark)' : 'var(--text2)', background: active ? 'var(--green-light)' : 'transparent', fontWeight: active ? 500 : 400, transition:'all 0.12s' }),
  main: { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' },
  topbar: { padding:'0 20px', height:52, borderBottom:'0.5px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--bg)' },
  topbarTitle: { fontSize:14, fontWeight:500 },
  topbarActions: { display:'flex', gap:8, alignItems:'center' },
  content: { flex:1, overflowY:'auto', padding:20 },
  btn: { padding:'7px 14px', fontSize:12, borderRadius:'var(--radius)', border:'0.5px solid var(--border2)', background:'transparent', color:'var(--text)', cursor:'pointer' },
  btnPrimary: { padding:'7px 14px', fontSize:12, borderRadius:'var(--radius)', border:'none', background:'var(--green)', color:'white', cursor:'pointer', fontWeight:500 },
  btnDanger: { padding:'4px 8px', fontSize:11, borderRadius:'var(--radius)', border:'0.5px solid var(--border)', background:'transparent', color:'var(--text3)', cursor:'pointer' },
  card: { background:'var(--bg)', border:'0.5px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'14px 16px', marginBottom:12 },
  statGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 },
  statCard: { background:'var(--bg3)', borderRadius:'var(--radius)', padding:'14px', },
  statLabel: { fontSize:11, color:'var(--text3)', marginBottom:4 },
  statValue: { fontSize:22, fontWeight:500 },
  sectionTitle: { fontSize:13, fontWeight:500, marginBottom:12, marginTop:4 },
  row: { display:'flex', gap:12, alignItems:'center' },
  col: { display:'flex', flexDirection:'column', gap:8 },
  input: { padding:'7px 10px', fontSize:13, borderRadius:'var(--radius)', border:'0.5px solid var(--border2)', background:'var(--bg2)', color:'var(--text)', width:'100%', outline:'none' },
  label: { fontSize:11, color:'var(--text2)', marginBottom:3, display:'block' },
  tag: (color) => ({ display:'inline-block', padding:'3px 10px', borderRadius:20, fontSize:11, margin:2, background: color+'22', color: color, cursor:'pointer' }),
  badge: (color) => ({ display:'inline-block', padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:500, background: color+'22', color: color }),
  modal: { position:'fixed', inset:0, background:'rgba(0,0,0,0.35)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center' },
  modalBox: { background:'var(--bg)', borderRadius:'var(--radius-lg)', padding:22, width:360, border:'0.5px solid var(--border2)' },
  table: { width:'100%', borderCollapse:'collapse', fontSize:13 },
  th: { background:'var(--bg3)', padding:'9px 12px', textAlign:'left', fontWeight:500, color:'var(--text2)', borderBottom:'0.5px solid var(--border)', fontSize:11 },
  td: { padding:'8px 12px', borderBottom:'0.5px solid var(--border)', color:'var(--text)', verticalAlign:'middle' },
  tdInput: { border:'none', background:'transparent', color:'var(--text)', fontFamily:"'DM Sans',sans-serif", fontSize:13, width:'100%', outline:'none', padding:0 },
}

// ─── Seed data ─────────────────────────────────────────────────────────────────
const seedProjects = [
  { id:1, name:'Cortometraje Urbano', director:'Ana Luisa', duration:'8 semanas', progress:65 },
  { id:2, name:'Serie Animada S1', director:'Carlos M.', duration:'16 semanas', progress:30 },
  { id:3, name:'Spot Publicitario', director:'Laura T.', duration:'3 semanas', progress:85 },
]
const seedTasks = [
  { id:1, name:'Animatic episodio 2', project:'Serie Animada S1', assignee:'Carlos M.', done:false, week:'semana 3' },
  { id:2, name:'Storyboard escena 1-5', project:'Cortometraje Urbano', assignee:'Ana L.', done:true, week:'semana 2' },
  { id:3, name:'Rigging personaje principal', project:'Serie Animada S1', assignee:'Laura T.', done:false, week:'semana 3' },
  { id:4, name:'Revisión color grading', project:'Spot Publicitario', assignee:'Equipo', done:false, week:'hoy' },
  { id:5, name:'Guión revisión final', project:'Cortometraje Urbano', assignee:'Ana L.', done:true, week:'semana 1' },
]
const seedBudget = [
  { id:1, section:'Preproducción', concept:'Guión y desarrollo', plan:15000, real:14500 },
  { id:2, section:'Preproducción', concept:'Storyboard / Animatic', plan:8000, real:7200 },
  { id:3, section:'Producción', concept:'Equipo técnico', plan:45000, real:48000 },
  { id:4, section:'Producción', concept:'Locaciones y permisos', plan:12000, real:0 },
  { id:5, section:'Postproducción', concept:'Edición y color', plan:20000, real:0 },
  { id:6, section:'Postproducción', concept:'Musicalización y mezcla', plan:10000, real:0 },
]
const seedGantt = [
  { id:1, task:'Guión definitivo', start:'2025-01-06', end:'2025-01-20', assignee:'Ana Luisa', status:'done' },
  { id:2, task:'Storyboard completo', start:'2025-01-15', end:'2025-01-28', assignee:'Carlos M.', status:'active' },
  { id:3, task:'Rodaje Escena 1-3', start:'2025-02-03', end:'2025-02-07', assignee:'Equipo completo', status:'pending' },
  { id:4, task:'Animación personajes', start:'2025-02-10', end:'2025-03-01', assignee:'Laura T.', status:'pending' },
]
const seedPanels = [
  { id:1, img:null, desc:'Valentina despierta sobresaltada en su departamento.', duration:'3s' },
  { id:2, img:null, desc:'Close-up del reloj marcando las 8:00.', duration:'2s' },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_COLORS = { done:'#1D9E75', active:'#185FA5', pending:'#854F0B', blocked:'#A32D2D' }
const STATUS_LABELS = { done:'Listo', active:'En curso', pending:'Pendiente', blocked:'Bloqueado' }
const fmt = (n) => '$' + Math.round(n).toLocaleString('es-MX')

function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial }
    catch { return initial }
  })
  const set = useCallback((v) => {
    setVal(prev => {
      const next = typeof v === 'function' ? v(prev) : v
      localStorage.setItem(key, JSON.stringify(next))
      return next
    })
  }, [key])
  return [val, set]
}

// ─── Components ───────────────────────────────────────────────────────────────

function Dashboard({ projects, tasks, files }) {
  const pending = tasks.filter(t => !t.done).length
  const totalPlan = seedBudget.reduce((a,b) => a+b.plan, 0)
  const totalReal = seedBudget.reduce((a,b) => a+b.real, 0)
  const pct = Math.round((totalReal/totalPlan)*100)
  return (
    <div>
      <div style={s.statGrid}>
        <div style={s.statCard}><div style={s.statLabel}>Proyectos activos</div><div style={s.statValue}>{projects.length}</div></div>
        <div style={s.statCard}><div style={s.statLabel}>Tareas pendientes</div><div style={s.statValue}>{pending}</div></div>
        <div style={s.statCard}><div style={s.statLabel}>Presupuesto usado</div><div style={s.statValue}>{pct}%</div></div>
        <div style={s.statCard}><div style={s.statLabel}>Archivos subidos</div><div style={s.statValue}>{files.length}</div></div>
      </div>
      <div style={s.sectionTitle}>Proyectos</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12, marginBottom:20 }}>
        {projects.map(p => (
          <div key={p.id} style={{ ...s.card, cursor:'pointer', marginBottom:0 }}>
            <div style={{ fontSize:13, fontWeight:500, marginBottom:4 }}>{p.name}</div>
            <div style={{ fontSize:11, color:'var(--text3)', marginBottom:10 }}>{p.director} · {p.duration}</div>
            <div style={{ height:4, background:'var(--bg3)', borderRadius:2, overflow:'hidden' }}>
              <div style={{ height:'100%', width:p.progress+'%', background:'var(--green)', borderRadius:2 }}></div>
            </div>
            <div style={{ fontSize:11, color:'var(--text2)', marginTop:4 }}>{p.progress}% completado</div>
          </div>
        ))}
      </div>
      <div style={s.sectionTitle}>Pendientes hoy</div>
      {tasks.filter(t=>!t.done).slice(0,4).map(t => (
        <div key={t.id} style={{ ...s.card, display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
          <div style={{ width:16, height:16, borderRadius:4, border:'1.5px solid var(--border2)', flexShrink:0 }}></div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13 }}>{t.name}</div>
            <div style={{ fontSize:11, color:'var(--text3)' }}>{t.project} · {t.week}</div>
          </div>
          <div style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:'var(--bg3)', color:'var(--text2)' }}>{t.assignee}</div>
        </div>
      ))}
    </div>
  )
}

function ScriptPanel() {
  const [lines, setLines] = useLocalStorage('script_lines', [
    { type:'scene', text:'INT. DEPARTAMENTO - DÍA' },
    { type:'action', text:'El sol entra por las persianas. VALENTINA (28) despierta sobresaltada. Mira el reloj.' },
    { type:'character', text:'VALENTINA' },
    { type:'parenthetical', text:'(murmurando)' },
    { type:'dialogue', text:'¿Las ocho? No puede ser.' },
    { type:'scene', text:'EXT. CALLE PRINCIPAL - CONTINUO' },
    { type:'action', text:'Valentina sale corriendo del edificio. La ciudad ya está en pleno movimiento.' },
  ])
  const typeStyles = {
    scene: { fontWeight:'bold', textTransform:'uppercase', margin:'16px 0 4px', fontFamily:"'DM Mono',monospace" },
    action: { margin:'4px 0' },
    character: { textAlign:'center', fontWeight:'bold', margin:'12px 0 0' },
    dialogue: { margin:'0 80px' },
    parenthetical: { margin:'0 100px', fontStyle:'italic', color:'var(--text2)' },
  }
  const addLine = (type) => setLines(l => [...l, { type, text:'' }])
  const updateLine = (i, text) => setLines(l => l.map((line,idx) => idx===i ? {...line,text} : line))
  const removeLine = (i) => setLines(l => l.filter((_,idx) => idx!==i))
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:16 }}>
        {['Título','Autor','Formato'].map(f => (
          <div key={f}><label style={s.label}>{f}</label><input style={s.input} defaultValue={f==='Título'?'Cortometraje Urbano':f==='Autor'?'Ana Luisa García':'Cortometraje'} /></div>
        ))}
      </div>
      <div style={{ ...s.card, fontFamily:"'DM Mono',monospace", fontSize:13, lineHeight:2, padding:24 }}>
        {lines.map((line,i) => (
          <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start', ...typeStyles[line.type] }}>
            <div style={{ flex:1, ...typeStyles[line.type] }}>
              <textarea
                value={line.text}
                onChange={e => updateLine(i, e.target.value)}
                style={{ width:'100%', border:'none', background:'transparent', resize:'none', fontFamily:'inherit', fontSize:'inherit', color:'var(--text)', outline:'none', lineHeight:'inherit', ...typeStyles[line.type] }}
                rows={1}
                onInput={e => { e.target.style.height='auto'; e.target.style.height=e.target.scrollHeight+'px' }}
              />
            </div>
            <button onClick={() => removeLine(i)} style={{ ...s.btnDanger, opacity:0.4, marginTop:4 }}>✕</button>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap' }}>
        {[['Escena','scene'],['Acción','action'],['Personaje','character'],['Diálogo','dialogue'],['Paréntesis','parenthetical']].map(([label,type]) => (
          <button key={type} style={s.btn} onClick={() => addLine(type)}>+ {label}</button>
        ))}
      </div>
    </div>
  )
}

function BreakdownPanel() {
  const [cast, setCast] = useLocalStorage('breakdown_cast', ['Valentina','Marco'])
  const [locs, setLocs] = useLocalStorage('breakdown_locs', ['Departamento 3B'])
  const [props, setProps] = useLocalStorage('breakdown_props', ['Reloj despertador','Vaso de agua'])
  const [vfx, setVfx] = useLocalStorage('breakdown_vfx', ['Luz solar anamórfica'])
  const groups = [
    { label:'Elenco', items:cast, set:setCast, color:'#1D9E75' },
    { label:'Locaciones', items:locs, set:setLocs, color:'#185FA5' },
    { label:'Props', items:props, set:setProps, color:'#854F0B' },
    { label:'VFX / Notas', items:vfx, set:setVfx, color:'#993556' },
  ]
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
      {groups.map(({ label, items, set, color }) => {
        let inputRef = null
        return (
          <div key={label} style={s.card}>
            <div style={{ fontSize:12, fontWeight:500, color:'var(--text2)', marginBottom:10 }}>{label}</div>
            <div>
              {items.map((item,i) => (
                <span key={i} style={s.tag(color)} onClick={() => set(arr => arr.filter((_,idx)=>idx!==i))}>{item} ✕</span>
              ))}
            </div>
            <div style={{ display:'flex', gap:6, marginTop:10 }}>
              <input style={{ ...s.input, flex:1 }} placeholder={`Agregar ${label.toLowerCase()}...`} ref={el => inputRef=el}
                onKeyDown={e => { if(e.key==='Enter' && e.target.value.trim()) { set(arr=>[...arr,e.target.value.trim()]); e.target.value='' } }} />
              <button style={s.btn} onClick={() => { if(inputRef?.value.trim()) { set(arr=>[...arr,inputRef.value.trim()]); inputRef.value='' } }}>+</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function StoryboardPanel() {
  const [panels, setPanels] = useLocalStorage('storyboard_panels', seedPanels)
  const addPanel = () => setPanels(p => [...p, { id:Date.now(), img:null, desc:'', duration:'' }])
  const removePanel = (id) => setPanels(p => p.filter(x=>x.id!==id))
  const updatePanel = (id, key, val) => setPanels(p => p.map(x=>x.id===id?{...x,[key]:val}:x))
  const loadImg = (id, file) => {
    const reader = new FileReader()
    reader.onload = e => updatePanel(id, 'img', e.target.result)
    reader.readAsDataURL(file)
  }
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:16 }}>
      {panels.map((p,i) => (
        <div key={p.id} style={{ ...s.card, padding:0, overflow:'hidden', marginBottom:0 }}>
          <div style={{ fontSize:10, color:'var(--text3)', padding:'8px 12px 4px' }}>Panel {i+1}</div>
          <div style={{ position:'relative', aspectRatio:'16/9', background:'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
            {p.img ? <img src={p.img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> :
              <div style={{ textAlign:'center', pointerEvents:'none' }}>
                <div style={{ fontSize:22, marginBottom:4 }}>+</div>
                <div style={{ fontSize:11, color:'var(--text3)' }}>Subir imagen</div>
              </div>
            }
            <input type="file" accept="image/*" onChange={e=>e.target.files[0]&&loadImg(p.id,e.target.files[0])}
              style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer' }} />
          </div>
          <div style={{ padding:'8px 12px' }}>
            <textarea value={p.desc} onChange={e=>updatePanel(p.id,'desc',e.target.value)}
              placeholder="Descripción..." rows={2}
              style={{ width:'100%', border:'none', background:'transparent', resize:'none', fontSize:12, color:'var(--text2)', fontFamily:"'DM Sans',sans-serif", outline:'none', lineHeight:1.5 }} />
          </div>
          <div style={{ padding:'0 12px 10px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <input value={p.duration} onChange={e=>updatePanel(p.id,'duration',e.target.value)} placeholder="Duración: 3s"
              style={{ ...s.tdInput, fontSize:11, color:'var(--text3)', width:90 }} />
            <button onClick={()=>removePanel(p.id)} style={s.btnDanger}>✕</button>
          </div>
        </div>
      ))}
      <button onClick={addPanel} style={{ border:'1.5px dashed var(--border2)', background:'transparent', borderRadius:'var(--radius-lg)', aspectRatio:'16/9', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text3)', fontSize:12, gap:6 }}>
        + Nuevo panel
      </button>
    </div>
  )
}

function GanttPanel() {
  const [rows, setRows] = useLocalStorage('gantt_rows', seedGantt)
  const addRow = () => setRows(r => [...r, { id:Date.now(), task:'', start:'', end:'', assignee:'', status:'pending' }])
  const update = (id, key, val) => setRows(r => r.map(x=>x.id===id?{...x,[key]:val}:x))
  const remove = (id) => setRows(r => r.filter(x=>x.id!==id))
  return (
    <div>
      <div style={{ overflowX:'auto' }}>
        <table style={s.table}>
          <thead>
            <tr>
              {['Tarea','Inicio','Fin','Responsable','Estado',''].map((h,i) => (
                <th key={i} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id}>
                <td style={s.td}><input style={s.tdInput} value={row.task} onChange={e=>update(row.id,'task',e.target.value)} placeholder="Tarea..." /></td>
                <td style={s.td}><input type="date" style={s.tdInput} value={row.start} onChange={e=>update(row.id,'start',e.target.value)} /></td>
                <td style={s.td}><input type="date" style={s.tdInput} value={row.end} onChange={e=>update(row.id,'end',e.target.value)} /></td>
                <td style={s.td}><input style={s.tdInput} value={row.assignee} onChange={e=>update(row.id,'assignee',e.target.value)} placeholder="Responsable" /></td>
                <td style={s.td}>
                  <select value={row.status} onChange={e=>update(row.id,'status',e.target.value)}
                    style={{ ...s.tdInput, cursor:'pointer' }}>
                    {Object.entries(STATUS_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </td>
                <td style={s.td}>
                  <span style={s.badge(STATUS_COLORS[row.status])}>{STATUS_LABELS[row.status]}</span>
                </td>
                <td style={s.td}><button style={s.btnDanger} onClick={()=>remove(row.id)}>✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button style={{ ...s.btn, marginTop:12 }} onClick={addRow}>+ Agregar tarea</button>
    </div>
  )
}

function CalendarPanel() {
  const [events, setEvents] = useLocalStorage('cal_events', {
    '2025-01-05':'Guión','2025-01-10':'Reunión','2025-01-15':'Rodaje','2025-01-20':'Entrega','2025-01-25':'Revisión'
  })
  const [adding, setAdding] = useState(null)
  const [newEvt, setNewEvt] = useState('')
  const year=2025, month=0
  const firstDay = new Date(year,month,1).getDay()
  const offset = firstDay===0?6:firstDay-1
  const days = new Date(year,month+1,0).getDate()
  const pad = d => String(d).padStart(2,'0')
  const keyFor = d => `${year}-${pad(month+1)}-${pad(d)}`
  const today = new Date()
  return (
    <div>
      <div style={{ fontSize:14, fontWeight:500, marginBottom:16 }}>Enero 2025 — Cronograma de producción</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, marginBottom:6 }}>
        {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d => (
          <div key={d} style={{ textAlign:'center', fontSize:11, color:'var(--text3)', padding:'4px' }}>{d}</div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4 }}>
        {Array(offset).fill(null).map((_,i) => <div key={'e'+i}></div>)}
        {Array.from({length:days},(_,i)=>i+1).map(d => {
          const key = keyFor(d)
          const evt = events[key]
          const isToday = today.getDate()===d && today.getMonth()===month && today.getFullYear()===year
          return (
            <div key={d} onClick={()=>setAdding(key)}
              style={{ background:'var(--bg)', border:`0.5px solid ${isToday?'var(--green)':'var(--border)'}`, borderRadius:'var(--radius)', minHeight:52, padding:'6px 6px 4px', cursor:'pointer' }}>
              <div style={{ fontSize:12, fontWeight: isToday?500:400, color: isToday?'var(--green)':'var(--text)' }}>{d}</div>
              {evt && <div style={{ fontSize:9, background:'var(--green-light)', color:'var(--green-dark)', padding:'1px 4px', borderRadius:3, marginTop:2 }}>{evt}</div>}
            </div>
          )
        })}
      </div>
      {adding && (
        <div style={s.modal} onClick={()=>setAdding(null)}>
          <div style={s.modalBox} onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:14, fontWeight:500, marginBottom:12 }}>Evento — {adding}</div>
            <input style={s.input} value={newEvt} onChange={e=>setNewEvt(e.target.value)} placeholder="Nombre del evento..." autoFocus />
            <div style={{ display:'flex', gap:8, marginTop:12, justifyContent:'flex-end' }}>
              <button style={s.btn} onClick={()=>setAdding(null)}>Cancelar</button>
              {events[adding] && <button style={{ ...s.btn, color:'#A32D2D' }} onClick={()=>{ setEvents(ev=>{const n={...ev};delete n[adding];return n}); setAdding(null) }}>Eliminar</button>}
              <button style={s.btnPrimary} onClick={()=>{ if(newEvt.trim()) setEvents(ev=>({...ev,[adding]:newEvt.trim()})); setNewEvt(''); setAdding(null) }}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function BudgetPanel() {
  const [rows, setRows] = useLocalStorage('budget_rows', seedBudget)
  const update = (id,key,val) => setRows(r=>r.map(x=>x.id===id?{...x,[key]:parseFloat(val)||0}:x))
  const updateConcept = (id,val) => setRows(r=>r.map(x=>x.id===id?{...x,concept:val}:x))
  const remove = (id) => setRows(r=>r.filter(x=>x.id!==id))
  const addRow = () => setRows(r=>[...r,{id:Date.now(),section:'General',concept:'',plan:0,real:0}])
  const totalPlan = rows.reduce((a,b)=>a+b.plan,0)
  const totalReal = rows.reduce((a,b)=>a+b.real,0)
  const sections = [...new Set(rows.map(r=>r.section))]
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
        <div style={s.statCard}><div style={s.statLabel}>Presupuesto total</div><div style={s.statValue}>{fmt(totalPlan)}</div></div>
        <div style={s.statCard}><div style={s.statLabel}>Gastado</div><div style={s.statValue}>{fmt(totalReal)}</div></div>
        <div style={s.statCard}><div style={s.statLabel}>Disponible</div><div style={{ ...s.statValue, color: totalPlan-totalReal>=0?'var(--green)':'#A32D2D' }}>{fmt(totalPlan-totalReal)}</div></div>
      </div>
      <div style={{ ...s.card, padding:0, overflow:'hidden' }}>
        <table style={s.table}>
          <thead><tr>
            <th style={{...s.th,width:'45%'}}>Concepto</th>
            <th style={{...s.th,textAlign:'right'}}>Presupuestado</th>
            <th style={{...s.th,textAlign:'right'}}>Real</th>
            <th style={{...s.th,textAlign:'right'}}>Diferencia</th>
            <th style={{...s.th,width:30}}></th>
          </tr></thead>
          <tbody>
            {sections.map(sec => (
              <React.Fragment key={sec}>
                <tr><td colSpan={5} style={{...s.td,background:'var(--bg3)',fontWeight:500,fontSize:11,color:'var(--text2)'}}>{sec}</td></tr>
                {rows.filter(r=>r.section===sec).map(row => {
                  const diff = row.plan - row.real
                  return (
                    <tr key={row.id}>
                      <td style={s.td}><input style={s.tdInput} value={row.concept} onChange={e=>updateConcept(row.id,e.target.value)} /></td>
                      <td style={{...s.td,textAlign:'right'}}><input type="number" style={{...s.tdInput,textAlign:'right'}} value={row.plan} onChange={e=>update(row.id,'plan',e.target.value)} /></td>
                      <td style={{...s.td,textAlign:'right'}}><input type="number" style={{...s.tdInput,textAlign:'right'}} value={row.real} onChange={e=>update(row.id,'real',e.target.value)} /></td>
                      <td style={{...s.td,textAlign:'right',color:diff>=0?'var(--green)':'#A32D2D',fontWeight:500}}>
                        {diff>=0?'+':''}{fmt(diff)}
                      </td>
                      <td style={s.td}><button style={s.btnDanger} onClick={()=>remove(row.id)}>✕</button></td>
                    </tr>
                  )
                })}
              </React.Fragment>
            ))}
            <tr>
              <td style={{...s.td,fontWeight:500,borderTop:'1.5px solid var(--border2)'}}>Total</td>
              <td style={{...s.td,textAlign:'right',fontWeight:500,borderTop:'1.5px solid var(--border2)'}}>{fmt(totalPlan)}</td>
              <td style={{...s.td,textAlign:'right',fontWeight:500,borderTop:'1.5px solid var(--border2)'}}>{fmt(totalReal)}</td>
              <td style={{...s.td,textAlign:'right',fontWeight:500,borderTop:'1.5px solid var(--border2)',color:totalPlan-totalReal>=0?'var(--green)':'#A32D2D'}}>
                {totalPlan-totalReal>=0?'+':''}{fmt(totalPlan-totalReal)}
              </td>
              <td style={{...s.td,borderTop:'1.5px solid var(--border2)'}}></td>
            </tr>
          </tbody>
        </table>
      </div>
      <button style={{...s.btn,marginTop:12}} onClick={addRow}>+ Agregar línea</button>
    </div>
  )
}

function TrackingPanel() {
  const [tasks, setTasks] = useLocalStorage('tracking_tasks', seedTasks)
  const [filter, setFilter] = useState('all')
  const [newName, setNewName] = useState('')
  const [newAssignee, setNewAssignee] = useState('')
  const toggle = (id) => setTasks(t=>t.map(x=>x.id===id?{...x,done:!x.done}:x))
  const addTask = () => {
    if(!newName.trim()) return
    setTasks(t=>[...t,{id:Date.now(),name:newName.trim(),project:'General',assignee:newAssignee||'Sin asignar',done:false,week:'hoy'}])
    setNewName(''); setNewAssignee('')
  }
  const visible = tasks.filter(t => filter==='all'||(filter==='pending'&&!t.done)||(filter==='done'&&t.done))
  return (
    <div>
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        {[['all','Todos'],['pending','Pendientes'],['done','Completados']].map(([k,label])=>(
          <button key={k} style={{ padding:'5px 14px', fontSize:12, borderRadius:20, border:'0.5px solid var(--border2)', background: filter===k?'var(--green)':'transparent', color: filter===k?'white':'var(--text2)', cursor:'pointer' }} onClick={()=>setFilter(k)}>{label}</button>
        ))}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {visible.map(t => (
          <div key={t.id} style={{ ...s.card, display:'flex', alignItems:'center', gap:12, padding:'11px 14px', marginBottom:0 }}>
            <div onClick={()=>toggle(t.id)} style={{ width:18, height:18, borderRadius:4, border: t.done?'none':'1.5px solid var(--border2)', background: t.done?'var(--green)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, color:'white', fontSize:11 }}>
              {t.done&&'✓'}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, textDecoration: t.done?'line-through':'none', color: t.done?'var(--text3)':'var(--text)' }}>{t.name}</div>
              <div style={{ fontSize:11, color:'var(--text3)' }}>{t.project} · {t.week}</div>
            </div>
            <div style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:'var(--bg3)', color:'var(--text2)' }}>{t.assignee}</div>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:8, marginTop:16 }}>
        <input style={{...s.input,flex:1}} value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Nueva tarea..." onKeyDown={e=>e.key==='Enter'&&addTask()} />
        <input style={{...s.input,width:140}} value={newAssignee} onChange={e=>setNewAssignee(e.target.value)} placeholder="Responsable" />
        <button style={s.btnPrimary} onClick={addTask}>Agregar</button>
      </div>
    </div>
  )
}

function FilesPanel() {
  const [files, setFiles] = useLocalStorage('uploaded_files', [])
  const handleUpload = (e) => {
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => {
        setFiles(f => [...f, { id:Date.now()+Math.random(), name:file.name, type:file.type, size:file.size, src:ev.target.result, comment:'' }])
      }
      reader.readAsDataURL(file)
    })
  }
  const updateComment = (id, comment) => setFiles(f=>f.map(x=>x.id===id?{...x,comment}:x))
  const remove = (id) => setFiles(f=>f.filter(x=>x.id!==id))
  return (
    <div>
      <div style={{ border:'1.5px dashed var(--border2)', borderRadius:'var(--radius-lg)', padding:30, textAlign:'center', background:'var(--bg2)', position:'relative', marginBottom:20, cursor:'pointer' }}>
        <div style={{ fontSize:13, color:'var(--text2)', marginBottom:4 }}>Arrastra archivos aquí o haz clic para seleccionar</div>
        <div style={{ fontSize:12, color:'var(--text3)' }}>Video, imagen, audio — para revisión del equipo</div>
        <input type="file" multiple accept="image/*,video/*,audio/*" onChange={handleUpload} style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer' }} />
      </div>
      {files.length===0 && <div style={{ textAlign:'center', color:'var(--text3)', fontSize:13, padding:40 }}>Aún no hay archivos subidos</div>}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))', gap:12 }}>
        {files.map(f => {
          const isImg = f.type.startsWith('image/')
          const isVid = f.type.startsWith('video/')
          return (
            <div key={f.id} style={{ ...s.card, padding:0, overflow:'hidden', marginBottom:0 }}>
              <div style={{ aspectRatio:'16/9', background:'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                {isImg && <img src={f.src} alt={f.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />}
                {isVid && <video src={f.src} style={{ width:'100%', height:'100%', objectFit:'cover' }} muted />}
                {!isImg&&!isVid && <div style={{ fontSize:28 }}>🎵</div>}
              </div>
              <div style={{ padding:'8px 10px' }}>
                <div style={{ fontSize:11, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{f.name}</div>
                <div style={{ fontSize:10, color:'var(--text3)', marginTop:1 }}>{(f.size/1024).toFixed(0)} KB</div>
                <input style={{ ...s.input, marginTop:6, fontSize:11, padding:'4px 7px' }} value={f.comment} onChange={e=>updateComment(f.id,e.target.value)} placeholder="Comentario de revisión..." />
                <button style={{ ...s.btnDanger, marginTop:6 }} onClick={()=>remove(f.id)}>Eliminar</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── App ───────────────────────────────────────────────────────────────────────
const PANELS = [
  { id:'dashboard', label:'Dashboard', group:'General' },
  { id:'script', label:'Guión', group:'Preproducción' },
  { id:'breakdown', label:'Breakdown', group:'Preproducción' },
  { id:'storyboard', label:'Storyboard', group:'Preproducción' },
  { id:'gantt', label:'Gantt', group:'Producción' },
  { id:'calendar', label:'Cronograma', group:'Producción' },
  { id:'budget', label:'Presupuesto', group:'Finanzas' },
  { id:'tracking', label:'Seguimiento', group:'Equipo' },
  { id:'files', label:'Archivos', group:'Equipo' },
]

export default function App() {
  const [active, setActive] = useState('dashboard')
  const [projects, setProjects] = useLocalStorage('projects', seedProjects)
  const [tasks] = useLocalStorage('tracking_tasks', seedTasks)
  const [files] = useLocalStorage('uploaded_files', [])
  const [currentProject, setCurrentProject] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [newProj, setNewProj] = useState({ name:'', director:'', duration:'' })

  const groups = [...new Set(PANELS.map(p=>p.group))]

  const createProject = () => {
    if (!newProj.name.trim()) return
    setProjects(p => [...p, { id:Date.now(), name:newProj.name, director:newProj.director, duration:newProj.duration, progress:0 }])
    setNewProj({ name:'', director:'', duration:'' })
    setShowModal(false)
  }

  const renderPanel = () => {
    switch(active) {
      case 'dashboard': return <Dashboard projects={projects} tasks={tasks} files={files} />
      case 'script': return <ScriptPanel />
      case 'breakdown': return <BreakdownPanel />
      case 'storyboard': return <StoryboardPanel />
      case 'gantt': return <GanttPanel />
      case 'calendar': return <CalendarPanel />
      case 'budget': return <BudgetPanel />
      case 'tracking': return <TrackingPanel />
      case 'files': return <FilesPanel />
      default: return null
    }
  }

  const current = PANELS.find(p=>p.id===active)

  return (
    <div style={s.app}>
      <div style={s.sidebar}>
        <div style={s.sidebarHeader}>
          <div style={s.logo}>Combo<span style={s.logoAccent}>App</span></div>
          <div style={s.projectWrap}>
            <div style={s.projectLabel}>Proyecto activo</div>
            <select style={s.projectSelect} value={currentProject} onChange={e=>setCurrentProject(Number(e.target.value))}>
              {projects.map((p,i) => <option key={p.id} value={i}>{p.name}</option>)}
            </select>
          </div>
        </div>
        <div style={s.nav}>
          {groups.map(group => (
            <React.Fragment key={group}>
              <div style={s.navSection}>{group}</div>
              {PANELS.filter(p=>p.group===group).map(p => (
                <div key={p.id} style={s.navItem(active===p.id)} onClick={()=>setActive(p.id)}>
                  {p.label}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={s.main}>
        <div style={s.topbar}>
          <div style={s.topbarTitle}>{current?.label}</div>
          <div style={s.topbarActions}>
            <div style={{ fontSize:12, color:'var(--text3)', marginRight:4 }}>{projects[currentProject]?.name}</div>
            <button style={s.btn} onClick={()=>setShowModal(true)}>+ Nuevo proyecto</button>
          </div>
        </div>
        <div style={s.content}>
          {renderPanel()}
        </div>
      </div>

      {showModal && (
        <div style={s.modal} onClick={()=>setShowModal(false)}>
          <div style={s.modalBox} onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:15, fontWeight:500, marginBottom:14 }}>Nuevo proyecto</div>
            {[['name','Nombre del proyecto'],['director','Director / responsable'],['duration','Duración (ej: 8 semanas)']].map(([k,ph])=>(
              <input key={k} style={{...s.input,marginBottom:8}} value={newProj[k]} onChange={e=>setNewProj(p=>({...p,[k]:e.target.value}))} placeholder={ph} />
            ))}
            <div style={{ display:'flex', gap:8, marginTop:12, justifyContent:'flex-end' }}>
              <button style={s.btn} onClick={()=>setShowModal(false)}>Cancelar</button>
              <button style={s.btnPrimary} onClick={createProject}>Crear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
