import { app, BrowserWindow } from 'electron'
import { ChildProcessWithoutNullStreams, exec, spawn } from 'child_process'
import fs from 'fs'
import { join } from 'path'
import server from './server'

function createWindow() {
  const options: Electron.BrowserWindowConstructorOptions = {
    width: 600,
    height: 400,
    show: false,
    frame: false,
  }
  const win = new BrowserWindow(options)
  ffmpeg()
  setTimeout(() => {
    win.loadFile(`public/index.html`)
    win.show()
  }, 5000)
}

app.whenReady().then(createWindow)
let killTarget: ChildProcessWithoutNullStreams
function ffmpeg() {
  const ffmpegPath = join(app.getPath('userData'), 'ffmpegPath')
  const execCmdPath = join(app.getPath('userData'), 'execCmd')
  const logPath = join(app.getPath('userData'), 'log')
  console.log('get path')
  if (fs.existsSync(execCmdPath)) {
    console.log('has fuke')
    const cmd = fs.readFileSync(execCmdPath).toString()
    const ffmpegLocation = fs.readFileSync(ffmpegPath).toString()
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
const cleanup = () => {
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