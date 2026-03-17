# ComboApp — Production Studio

Herramienta de gestión para proyectos de diseño y animación.

## Módulos
- Guión cinematográfico
- Breakdown por escenas
- Storyboard (con carga de imágenes)
- Diagrama de Gantt
- Cronograma / Calendario
- Presupuesto con totales automáticos
- Seguimiento de avances del equipo
- Archivos para revisión (video, foto, audio)

## Cómo subir a Vercel

1. Sube este repositorio a GitHub
2. Ve a vercel.com → New Project → importa el repo
3. En "Environment Variables" agrega:
   - REACT_APP_SUPABASE_URL
   - REACT_APP_SUPABASE_ANON_KEY
4. Clic en Deploy

## Cómo configurar Supabase

1. Ve a supabase.com → New Project
2. Copia la URL y la Anon Key del panel Settings → API
3. Pégalas en Vercel como variables de entorno
