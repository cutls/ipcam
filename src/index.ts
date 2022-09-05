import { app, BrowserWindow, session } from 'electron'
import { ChildProcessWithoutNullStreams, exec, spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import server from './server'

async function createWindow() {
  await session.defaultSession.clearCache()
  const publicPath = path.join(app.getPath('userData'), 'publicPath')
  const dirPublic = fs.readFileSync(publicPath).toString()
  const root = path.resolve(dirPublic)
  const streamDir = path.join(root, 'stream', 'stream')
  fs.rmdirSync(streamDir, { recursive: true })
  fs.mkdirSync(streamDir)
  const options: Electron.BrowserWindowConstructorOptions = {
    width: 300,
    height: 200,
    show: false,
    frame: true
  }
  const win = new BrowserWindow(options)
  console.log('exec')
  ffmpeg()
  console.log('created window')
  setTimeout(() => {
    win.loadFile(`public/index.html`)
    win.show()
  }, 15000)
}

app.whenReady().then(createWindow)
let killTarget: ChildProcessWithoutNullStreams
function ffmpeg() {
  const ffmpegPath = path.join(app.getPath('userData'), 'ffmpegPath')
  const execCmdPath = path.join(app.getPath('userData'), 'execCmd')
  const logPath = path.join(app.getPath('userData'), 'log')
  console.log('get path')
  if (fs.existsSync(execCmdPath)) {
    console.log('has file')
    const cmd = fs.readFileSync(execCmdPath).toString()
    const ffmpegLocation = fs.readFileSync(ffmpegPath).toString()
    if (fs.existsSync(logPath)) fs.unlinkSync(logPath)
    const argstring = cmd
    const args = argstring.split(' ')
    console.log(ffmpegLocation, args)
    killTarget = spawn(ffmpegLocation, args, { detached: true })
    console.log('launched')
    killTarget.stdout.on('data', (data) => {
      console.log(data.toString())
      fs.appendFileSync(logPath, data.toString() + '!\n')
    })
    killTarget.stderr.on('data', (data) => {
      console.log(data.toString())
      fs.appendFileSync(logPath, data.toString() + '!\n')
    })
  } else {
    console.error(`No executable file! Check: ${execCmdPath}`)
  }
}
const cleanup = async () => {
  console.log('clean uped')
  killTarget.kill()
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
process.on('SIGQUIT', cleanup)
app.on('quit', cleanup)

const hostname = '127.0.0.1'
const port = 8000
if (isDev()) {
  server.listen(port, hostname)
}
function isDev() {
  return process.mainModule?.filename.indexOf('app.asar') === -1;
}