# WebCodecs API Playground

## Demo

https://olgadorio.github.io/WebCodecs-API-Playground/

## FramesRenderer
1. FramesRenderer receives video frames
2. FramesRenderer pushes frames to VideoDecoder
3. new frame is rendered on canvas

### Inspired by
https://web.dev/webcodecs

### ffmpeg command used to generate `.h264` files from `.mp4` file

```
ffmpeg -i original.h264 -f image2 -vcodec copy -bsf h264_mp4toannexb %d.h264
```
https://stackoverflow.com/questions/30384634/how-to-split-a-video-into-individual-encoded-frames

