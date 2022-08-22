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
  if (fs.existsSync(execCmdPath)) {
    const cmd = fs.readFileSync(execCmdPath).toString()
    const ffmpegLocation = fs.readFileSync(ffmpegPath).toString()
    /*
    const execReturn = exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`)
        ffmpeg()
        return
      }
      console.log(`stdout: ${stdout}`)
      console.error(`stderr: ${stderr}`)
    })
    */
    const argstring = cmd
    const args = argstring.split(' ')
    killTarget = spawn(ffmpegLocation, args, { detached: true })
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
ffmpeg()
const hostname = '127.0.0.1'
const port = 8000
server.listen(port, hostname)
