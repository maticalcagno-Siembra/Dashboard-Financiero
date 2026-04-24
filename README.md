# 📊 MarketPulse — Guía de instalación en 10 minutos

## Qué necesitás antes de empezar
- Una cuenta en **GitHub** (gratis) → github.com
- Una cuenta en **Vercel** (gratis) → vercel.com  
- Una **API key de Anthropic** → console.anthropic.com

---

## PASO 1 — Crear API Key de Anthropic

1. Entrá a https://console.anthropic.com
2. Menú izquierdo → **"API Keys"**
3. Click en **"Create Key"** → poné un nombre (ej: "marketpulse")
4. **Copiá y guardá ese código** (empieza con `sk-ant-...`) — lo vas a necesitar en el Paso 4

> 💡 Costo estimado: ~$0.10 por consulta. Con 2 consultas/día = ~$6/mes.

---

## PASO 2 — Subir el proyecto a GitHub

1. Entrá a https://github.com y logueate
2. Click en **"New repository"** (botón verde arriba a la derecha)
3. Nombre: `marketpulse` → **Create repository**
4. En la página que aparece, hacé click en **"uploading an existing file"**
5. Arrastrá **toda la carpeta `marketpulse`** o los archivos uno por uno:
   - `package.json`
   - `pages/index.js`
   - `pages/api/market.js`
6. Click en **"Commit changes"** (botón verde abajo)

---

## PASO 3 — Deployar en Vercel

1. Entrá a https://vercel.com y logueate **con tu cuenta de GitHub**
2. Click en **"Add New Project"**
3. Buscá tu repositorio `marketpulse` → click **"Import"**
4. En la configuración que aparece, dejá todo como está → click **"Deploy"**
5. Vercel va a compilar el proyecto (1-2 minutos)

---

## PASO 4 — Cargar la API Key (IMPORTANTE)

1. Una vez deployado, en Vercel entrá a tu proyecto
2. Menú superior → **"Settings"**
3. Sidebar izquierdo → **"Environment Variables"**
4. Completá:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** pegá tu key (`sk-ant-...`)
5. Click **"Save"**
6. Volvé a **"Deployments"** → click en los 3 puntitos → **"Redeploy"**

---

## PASO 5 — Acceder desde cualquier dispositivo

1. Vercel te da una URL del tipo: `https://marketpulse-xxxx.vercel.app`
2. Esa URL funciona en **celular, tablet, notebook — sin instalar nada**
3. Podés guardar el link como acceso directo en tu home del celular:
   - **iPhone:** Safari → compartir → "Agregar a pantalla de inicio"
   - **Android:** Chrome → menú (3 puntitos) → "Agregar a pantalla de inicio"

---

## ¿Necesitás ayuda?

Pasale este README a ChatGPT o Claude y decile:
"Ayudame a seguir estos pasos para deployar en Vercel"
