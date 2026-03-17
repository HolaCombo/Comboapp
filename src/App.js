import React, { useState, useEffect, useCallback, useRef } from 'react'

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
const fmt = n => '$' + Math.round(n).toLocaleString('es-MX')
const ARTIST_COLORS = ['#1D9E75','#185FA5','#854F0B','#993556','#3B6D11','#533AB7']
const ALL_ARTISTS = ['Enrique','Rubén','Cris','Tam','Laura','Carlos']
const PROJECT_COLORS = { 'Cortometraje Urbano':'#1D9E75', 'Serie Animada S1':'#185FA5', 'Spot Publicitario':'#854F0B' }

const seedProjects = [
  { id:1, name:'Cortometraje Urbano', director:'Ana Luisa', duration:'8 semanas', progress:65 },
  { id:2, name:'Serie Animada S1', director:'Carlos M.', duration:'16 semanas', progress:30 },
  { id:3, name:'Spot Publicitario', director:'Laura T.', duration:'3 semanas', progress:85 },
]
const seedGantt = [
  { id:1, task:'Guión definitivo', start:'2025-01-06', end:'2025-01-20', assignee:'Ana Luisa', status:'done', project:'Cortometraje Urbano' },
  { id:2, task:'Storyboard completo', start:'2025-01-15', end:'2025-01-28', assignee:'Carlos M.', status:'active', project:'Cortometraje Urbano' },
  { id:3, task:'Animatic ep.1', start:'2025-01-20', end:'2025-02-05', assignee:'Carlos', status:'active', project:'Serie Animada S1' },
  { id:4, task:'Rodaje spot', start:'2025-01-08', end:'2025-01-20', assignee:'Equipo', status:'done', project:'Spot Publicitario' },
  { id:5, task:'Animación personajes', start:'2025-02-10', end:'2025-03-01', assignee:'Laura', status:'pending', project:'Cortometraje Urbano' },
  { id:6, task:'Color grading', start:'2025-01-22', end:'2025-01-30', assignee:'Laura', status:'active', project:'Spot Publicitario' },
]
const seedBudget = [
  { id:1, section:'Preproducción', concept:'Guión y desarrollo', days:10, unitario:1500, iva:0.16 },
  { id:2, section:'Preproducción', concept:'Storyboard / Animatic', days:8, unitario:1200, iva:0.16 },
  { id:3, section:'Producción', concept:'Equipo técnico', days:15, unitario:3000, iva:0.16 },
  { id:4, section:'Producción', concept:'Locaciones', days:3, unitario:4000, iva:0 },
  { id:5, section:'Postproducción', concept:'Edición y color', days:10, unitario:2000, iva:0.16 },
  { id:6, section:'Postproducción', concept:'Musicalización', days:5, unitario:1500, iva:0.16 },
]
const seedBreakdown = [
  { id:1, numEscena:'1', secuencia:'Sec 1', inF:0, outF:61, frames:61, fps:8, timecode:'00:00:07:05', personajes:'Abuelo, Cloe', desglosArte:'Fondo interior, ventana luz', desglosAnim:'Abuelo actitud serena, Cloe loop', layout:'', rough:'2', clean:'2', color:'', composite:'', artista:'Enrique', animador:'Rubén', dias:2, estatus:'aprobado', comentarios:'Cloe actitud juguetona' },
  { id:2, numEscena:'2', secuencia:'Sec 1', inF:61, outF:107, frames:46, fps:8, timecode:'00:00:05:06', personajes:'Abuelo', desglosArte:'Fondo exterior calle', desglosAnim:'Abuelo con caja', layout:'', rough:'3', clean:'1', color:'', composite:'', artista:'Enrique', animador:'Cris', dias:1, estatus:'revision', comentarios:'' },
  { id:3, numEscena:'3', secuencia:'Sec 1', inF:107, outF:312, frames:205, fps:8, timecode:'00:00:25:05', personajes:'Abuelo, Cloe, Grillo', desglosArte:'Ondas sonido', desglosAnim:'Grillo entra, reacción Cloe', layout:'', rough:'5', clean:'2', color:'', composite:'', artista:'Enrique', animador:'Rubén', dias:5, estatus:'pendiente', comentarios:'Falta ajustar grillo' },
]
const seedTasks = [
  { id:1, name:'Animatic episodio 2', project:'Serie Animada S1', assignee:'Carlos M.', done:false, week:'semana 3', files:[] },
  { id:2, name:'Storyboard escena 1-5', project:'Cortometraje Urbano', assignee:'Ana L.', done:true, week:'semana 2', files:[] },
  { id:3, name:'Rigging personaje principal', project:'Serie Animada S1', assignee:'Laura T.', done:false, week:'semana 3', files:[] },
]
const seedPanels = [
  { id:1, img:null, desc:'Valentina despierta sobresaltada.', duration:'3s' },
  { id:2, img:null, desc:'Close-up del reloj marcando las 8:00.', duration:'2s' },
]

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

