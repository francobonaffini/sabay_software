import 'dotenv/config'
import { buildApp } from './app.js'

const PORT = process.env.PORT || 3000

const app = buildApp()

app.listen(PORT, () => {
    console.log(`[PJN-Automator] Server corriendo en puerto ${PORT} (${process.env.NODE_ENV ?? 'development'})`)
})