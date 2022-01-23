const delay =(time_ms) =>{
  return new Promise((resolve) => {
    setTimeout(resolve, time_ms);
  });
}


class FramesRenderer {
  constructor({canvas, config}) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.setCanvasSizes({width: config.codedWidth, height: config.codedHeight})

    this.config = config;

    this.isSupported = 'VideoEncoder' in window

    if (this.isSupported) {
      this.initialize()
    } else {
      this.showError()
    }
  }

  initialize() {
    this.frames = []
    this.underflow = true
    this.timeBase = 0

    this.decoder = new VideoDecoder({
      output: this.handleFrame.bind(this),
      error: console.error
    });

    this.decoder.configure(this.config);
  }

  showError() {
    const message = 'WebCodecs API is not supported.';
    this.ctx.font = '18px serif';
    this.ctx.fillText(message, 10, 50);
  }

  addFrames(list) {
    for (let i = 0; i < list.length; i++) {
      const item = list[i];

      const chunk = new EncodedVideoChunk({
        timestamp: item.timestamp * 1000,
        type: item.key ? 'key' : 'delta',
        data: new Uint8Array(item.buffer, 0)
      });

      this.decoder.decode(chunk);
    }
  }

  async flush() {
    await this.decoder.flush();
  }

  handleFrame(frame) {
    this.frames.push(frame);
    if (this.underflow) {
      setTimeout(() => this.renderFrame(), 0);
    }
  }

  async renderFrame() {
    if (this.frames.length == 0) {
      this.underflow = true;
      return;
    }

    const frame = this.frames.shift();
    this.underflow = false;

    // Based on the frame's timestamp calculate how much of real time waiting
    // is needed before showing the next frame.
    const timeout = this.calculateTimeTillNextFrame(frame.timestamp);
    await delay(timeout);
    this.ctx.drawImage(frame, 0, 0);
    frame.close();

    // Immediately schedule rendering of the next frame
    setTimeout(() => this.renderFrame(), 0);
  }

  setCanvasSizes({width, height}) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  calculateTimeTillNextFrame(timestamp) {
    if (!this.timeBase) {
      this.timeBase = performance.now();
    }

    const mediaTime = performance.now() - this.timeBase;
    return Math.max(0, (timestamp / 1000) - mediaTime);
  }
}