function Dashboard({ projects, tasks }) {
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
            <div style={{ fontSize:13, fontWeight:500, marginBottom:4 }}>{p.name}</div>
            <div style={{ fontSize:11, color:'var(--text3)', marginBottom:10 }}>{p.director} · {p.duration}</div>
            <div style={{ height:4, background:'var(--bg3)', borderRadius:2, overflow:'hidden' }}><div style={{ height:'100%', width:p.progress+'%', background:'var(--green)', borderRadius:2 }}></div></div>
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

function ScriptPanel() {
  const [lines, setLines] = useLS('script_lines', [
    { type:'scene', text:'INT. DEPARTAMENTO - DÍA' },
    { type:'action', text:'El sol entra por las persianas. VALENTINA (28) despierta sobresaltada.' },
    { type:'character', text:'VALENTINA' },
    { type:'parenthetical', text:'(murmurando)' },
    { type:'dialogue', text:'¿Las ocho? No puede ser.' },
  ])
  const typeStyles = { scene:{ fontWeight:'bold', textTransform:'uppercase', marginTop:16, fontFamily:"'DM Mono',monospace" }, action:{ marginTop:4 }, character:{ textAlign:'center', fontWeight:'bold', marginTop:12 }, dialogue:{ margin:'0 80px' }, parenthetical:{ margin:'0 100px', fontStyle:'italic', color:'var(--text2)' } }
  const add = type => setLines(l=>[...l,{type,text:''}])
  const update = (i,text) => setLines(l=>l.map((x,idx)=>idx===i?{...x,text}:x))
  const remove = i => setLines(l=>l.filter((_,idx)=>idx!==i))
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:16 }}>
        {[['Título','Cortometraje Urbano'],['Autor','Ana Luisa'],['Formato','Cortometraje']].map(([f,v])=>(
          <div key={f}><label style={{ fontSize:11, color:'var(--text2)', display:'block', marginBottom:3 }}>{f}</label><input style={iStyle} defaultValue={v} /></div>
        ))}
      </div>
      <div style={{ ...card, fontFamily:"'DM Mono',monospace", fontSize:13, lineHeight:2, padding:24 }}>
        {lines.map((line,i)=>(
          <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start', ...typeStyles[line.type] }}>
            <div style={{ flex:1 }}>
              <textarea value={line.text} onChange={e=>update(i,e.target.value)} style={{ width:'100%', border:'none', background:'transparent', resize:'none', fontFamily:'inherit', fontSize:'inherit', color:'var(--text)', outline:'none', lineHeight:'inherit', ...typeStyles[line.type] }} rows={1} onInput={e=>{e.target.style.height='auto';e.target.style.height=e.target.scrollHeight+'px'}} />
            </div>
            <button onClick={()=>remove(i)} style={{ ...btnD, marginTop:4 }}>✕</button>
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

function BreakdownPanel() {
  const [rows, setRows] = useLS('breakdown_rows', seedBreakdown)
  const [mode, setMode] = useState('arte')
  const artistColor = name => { const idx = ALL_ARTISTS.indexOf(name); return ARTIST_COLORS[idx>=0?idx:0] }
  const update = (id,key,val) => setRows(r=>r.map(x=>x.id===id?{...x,[key]:val}:x))
  const addRow = () => setRows(r=>[...r,{ id:Date.now(), numEscena:'', secuencia:'', inF:0, outF:0, frames:0, fps:8, timecode:'', personajes:'', desglosArte:'', desglosAnim:'', layout:'', rough:'', clean:'', color:'', composite:'', artista:'', animador:'', dias:0, estatus:'pendiente', comentarios:'' }])
  const remove = id => setRows(r=>r.filter(x=>x.id!==id))
  const arteColumns = [{ key:'numEscena', label:'Esc.', w:40 },{ key:'secuencia', label:'Secuencia', w:80 },{ key:'inF', label:'In', w:50 },{ key:'outF', label:'Out', w:50 },{ key:'frames', label:'Frames', w:60 },{ key:'timecode', label:'Timecode', w:100 },{ key:'personajes', label:'Personajes', w:130 },{ key:'desglosArte', label:'Desglose Arte', w:180 },{ key:'artista', label:'Artista', w:90 },{ key:'dias', label:'Días', w:50 },{ key:'estatus', label:'Estatus', w:100 },{ key:'comentarios', label:'Comentarios', w:180 }]
  const animColumns = [{ key:'numEscena', label:'Esc.', w:40 },{ key:'secuencia', label:'Secuencia', w:80 },{ key:'inF', label:'In', w:50 },{ key:'outF', label:'Out', w:50 },{ key:'frames', label:'Frames', w:60 },{ key:'fps', label:'FPS', w:45 },{ key:'timecode', label:'H:M:S:F', w:100 },{ key:'personajes', label:'Personajes', w:130 },{ key:'desglosAnim', label:'Desglose Animación', w:180 },{ key:'layout', label:'Layout', w:55 },{ key:'rough', label:'Rough', w:55 },{ key:'clean', label:'Clean', w:55 },{ key:'color', label:'Color', w:55 },{ key:'composite', label:'Comp.', w:55 },{ key:'animador', label:'Animador', w:90 },{ key:'dias', label:'Días', w:50 },{ key:'estatus', label:'Estatus', w:100 },{ key:'comentarios', label:'Comentarios', w:180 }]
  const cols = mode==='arte' ? arteColumns : animColumns
  return (
    <div>
      <div style={{ display:'flex', gap:8, marginBottom:16, alignItems:'center', flexWrap:'wrap' }}>
        {[['arte','Modo Arte'],['animacion','Modo Animación']].map(([m,label])=>(
          <button key={m} style={{ padding:'6px 16px', fontSize:12, borderRadius:20, border:'0.5px solid var(--border2)', background:mode===m?'var(--green)':'transparent', color:mode===m?'white':'var(--text2)', cursor:'pointer' }} onClick={()=>setMode(m)}>{label}</button>
        ))}
        <div style={{ marginLeft:'auto', display:'flex', gap:10, flexWrap:'wrap' }}>
          {ALL_ARTISTS.map((a,i)=>(
            <div key={a} style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'var(--text2)' }}>
              <div style={{ width:8, height:8, borderRadius:2, background:ARTIST_COLORS[i%ARTIST_COLORS.length], opacity:0.8 }}></div>{a}
            </div>
          ))}
        </div>
      </div>
      <div style={{ overflowX:'auto', border:'0.5px solid var(--border)', borderRadius:14 }}>
        <table style={{ borderCollapse:'collapse', fontSize:12, background:'var(--bg)' }}>
          <thead><tr>{cols.map(c=><th key={c.key} style={{ ...TH, width:c.w, minWidth:c.w }}>{c.label}</th>)}<th style={TH}></th></tr></thead>
          <tbody>
            {rows.map(row=>{
              const assignee = mode==='arte' ? row.artista : row.animador
              const color = assignee ? artistColor(assignee) : null
              const sColor = STATUS_COLORS[row.estatus]||'#888'
              return (
                <tr key={row.id} style={{ borderLeft: color?`3px solid ${color}55`:'3px solid transparent' }}>
                  {cols.map(c=>(
                    <td key={c.key} style={{ ...TD, width:c.w, minWidth:c.w }}>
                      {c.key==='estatus' ? <select value={row[c.key]} onChange={e=>update(row.id,c.key,e.target.value)} style={{ ...TDI, color:sColor, fontWeight:500, cursor:'pointer' }}>{['pendiente','revision','aprobado','rechazado'].map(s=><option key={s} value={s}>{s}</option>)}</select>
                      : c.key==='artista'||c.key==='animador' ? <select value={row[c.key]||''} onChange={e=>update(row.id,c.key,e.target.value)} style={{ ...TDI, color:row[c.key]?artistColor(row[c.key]):'var(--text3)', fontWeight:500, cursor:'pointer' }}><option value="">—</option>{ALL_ARTISTS.map(a=><option key={a} value={a}>{a}</option>)}</select>
                      : c.key==='comentarios'||c.key==='desglosArte'||c.key==='desglosAnim'||c.key==='personajes' ? <textarea value={row[c.key]||''} onChange={e=>update(row.id,c.key,e.target.value)} rows={1} style={{ ...TDI, resize:'none', lineHeight:1.4 }} onInput={e=>{e.target.style.height='auto';e.target.style.height=e.target.scrollHeight+'px'}} />
                      : <input value={row[c.key]||''} onChange={e=>update(row.id,c.key,e.target.value)} style={TDI} />}
                    </td>
                  ))}
                  <td style={TD}><button style={btnD} onClick={()=>remove(row.id)}>✕</button></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <button style={{ ...btnS, marginTop:12 }} onClick={addRow}>+ Agregar escena</button>
    </div>
  )
}

function StoryboardPanel() {
  const [panels, setPanels] = useLS('storyboard_panels', seedPanels)
  const add = () => setPanels(p=>[...p,{id:Date.now(),img:null,desc:'',duration:''}])
  const remove = id => setPanels(p=>p.filter(x=>x.id!==id))
  const update = (id,key,val) => setPanels(p=>p.map(x=>x.id===id?{...x,[key]:val}:x))
  const loadImg = (id,file) => { const r=new FileReader(); r.onload=e=>update(id,'img',e.target.result); r.readAsDataURL(file) }
  const downloadPDF = () => window.print()
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }} className="no-print">
        <button style={btnS} onClick={downloadPDF}>↓ Descargar PDF</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:16 }}>
        {panels.map((p,i)=>(
          <div key={p.id} style={{ background:'var(--bg)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
            <div style={{ fontSize:10, color:'var(--text3)', padding:'8px 12px 4px', display:'flex', justifyContent:'space-between' }}>
              <span>Panel {i+1}</span>
              <button style={{ ...btnD, fontSize:10 }} className="no-print" onClick={()=>remove(p.id)}>✕</button>
            </div>
            <div style={{ position:'relative', aspectRatio:'16/9', background:'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
              {p.img ? <img src={p.img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <div style={{ textAlign:'center', pointerEvents:'none' }}><div style={{ fontSize:22, color:'var(--text3)' }}>+</div><div style={{ fontSize:11, color:'var(--text3)' }}>Subir imagen</div></div>}
              <input type="file" accept="image/*" className="no-print" onChange={e=>e.target.files[0]&&loadImg(p.id,e.target.files[0])} style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer' }} />
            </div>
            <div style={{ padding:'8px 12px' }}>
              <textarea value={p.desc} onChange={e=>update(p.id,'desc',e.target.value)} placeholder="Descripción..." rows={2} style={{ width:'100%', border:'none', background:'transparent', resize:'none', fontSize:12, color:'var(--text2)', fontFamily:"'DM Sans',sans-serif", outline:'none', lineHeight:1.5 }} />
            </div>
            <div style={{ padding:'0 12px 10px' }}>
              <input value={p.duration} onChange={e=>update(p.id,'duration',e.target.value)} placeholder="Duración: 3s" style={{ ...TDI, fontSize:11, color:'var(--text3)', width:90 }} />
            </div>
          </div>
        ))}
        <button onClick={add} className="no-print" style={{ border:'1.5px dashed var(--border2)', background:'transparent', borderRadius:14, aspectRatio:'16/9', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text3)', fontSize:12 }}>+ Nuevo panel</button>
      </div>
    </div>
  )
}

function GanttPanel({ projects }) {
  const [rows, setRows] = useLS('gantt_rows', seedGantt)
  const [zoom, setZoom] = useState('week')
  const [showForm, setShowForm] = useState(false)
  const [newRow, setNewRow] = useState({ task:'', start:'', end:'', assignee:'', status:'pending', project:projects[0]?.name||'' })
  const addRow = () => { if(!newRow.task||!newRow.start||!newRow.end) return; setRows(r=>[...r,{...newRow,id:Date.now()}]); setShowForm(false) }
  const remove = id => setRows(r=>r.filter(x=>x.id!==id))
  const parseDate = s => { const [y,m,d]=s.split('-').map(Number); return new Date(y,m-1,d) }
  const addDays = (d,n) => { const r=new Date(d); r.setDate(r.getDate()+n); return r }
  const diffDays = (a,b) => Math.round((b-a)/86400000)
  const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  const STATUS_OP = { done:1, active:0.85, pending:0.55, blocked:0.4 }
  const validRows = rows.filter(r=>r.start&&r.end)
  if (!validRows.length) return <div style={{ padding:40, textAlign:'center', color:'var(--text3)', fontSize:13 }}>Sin tareas con fechas.<button style={{ ...btnS, marginLeft:12 }} onClick={()=>setShowForm(true)}>+ Agregar</button></div>
  const dates = validRows.flatMap(r=>[parseDate(r.start),parseDate(r.end)])
  let minD = new Date(Math.min(...dates)), maxD = new Date(Math.max(...dates))
  minD = addDays(minD,-7); maxD = addDays(maxD,14)
  const dow = minD.getDay(); minD = addDays(minD, dow===0?-6:1-dow)
  const CELL = zoom==='week'?32:100
  const cols = []
  if(zoom==='week'){let d=new Date(minD);while(d<=maxD){cols.push(new Date(d));d=addDays(d,7)}}
  else{let d=new Date(minD.getFullYear(),minD.getMonth(),1);while(d<=maxD){cols.push(new Date(d));d=new Date(d.getFullYear(),d.getMonth()+1,1)}}
  const totalW = cols.length*CELL
  const allProjects = [...new Set(validRows.map(r=>r.project||'General'))]
  return (
    <div>
      <div style={{ display:'flex', gap:8, marginBottom:14, alignItems:'center' }}>
        {[['week','Semana'],['month','Mes']].map(([z,label])=>(
          <button key={z} style={{ padding:'5px 14px', fontSize:12, borderRadius:20, border:'0.5px solid var(--border2)', background:zoom===z?'var(--green)':'transparent', color:zoom===z?'white':'var(--text2)', cursor:'pointer' }} onClick={()=>setZoom(z)}>{label}</button>
        ))}
        <button style={{ ...btnS, marginLeft:'auto' }} onClick={()=>setShowForm(v=>!v)}>+ Agregar tarea</button>
      </div>
      {showForm&&(
        <div style={{ ...card, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:16 }}>
          {[['task','Tarea'],['assignee','Responsable']].map(([k,l])=>(<div key={k}><label style={{ fontSize:11, color:'var(--text2)', display:'block', marginBottom:3 }}>{l}</label><input style={iStyle} value={newRow[k]} onChange={e=>setNewRow(r=>({...r,[k]:e.target.value}))} /></div>))}
          <div><label style={{ fontSize:11, color:'var(--text2)', display:'block', marginBottom:3 }}>Proyecto</label><select style={iStyle} value={newRow.project} onChange={e=>setNewRow(r=>({...r,project:e.target.value}))}>{projects.map(p=><option key={p.id} value={p.name}>{p.name}</option>)}</select></div>
          {[['start','Inicio'],['end','Fin']].map(([k,l])=>(<div key={k}><label style={{ fontSize:11, color:'var(--text2)', display:'block', marginBottom:3 }}>{l}</label><input type="date" style={iStyle} value={newRow[k]} onChange={e=>setNewRow(r=>({...r,[k]:e.target.value}))} /></div>))}
          <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}><button style={btnP} onClick={addRow}>Guardar</button><button style={btnS} onClick={()=>setShowForm(false)}>Cancelar</button></div>
        </div>
      )}
      <div style={{ display:'flex', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden', background:'var(--bg)' }}>
        <div style={{ width:190, minWidth:190, borderRight:'0.5px solid var(--border)', flexShrink:0 }}>
          <div style={{ height:36, background:'var(--bg3)', borderBottom:'0.5px solid var(--border)' }}></div>
          {allProjects.map(proj=>(
            <React.Fragment key={proj}>
              <div style={{ padding:'5px 12px', background:'var(--bg3)', borderBottom:'0.5px solid var(--border)', fontSize:11, fontWeight:500, color:'var(--text2)' }}>{proj}</div>
              {validRows.filter(r=>(r.project||'General')===proj).map(r=>(
                <div key={r.id} style={{ height:38, display:'flex', alignItems:'center', padding:'0 12px', borderBottom:'0.5px solid var(--border)', gap:8 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:PROJECT_COLORS[r.project]||'#888', flexShrink:0, opacity:STATUS_OP[r.status]||0.6 }}></div>
                  <div style={{ fontSize:12, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', flex:1 }}>{r.task}</div>
                  <button style={{ ...btnD, padding:'2px 5px', fontSize:10 }} onClick={()=>remove(r.id)}>✕</button>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
        <div style={{ flex:1, overflowX:'auto' }}>
          <div style={{ minWidth:totalW }}>
            <div style={{ height:36, display:'flex', background:'var(--bg3)', borderBottom:'0.5px solid var(--border)' }}>
              {cols.map((col,i)=><div key={i} style={{ width:CELL, minWidth:CELL, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'var(--text3)', borderRight:'0.5px solid var(--border)' }}>{zoom==='week'?`${col.getDate()} ${MONTHS[col.getMonth()]}`:MONTHS[col.getMonth()]+' '+col.getFullYear()}</div>)}
            </div>
            {allProjects.map(proj=>(
              <React.Fragment key={proj}>
                <div style={{ height:26, background:'var(--bg3)', borderBottom:'0.5px solid var(--border)', minWidth:totalW }}></div>
                {validRows.filter(r=>(r.project||'General')===proj).map(r=>{
                  const color = PROJECT_COLORS[r.project]||'#888'
                  const op = STATUS_OP[r.status]||0.6
                  const sD=parseDate(r.start), eD=parseDate(r.end)
                  const barL = zoom==='week'?(diffDays(minD,sD)/7)*CELL:((sD-minD)/(maxD-minD))*totalW
                  const barW = zoom==='week'?Math.max(CELL*0.8,(diffDays(sD,eD)/7)*CELL):Math.max(16,((eD-sD)/(maxD-minD))*totalW)
                  return (
                    <div key={r.id} style={{ height:38, position:'relative', borderBottom:'0.5px solid var(--border)', minWidth:totalW }}>
                      {cols.map((_,i)=><div key={i} style={{ position:'absolute', left:i*CELL, top:0, bottom:0, width:CELL, borderRight:'0.5px solid var(--border)', opacity:0.2 }}></div>)}
                      <div style={{ position:'absolute', left:barL, top:8, height:22, width:barW, background:color, opacity:op, borderRadius:6, display:'flex', alignItems:'center', padding:'0 8px', fontSize:10, fontWeight:500, color:'white', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', zIndex:2 }}>{r.task}</div>
                    </div>
                  )
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display:'flex', gap:12, marginTop:10, flexWrap:'wrap' }}>
        {Object.entries(PROJECT_COLORS).map(([proj,color])=>(<div key={proj} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'var(--text2)' }}><div style={{ width:10, height:10, borderRadius:2, background:color }}></div>{proj}</div>))}
        {[['Listo',1],['En curso',0.85],['Pendiente',0.55]].map(([l,op])=>(<div key={l} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'var(--text2)' }}><div style={{ width:10, height:10, borderRadius:2, background:'#888', opacity:op }}></div>{l}</div>))}
      </div>
    </div>
  )
}

function CalendarPanel() {
  const [events, setEvents] = useLS('cal_events', { '2025-01-05':'Guión','2025-01-10':'Reunión','2025-01-15':'Rodaje','2025-01-20':'Entrega','2025-01-25':'Revisión' })
  const [adding, setAdding] = useState(null)
  const [newEvt, setNewEvt] = useState('')
  const pad = d => String(d).padStart(2,'0')
  const keyFor = d => `2025-01-${pad(d)}`
  const firstDay = new Date(2025,0,1).getDay()
  const offset = firstDay===0?6:firstDay-1
  return (
    <div>
      <div style={{ fontSize:14, fontWeight:500, marginBottom:16 }}>Enero 2025 — Cronograma</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, marginBottom:6 }}>
        {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d=><div key={d} style={{ textAlign:'center', fontSize:11, color:'var(--text3)', padding:4 }}>{d}</div>)}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4 }}>
        {Array(offset).fill(null).map((_,i)=><div key={'e'+i}></div>)}
        {Array.from({length:31},(_,i)=>i+1).map(d=>{
          const key=keyFor(d); const evt=events[key]
          return <div key={d} onClick={()=>{setAdding(key);setNewEvt(evt||'')}} style={{ background:'var(--bg)', border:'0.5px solid var(--border)', borderRadius:10, minHeight:52, padding:6, cursor:'pointer' }}>
            <div style={{ fontSize:12 }}>{d}</div>
            {evt&&<div style={{ fontSize:9, background:'var(--green-light)', color:'var(--green-dark)', padding:'1px 4px', borderRadius:3, marginTop:2 }}>{evt}</div>}
          </div>
        })}
      </div>
      <Modal open={!!adding} onClose={()=>setAdding(null)} title={`Evento — ${adding}`}>
        <input style={iStyle} value={newEvt} onChange={e=>setNewEvt(e.target.value)} placeholder="Nombre del evento..." autoFocus />
        <div style={{ display:'flex', gap:8, marginTop:12, justifyContent:'flex-end' }}>
          <button style={btnS} onClick={()=>setAdding(null)}>Cancelar</button>
          {events[adding]&&<button style={{ ...btnS, color:'var(--danger)' }} onClick={()=>{setEvents(ev=>{const n={...ev};delete n[adding];return n});setAdding(null)}}>Eliminar</button>}
          <button style={btnP} onClick={()=>{if(newEvt.trim())setEvents(ev=>({...ev,[adding]:newEvt.trim()}));setAdding(null)}}>Guardar</button>
        </div>
      </Modal>
    </div>
  )
}

function BudgetPanel() {
  const [rows, setRows] = useLS('budget_rows', seedBudget)
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

function TrackingPanel() {
  const [tasks, setTasks] = useLS('tracking_tasks', seedTasks)
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState(null)
  const [newName, setNewName] = useState('')
  const [newAssignee, setNewAssignee] = useState('')
  const toggle = id => setTasks(t=>t.map(x=>x.id===id?{...x,done:!x.done}:x))
  const addTask = () => { if(!newName.trim()) return; setTasks(t=>[...t,{id:Date.now(),name:newName.trim(),project:'General',assignee:newAssignee||'Sin asignar',done:false,week:'hoy',files:[]}]); setNewName(''); setNewAssignee('') }
  const addFile = (taskId,file) => { const r=new FileReader(); r.onload=e=>setTasks(t=>t.map(x=>x.id===taskId?{...x,files:[...(x.files||[]),{id:Date.now(),name:file.name,type:file.type,size:file.size,src:e.target.result,date:new Date().toLocaleDateString('es-MX'),comment:''}]}:x)); r.readAsDataURL(file) }
  const updateComment = (taskId,fileId,comment) => setTasks(t=>t.map(x=>x.id===taskId?{...x,files:(x.files||[]).map(f=>f.id===fileId?{...f,comment}:f)}:x))
  const removeFile = (taskId,fileId) => setTasks(t=>t.map(x=>x.id===taskId?{...x,files:(x.files||[]).filter(f=>f.id!==fileId)}:x))
  const visible = tasks.filter(t=>filter==='all'||(filter==='pending'&&!t.done)||(filter==='done'&&t.done))
  return (
    <div>
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        {[['all','Todos'],['pending','Pendientes'],['done','Completados']].map(([k,l])=>(
          <button key={k} style={{ padding:'5px 14px', fontSize:12, borderRadius:20, border:'0.5px solid var(--border2)', background:filter===k?'var(--green)':'transparent', color:filter===k?'white':'var(--text2)', cursor:'pointer' }} onClick={()=>setFilter(k)}>{l}</button>
        ))}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {visible.map(t=>(
          <div key={t.id} style={{ background:'var(--bg)', border:'0.5px solid var(--border)', borderRadius:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 14px', cursor:'pointer' }} onClick={()=>setExpanded(expanded===t.id?null:t.id)}>
              <div onClick={e=>{e.stopPropagation();toggle(t.id)}} style={{ width:18, height:18, borderRadius:4, border:t.done?'none':'1.5px solid var(--border2)', background:t.done?'var(--green)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, color:'white', fontSize:11 }}>{t.done&&'✓'}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, textDecoration:t.done?'line-through':'none', color:t.done?'var(--text3)':'var(--text)' }}>{t.name}</div>
                <div style={{ fontSize:11, color:'var(--text3)' }}>{t.project} · {t.week}{t.files?.length>0?` · ${t.files.length} archivo${t.files.length>1?'s':''}`:''}</div>
              </div>
              <div style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:'var(--bg3)', color:'var(--text2)' }}>{t.assignee}</div>
              <div style={{ fontSize:11, color:'var(--text3)' }}>{expanded===t.id?'▲':'▼'}</div>
            </div>
            {expanded===t.id&&(
              <div style={{ borderTop:'0.5px solid var(--border)', padding:'12px 14px' }}>
                <div style={{ fontSize:11, fontWeight:500, color:'var(--text2)', marginBottom:10 }}>Historial de entregables</div>
                {(!t.files||t.files.length===0)&&<div style={{ fontSize:12, color:'var(--text3)', marginBottom:10 }}>Sin archivos adjuntos aún.</div>}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:10, marginBottom:12 }}>
                  {(t.files||[]).map(f=>{
                    const isImg=f.type?.startsWith('image/'), isVid=f.type?.startsWith('video/')
                    return (
                      <div key={f.id} style={{ background:'var(--bg2)', border:'0.5px solid var(--border)', borderRadius:10, overflow:'hidden' }}>
                        <div style={{ aspectRatio:'16/9', background:'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                          {isImg&&<img src={f.src} alt={f.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />}
                          {isVid&&<video src={f.src} style={{ width:'100%', height:'100%', objectFit:'cover' }} muted />}
                          {!isImg&&!isVid&&<div style={{ fontSize:24 }}>📄</div>}
                        </div>
                        <div style={{ padding:'8px 10px' }}>
                          <div style={{ fontSize:11, fontWeight:500, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{f.name}</div>
                          <div style={{ fontSize:10, color:'var(--text3)', marginBottom:4 }}>{f.date} · {(f.size/1024).toFixed(0)}KB</div>
                          <input style={{ ...iStyle, fontSize:11, padding:'4px 7px' }} value={f.comment||''} onChange={e=>updateComment(t.id,f.id,e.target.value)} placeholder="Comentario..." />
                          <button style={{ ...btnD, marginTop:4, fontSize:10 }} onClick={()=>removeFile(t.id,f.id)}>Eliminar</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div style={{ position:'relative', display:'inline-block' }}>
                  <button style={btnS}>+ Adjuntar archivo</button>
                  <input type="file" multiple accept="image/*,video/*,audio/*,.pdf,.zip" onChange={e=>Array.from(e.target.files).forEach(f=>addFile(t.id,f))} style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer' }} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:8, marginTop:16 }}>
        <input style={{ ...iStyle, flex:1, marginBottom:0 }} value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Nueva tarea..." onKeyDown={e=>e.key==='Enter'&&addTask()} />
        <input style={{ ...iStyle, width:140, marginBottom:0 }} value={newAssignee} onChange={e=>setNewAssignee(e.target.value)} placeholder="Responsable" />
        <button style={btnP} onClick={addTask}>Agregar</button>
      </div>
    </div>
  )
}

function FilesPanel() {
  const [files, setFiles] = useLS('project_files',[])
  const handleUpload = e => { Array.from(e.target.files).forEach(file=>{ const r=new FileReader(); r.onload=ev=>setFiles(f=>[...f,{id:Date.now()+Math.random(),name:file.name,type:file.type,size:file.size,src:ev.target.result,comment:'',date:new Date().toLocaleDateString('es-MX')}]); r.readAsDataURL(file) }) }
  const updateComment = (id,comment) => setFiles(f=>f.map(x=>x.id===id?{...x,comment}:x))
  const remove = id => setFiles(f=>f.filter(x=>x.id!==id))
  return (
    <div>
      <div style={{ border:'1.5px dashed var(--border2)', borderRadius:14, padding:30, textAlign:'center', background:'var(--bg2)', position:'relative', marginBottom:20, cursor:'pointer' }}>
        <div style={{ fontSize:13, color:'var(--text2)', marginBottom:4 }}>Arrastra archivos aquí o haz clic</div>
        <div style={{ fontSize:12, color:'var(--text3)' }}>Video, imagen, audio — para revisión</div>
        <input type="file" multiple accept="image/*,video/*,audio/*" onChange={handleUpload} style={{ position:'absolute', inset:0, opacity:0, cursor:'pointer' }} />
      </div>
      {files.length===0&&<div style={{ textAlign:'center', color:'var(--text3)', fontSize:13, padding:40 }}>Sin archivos aún</div>}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))', gap:12 }}>
        {files.map(f=>{ const isImg=f.type.startsWith('image/'), isVid=f.type.startsWith('video/')
          return <div key={f.id} style={{ background:'var(--bg)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
            <div style={{ aspectRatio:'16/9', background:'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
              {isImg&&<img src={f.src} alt={f.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />}
              {isVid&&<video src={f.src} style={{ width:'100%', height:'100%', objectFit:'cover' }} muted />}
              {!isImg&&!isVid&&<div style={{ fontSize:28 }}>🎵</div>}
            </div>
            <div style={{ padding:'8px 10px' }}>
              <div style={{ fontSize:11, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{f.name}</div>
              <div style={{ fontSize:10, color:'var(--text3)', marginTop:1 }}>{f.date} · {(f.size/1024).toFixed(0)}KB</div>
              <input style={{ ...iStyle, marginTop:6, fontSize:11, padding:'4px 7px' }} value={f.comment} onChange={e=>updateComment(f.id,e.target.value)} placeholder="Comentario..." />
              <button style={{ ...btnD, marginTop:6 }} onClick={()=>remove(f.id)}>Eliminar</button>
            </div>
          </div>
        })}
      </div>
    </div>
  )
}

const PANELS = [
  { id:'dashboard', label:'Dashboard', group:'General' },
  { id:'script', label:'Guión', group:'Preproducción' },
  { id:'breakdown', label:'Breakdown', group:'Preproducción' },
  { id:'storyboard', label:'Storyboard', group:'Preproducción' },
  { id:'gantt', label:'Timeline / Gantt', group:'Producción' },
  { id:'calendar', label:'Cronograma', group:'Producción' },
  { id:'budget', label:'Presupuesto', group:'Finanzas', adminOnly:true },
  { id:'tracking', label:'Seguimiento', group:'Equipo' },
  { id:'files', label:'Archivos', group:'Equipo' },
]

export default function App() {
  const [theme, setTheme] = useTheme()
  const [user, setUser] = useState(null)
  const [active, setActive] = useState('dashboard')
  const [projects, setProjects] = useLS('projects', seedProjects)
  const [tasks] = useLS('tracking_tasks', seedTasks)
  const [currentProject, setCurrentProject] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [newProj, setNewProj] = useState({ name:'', director:'', duration:'' })

  useEffect(() => { const saved = localStorage.getItem('combo_user'); if(saved) try { setUser(JSON.parse(saved)) } catch {} }, [])
  const login = u => { setUser(u); localStorage.setItem('combo_user', JSON.stringify(u)) }
  const logout = () => { setUser(null); localStorage.removeItem('combo_user') }

  if (!user) return <LoginScreen onLogin={login} />

  const visiblePanels = PANELS.filter(p => !p.adminOnly || user.role==='admin')
  const groups = [...new Set(visiblePanels.map(p=>p.group))]
  const createProject = () => { if(!newProj.name.trim()) return; setProjects(p=>[...p,{id:Date.now(),name:newProj.name,director:newProj.director,duration:newProj.duration,progress:0}]); setNewProj({name:'',director:'',duration:''}); setShowModal(false) }
  const renderPanel = () => {
    switch(active) {
      case 'dashboard': return <Dashboard projects={projects} tasks={tasks} />
      case 'script': return <ScriptPanel />
      case 'breakdown': return <BreakdownPanel />
      case 'storyboard': return <StoryboardPanel />
      case 'gantt': return <GanttPanel projects={projects} />
      case 'calendar': return <CalendarPanel />
      case 'budget': return user.role==='admin'?<BudgetPanel />:<div style={{ padding:40, textAlign:'center', color:'var(--text3)' }}>Sin acceso</div>
      case 'tracking': return <TrackingPanel />
      case 'files': return <FilesPanel />
      default: return null
    }
  }
  const current = visiblePanels.find(p=>p.id===active)
  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'var(--bg2)' }}>
      <div style={{ width:220, minWidth:220, background:'var(--bg)', borderRight:'0.5px solid var(--border)', display:'flex', flexDirection:'column', overflow:'hidden' }} className="no-print">
        <div style={{ padding:'16px 14px', borderBottom:'0.5px solid var(--border)' }}>
          <div style={{ fontSize:16, fontWeight:600, letterSpacing:'-0.5px' }}>Combo<span style={{ color:'var(--green)' }}>App</span></div>
          <div style={{ marginTop:10 }}>
            <div style={{ fontSize:10, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:4 }}>Proyecto activo</div>
            <select style={{ width:'100%', padding:'6px 8px', fontSize:12, borderRadius:8, border:'0.5px solid var(--border2)', background:'var(--bg2)', color:'var(--text)', cursor:'pointer' }} value={currentProject} onChange={e=>setCurrentProject(Number(e.target.value))}>
              {projects.map((p,i)=><option key={p.id} value={i}>{p.name}</option>)}
            </select>
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
            <button onClick={()=>setTheme(t=>t==='light'?'dark':'light')} style={{ padding:'6px 10px', fontSize:14, borderRadius:8, border:'0.5px solid var(--border2)', background:'transparent', color:'var(--text2)', cursor:'pointer' }} title="Cambiar tema">
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
        <div style={{ display:'flex', gap:8, marginTop:12, justifyContent:'flex-end' }}>
          <button style={btnS} onClick={()=>setShowModal(false)}>Cancelar</button>
          <button style={btnP} onClick={createProject}>Crear</button>
        </div>
      </Modal>
    </div>
  )
}
