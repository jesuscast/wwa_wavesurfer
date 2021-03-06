/*! videojs-record v1.5.2
 * https://github.com/collab-project/videojs-record
 * Copyright (c) 2014-2017 - Licensed MIT */
!function (a, b) {
    "function" == typeof define && define.amd ? define(["videojs"], b) : "object" == typeof module && module.exports ? module.exports = b(require("video.js")) : a.returnExports = b(a.videojs)
}(this, function (a) {
    a.RecorderjsEngine = a.extend(a.RecordBase, {
        setup: function (a, b, c) {
            this.inputStream = a, this.mediaType = b, this.debug = c, this.audioContext = new AudioContext, this.audioSourceNode = this.audioContext.createMediaStreamSource(this.inputStream), this.engine = new Recorder(this.audioSourceNode, {
                bufferLen: this.bufferSize,
                numChannels: this.audioChannels
            })
        }, start: function () {
            this.engine.record()
        }, stop: function () {
            this.engine.stop(), this.engine.exportWAV(this.onStopRecording.bind(this)), this.engine.clear()
        }
    })
});