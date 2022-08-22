import path, { join } from 'path'
import * as fs from 'fs'
import * as http from 'http'
import { app } from 'electron'

type Request = http.IncomingMessage | { url: string }
type Response = http.ServerResponse

const publicPath = join(app.getPath('userData'), 'publicPath')
const dirPublic = fs.readFileSync(publicPath).toString()
const indexFile = 'index.html'

const service = function (req: Request, res: Response) {
  const pathname = req.url
  if (!pathname) return
  const root = path.resolve(dirPublic)
  const file = path.join(root, pathname)

  fs.stat(file, (err, stat) => {
    if (err) {
      console.log("err", err)
      res.write("err")
      res.end()
      return
    }

    if (stat.isDirectory()) {
      service({ url: `${req.url}/${indexFile}` }, res)
    }

    if (stat.isFile()) {
      const stream = fs.createReadStream(file)
      stream.pipe(res)
    }
  });
};

const listener = function (req: Request, res: Response) {
  service(req, res)
};

export default http.createServer(listener)
