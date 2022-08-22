# ffmpeg convert and stream by Electron

I made this software to watch IP Camera RTSP stream, so the internal name of this app is `ipcam`

config 

In `app.getPath('userData')`(Windows: `C:\Users\users\AppData\Roaming\ipcam`) directory

write plain text each below file: on Windows...

ffmpegPath: `C:\Users\users\ffmpeg.exe` executable ffmpeg path  
execCmd: `-fflags nobuffer -rtsp_transport tcp -i rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4 -vsync 0 -copyts -vcodec copy -movflags frag_keyframe+empty_moov -an -hls_flags delete_segments+append_list -f segment -segment_list_flags live -segment_time 0.5 -segment_list_size 1 -segment_format mpegts -segment_list C:\Users\users\AppData\Roaming\ipcam\stream\index.m3u8 -segment_list_type m3u8 -segment_list_entry_prefix stream/ C:\Users\users\AppData\Roaming\ipcam\stream\stream\%3d.ts` args of ffmpeg (**if you use this args, check `stream/stream` folders undeer `C:\Users\users\AppData\Roaming\ipcam`**) 
publicPath: `C:\Users\users\AppData\Roaming\ipcam`  the same as `app.getPath('userData')`  

## Dev

`yarn start`

## Notice

* It takes 5secs until BrowserWindow appears.
* If you install Nginx, you stream to your internal network or the Internet with HLS.
* This app does **not** automatically delete generated HLS chunks.