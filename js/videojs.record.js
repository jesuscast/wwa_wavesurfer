/*! videojs-record v1.5.2
 * https://github.com/collab-project/videojs-record
 * Copyright (c) 2014-2017 - Licensed MIT */

!function (a, b) {
    "function" == typeof define && define.amd ? define(["videojs"], b) : "object" == typeof module && module.exports ? module.exports = b(require("video.js")) : a.returnExports = b(a.videojs)
}(this, function (a) {
    "use strict";
    var b = a.getComponent("Component"), c = a.getComponent("Button");
    a.RecordBase = a.extend(b, {
        IMAGE_ONLY: "image_only",
        AUDIO_ONLY: "audio_only",
        VIDEO_ONLY: "video_only",
        AUDIO_VIDEO: "audio_video",
        ANIMATION: "animation",
        RECORDRTC: "recordrtc",
        LIBVORBISJS: "libvorbis.js",
        RECORDERJS: "recorder.js",
        LAMEJS: "lamejs",
        OPUSRECORDER: "opus-recorder",
        constructor: function (a, c) {
            b.call(this, a, c)
        },
        detectBrowser: function () {
            var a = {};
            return a.browser = null, a.version = null, a.minVersion = null, "undefined" != typeof window && window.navigator ? navigator.mozGetUserMedia ? (a.browser = "firefox", a.version = this.extractVersion(navigator.userAgent, /Firefox\/([0-9]+)\./, 1), a.minVersion = 31, a) : navigator.webkitGetUserMedia && window.webkitRTCPeerConnection ? (a.browser = "chrome", a.version = this.extractVersion(navigator.userAgent, /Chrom(e|ium)\/([0-9]+)\./, 2), a.minVersion = 38, a) : navigator.mediaDevices && navigator.userAgent.match(/Edge\/(\d+).(\d+)$/) ? (a.browser = "edge", a.version = this.extractVersion(navigator.userAgent, /Edge\/(\d+).(\d+)$/, 2), a.minVersion = 10547, a) : (a.browser = "Not a supported browser.", a) : (a.browser = "Not a supported browser.", a)
        },
        extractVersion: function (a, b, c) {
            var d = a.match(b);
            return d && d.length >= c && parseInt(d[c], 10)
        },
        isEdge: function () {
            return "edge" === this.detectBrowser().browser
        },
        isOpera: function () {
            return !!window.opera || navigator.userAgent.indexOf("OPR/") !== -1
        },
        isChrome: function () {
            return "chrome" === this.detectBrowser().browser
        },
        dispose: function () {
            void 0 !== this.mediaURL && URL.revokeObjectURL(this.mediaURL)
        },
        addFileInfo: function (a) {
            var b = new Date;
            a.lastModifiedDate = b;
            var c = "." + a.type.split("/")[1];
            c.indexOf(";") > -1 && (c = c.split(";")[0]), a.name = b.getTime() + c
        },
        onStopRecording: function (a) {
            this.recordedData = a, this.addFileInfo(this.recordedData), this.dispose(), this.mediaURL = URL.createObjectURL(this.recordedData), this.trigger("recordComplete")
        }
    }), a.RecordRTCEngine = a.extend(a.RecordBase, {
        setup: function (a, b, c) {
            this.inputStream = a, this.mediaType = b, this.debug = c, this.engine = new MRecordRTC, this.engine.mediaType = this.mediaType, this.engine.disableLogs = !this.debug, this.engine.mimeType = this.mimeType, this.engine.bufferSize = this.bufferSize, this.engine.sampleRate = this.sampleRate, this.engine.numberOfAudioChannels = this.audioChannels, this.engine.video = this.video, this.engine.canvas = this.canvas, this.engine.quality = this.quality, this.engine.frameRate = this.frameRate, this.engine.addStream(this.inputStream)
        }, start: function () {
            this.engine.startRecording()
        }, stop: function () {
            this.engine.stopRecording(this.onStopRecording.bind(this))
        }, saveAs: function (a) {
            this.engine && void 0 !== a && this.engine.save(a)
        }, onStopRecording: function (a, b) {
            this.mediaURL = a;
            var c = this.player().recorder.getRecordType();
            this.engine.getBlob(function (a) {
                switch (c) {
                    case this.AUDIO_ONLY:
                        this.recordedData = a.audio, this.addFileInfo(this.recordedData), this.trigger("recordComplete");
                        break;
                    case this.VIDEO_ONLY:
                    case this.AUDIO_VIDEO:
                        if (void 0 !== a.video) {
                            if (this.recordedData = a.video, c === this.AUDIO_VIDEO && this.isChrome()) {
                                this.recordedData = a;
                                for (var b in this.recordedData)this.addFileInfo(this.recordedData[b])
                            } else this.addFileInfo(this.recordedData);
                            this.trigger("recordComplete")
                        }
                        break;
                    case this.ANIMATION:
                        this.recordedData = a.gif, this.addFileInfo(this.recordedData), this.trigger("recordComplete")
                }
            }.bind(this))
        }
    }), a.Recorder = a.extend(a.RecordBase, {
        constructor: function (a, c) {
            b.call(this, a, c), this.loadOptions(), this.resetState();
            var d = function (a, b, c) {
                var d = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
                return d ? new Promise(function (b, c) {
                    d.call(navigator, a, b, c)
                }) : Promise.reject(new Error("getUserMedia is not implemented in this browser"))
            };
            void 0 === navigator.mediaDevices && (navigator.mediaDevices = {}), void 0 === navigator.mediaDevices.getUserMedia && (navigator.mediaDevices.getUserMedia = d), this.player().one("ready", this.setupUI.bind(this))
        }, loadOptions: function () {
            this.recordImage = this.options_.options.image, this.recordAudio = this.options_.options.audio, this.recordVideo = this.options_.options.video, this.recordAnimation = this.options_.options.animation, this.maxLength = this.options_.options.maxLength, this.debug = this.options_.options.debug, this.videoFrameWidth = this.options_.options.frameWidth, this.videoFrameHeight = this.options_.options.frameHeight, this.videoRecorderType = this.options_.options.videoRecorderType, this.videoMimeType = this.options_.options.videoMimeType, this.audioEngine = this.options_.options.audioEngine, this.audioRecorderType = this.options_.options.audioRecorderType, this.audioWorkerURL = this.options_.options.audioWorkerURL, this.audioBufferSize = this.options_.options.audioBufferSize, this.audioSampleRate = this.options_.options.audioSampleRate, this.audioChannels = this.options_.options.audioChannels, this.audioMimeType = this.options_.options.audioMimeType, this.animationFrameRate = this.options_.options.animationFrameRate, this.animationQuality = this.options_.options.animationQuality
        }, setupUI: function () {
            switch (this.player().controlBar.addChild(this.player().cameraButton), this.player().controlBar.el().insertBefore(this.player().cameraButton.el(), this.player().controlBar.el().firstChild), this.player().controlBar.el().insertBefore(this.player().recordToggle.el(), this.player().controlBar.el().firstChild), void 0 !== this.player().controlBar.remainingTimeDisplay && (this.player().controlBar.remainingTimeDisplay.el().style.display = "none"), void 0 !== this.player().controlBar.liveDisplay && (this.player().controlBar.liveDisplay.el().style.display = "none"), this.player().loop(!1), this.getRecordType()) {
                case this.AUDIO_ONLY:
                    this.surfer = this.player().waveform, this.surfer && (this.playhead = this.surfer.el().getElementsByTagName("wave")[1], this.playhead.style.display = "none");
                    break;
                case this.IMAGE_ONLY:
                case this.VIDEO_ONLY:
                case this.AUDIO_VIDEO:
                case this.ANIMATION:
                    this.player().bigPlayButton.hide(), this.player().one("loadedmetadata", function () {
                        this.setDuration(this.maxLength)
                    }.bind(this)), this.player().usingNativeControls_ === !0 && void 0 !== this.player().tech_.el_ && (this.player().tech_.el_.controls = !1), this.player().options_.controls && (this.player().controlBar.progressControl.hide(), this.player().on("userinactive", function (a) {
                        this.player().userActive(!0)
                    }), this.player().controlBar.show(), this.player().controlBar.el().style.display = "flex")
            }
            this.player().off("timeupdate"), this.setDuration(this.maxLength), this.player().controlBar.playToggle.hide()
        }, isRecording: function () {
            return this._recording
        }, isProcessing: function () {
            return this._processing
        }, isDestroyed: function () {
            return this.player() && null === this.player().children()
        }, getDevice: function () {
            switch (void 0 === this.deviceReadyCallback && (this.deviceReadyCallback = this.onDeviceReady.bind(this)), void 0 === this.deviceErrorCallback && (this.deviceErrorCallback = this.onDeviceError.bind(this)), void 0 === this.engineStopCallback && (this.engineStopCallback = this.onRecordComplete.bind(this)), this.getRecordType()) {
                case this.AUDIO_ONLY:
                    this.mediaType = {
                        audio: "auto" === this.audioRecorderType || this.audioRecorderType,
                        video: !1
                    }, this.surfer.microphone.un("deviceReady", this.deviceReadyCallback), this.surfer.microphone.un("deviceError", this.deviceErrorCallback), this.surfer.microphone.on("deviceReady", this.deviceReadyCallback), this.surfer.microphone.on("deviceError", this.deviceErrorCallback), this.surfer.setupPlaybackEvents(!1), this.surfer.liveMode = !0, this.surfer.microphone.paused = !1, this.surfer.microphone.start();
                    break;
                case this.IMAGE_ONLY:
                case this.VIDEO_ONLY:
                    this.mediaType = {
                        audio: !1,
                        video: "auto" === this.videoRecorderType || this.videoRecorderType
                    }, navigator.mediaDevices.getUserMedia({
                        audio: !1,
                        video: this.getRecordType() === this.IMAGE_ONLY ? this.recordImage : this.recordVideo
                    }).then(this.onDeviceReady.bind(this)).catch(this.onDeviceError.bind(this));
                    break;
                case this.AUDIO_VIDEO:
                    this.mediaType = {
                        audio: "auto" === this.audioRecorderType || this.audioRecorderType,
                        video: "auto" === this.videoRecorderType || this.videoRecorderType
                    }, navigator.mediaDevices.getUserMedia({
                        audio: this.recordAudio,
                        video: this.recordVideo
                    }).then(this.onDeviceReady.bind(this)).catch(this.onDeviceError.bind(this));
                    break;
                case this.ANIMATION:
                    this.mediaType = {audio: !1, video: !1, gif: !0}, navigator.mediaDevices.getUserMedia({
                        audio: !1,
                        video: this.recordAnimation
                    }).then(this.onDeviceReady.bind(this)).catch(this.onDeviceError.bind(this))
            }
        }, onDeviceReady: function (b) {
            if (this._deviceActive = !0, this.stream = b, this.player().trigger("deviceReady"), this.player().deviceButton.hide(), this.setDuration(this.maxLength), this.setCurrentTime(0), this.player().controlBar.playToggle.hide(), this.off(this.player(), "timeupdate", this.playbackTimeUpdate), this.off(this.player(), "pause", this.onPlayerPause), this.off(this.player(), "play", this.onPlayerStart), this.getRecordType() !== this.IMAGE_ONLY) {
                if (this.getRecordType() !== this.AUDIO_ONLY && (this.audioEngine === this.LIBVORBISJS || this.audioEngine === this.RECORDERJS || this.audioEngine === this.LAMEJS || this.audioEngine === this.OPUSRECORDER))throw new Error("Currently " + this.audioEngine + " is only supported in audio-only mode.");
                var c;
                switch (this.audioEngine) {
                    case this.RECORDRTC:
                        c = a.RecordRTCEngine;
                        break;
                    case this.LIBVORBISJS:
                        c = a.LibVorbisEngine;
                        break;
                    case this.RECORDERJS:
                        c = a.RecorderjsEngine;
                        break;
                    case this.LAMEJS:
                        c = a.LamejsEngine;
                        break;
                    case this.OPUSRECORDER:
                        c = a.OpusRecorderEngine;
                        break;
                    default:
                        throw new Error("Unknown audioEngine: " + this.audioEngine)
                }
                try {
                    this.engine = new c(this.player())
                } catch (a) {
                    throw new Error("Could not load " + this.audioEngine + " plugin")
                }
                this.engine.on("recordComplete", this.engineStopCallback), this.engine.bufferSize = this.audioBufferSize, this.engine.sampleRate = this.audioSampleRate, this.engine.audioChannels = this.audioChannels, this.engine.audioWorkerURL = this.audioWorkerURL, this.engine.mimeType = {
                    video: this.videoMimeType,
                    gif: "image/gif"
                }, null !== this.audioMimeType && "auto" !== this.audioMimeType && (this.engine.mimeType.audio = this.audioMimeType), this.engine.video = {
                    width: this.videoFrameWidth,
                    height: this.videoFrameHeight
                }, this.engine.canvas = {
                    width: this.videoFrameWidth,
                    height: this.videoFrameHeight
                }, this.engine.quality = this.animationQuality, this.engine.frameRate = this.animationFrameRate, this.engine.setup(this.stream, this.mediaType, this.debug);
                var d, e = [this.player().controlBar.currentTimeDisplay, this.player().controlBar.timeDivider, this.player().controlBar.durationDisplay];
                for (d in e)e[d].el().style.display = "block", e[d].show();
                this.player().recordToggle.show()
            } else this.player().recordIndicator.disable(), this.retrySnapshot(), this.player().cameraButton.onStop(), this.player().cameraButton.show();
            this.getRecordType() !== this.AUDIO_ONLY && (this.mediaElement = this.player().el().firstChild, this.mediaElement.controls = !1, this.mediaElement.muted = !0, this.displayVolumeControl(!1), void 0 !== this.streamURL && URL.revokeObjectURL(this.streamURL), this.streamURL = URL.createObjectURL(this.stream), this.load(this.streamURL), this.mediaElement.play())
        }, onDeviceError: function (a) {
            this._deviceActive = !1, this.player().deviceErrorCode = a, this.player().trigger("deviceError")
        }, start: function () {
            if (!this.isProcessing()) {
                switch (this._recording = !0, this.player().controlBar.playToggle.hide(), this.getRecordType()) {
                    case this.AUDIO_ONLY:
                        this.surfer.setupPlaybackEvents(!1), this.playhead.style.display = "none", this.surfer.microphone.paused = !1, this.surfer.liveMode = !0, this.player().play();
                        break;
                    case this.VIDEO_ONLY:
                    case this.AUDIO_VIDEO:
                        this.startVideoPreview();
                        break;
                    case this.ANIMATION:
                        this.player().recordCanvas.hide(), this.player().animationDisplay.hide(), this.mediaElement.style.display = "block", this.captureFrame(), this.startVideoPreview()
                }
                this.getRecordType() !== this.IMAGE_ONLY ? (this.startTime = (new Date).getTime(), this.countDown = this.setInterval(this.onCountDown.bind(this), 100), void 0 !== this.engine && this.engine.dispose(), this.engine.start()) : this.createSnapshot(), this.player().trigger("startRecord")
            }
        }, stop: function () {
            this.isProcessing() || (this._recording = !1, this._processing = !0, this.player().trigger("stopRecord"), this.getRecordType() !== this.IMAGE_ONLY ? (this.clearInterval(this.countDown), this.engine && this.engine.stop()) : this.player().recordedData && this.player().trigger("finishRecord"))
        }, stopDevice: function () {
            this.isRecording() ? (this.player().one("finishRecord", this.stopStream.bind(this)), this.stop()) : this.stopStream()
        }, stopStream: function () {
            if (this.stream) {
                if (this._deviceActive = !1, this.getRecordType() === this.AUDIO_ONLY)return void this.surfer.microphone.stopDevice();
                var a = this.detectBrowser();
                if ("chrome" === a.browser && a.version >= 45 || "firefox" === a.browser && a.version >= 44 || "edge" === a.browser) {
                    switch (this.getRecordType()) {
                        case this.VIDEO_ONLY:
                        case this.ANIMATION:
                        case this.IMAGE_ONLY:
                        case this.AUDIO_VIDEO:
                            this.stream.getTracks().forEach(function (a) {
                                a.stop()
                            })
                    }
                    return
                }
                this.stream.stop()
            }
        }, onRecordComplete: function () {
            switch (this.mediaURL = this.engine.mediaURL, this.getRecordType()) {
                case this.AUDIO_ONLY:
                    this.player().controlBar.playToggle.show(), this.player().recordedData = this.engine.recordedData, this.player().trigger("finishRecord"), this.player().one("pause", function () {
                        this.surfer.setupPlaybackEvents(!0), this.player().loadingSpinner.show(), this.playhead.style.display = "block", this.surfer.surfer.once("ready", function () {
                            this._processing = !1
                        }.bind(this)), this.load(this.player().recordedData)
                    }.bind(this)), this.player().pause();
                    break;
                case this.VIDEO_ONLY:
                case this.AUDIO_VIDEO:
                    this.player().controlBar.playToggle.show(), this.player().recordedData = this.engine.recordedData, this.player().trigger("finishRecord"), this.off(this.player(), "pause", this.onPlayerPause), this.off(this.player(), "play", this.onPlayerStart), this.player().one("pause", function () {
                        this._processing = !1, this.player().loadingSpinner.hide(), this.setDuration(this.streamDuration), this.on(this.player(), "timeupdate", this.playbackTimeUpdate), this.getRecordType() === this.AUDIO_VIDEO && this.isChrome() && this.player().recordedData.audio && (void 0 === this.extraAudio && (this.extraAudio = this.createEl("audio"), this.extraAudio.id = "extraAudio", this.player().on("volumechange", this.onVolumeChange.bind(this))), void 0 !== this.extraAudioURL && URL.revokeObjectURL(this.extraAudioURL), this.extraAudioURL = URL.createObjectURL(this.player().recordedData.audio), this.extraAudio.src = this.extraAudioURL, this.on(this.player(), "pause", this.onPlayerPause)), this.on(this.player(), "play", this.onPlayerStart), this.getRecordType() === this.AUDIO_VIDEO && (this.mediaElement.muted = !1, this.displayVolumeControl(!0)), this.load(this.mediaURL)
                    }.bind(this)), this.player().pause();
                    break;
                case this.ANIMATION:
                    this.player().controlBar.playToggle.show(), this.player().recordedData = this.engine.recordedData, this.player().trigger("finishRecord"), this._processing = !1, this.player().loadingSpinner.hide(), this.setDuration(this.streamDuration), this.mediaElement.style.display = "none", this.player().recordCanvas.show(), this.player().pause(), this.on(this.player(), "play", this.showAnimation), this.on(this.player(), "pause", this.hideAnimation)
            }
        }, onVolumeChange: function () {
            var a = this.player().volume();
            this.player().muted() && (a = 0), void 0 !== this.extraAudio && (this.extraAudio.volume = a)
        }, onCountDown: function () {
            var a = ((new Date).getTime() - this.startTime) / 1e3, b = this.maxLength;
            this.streamDuration = a, a >= b && (a = b, this.stop()), this.setDuration(b), this.setCurrentTime(a, b)
        }, setCurrentTime: function (a, b) {
            switch (a = isNaN(a) ? 0 : a, b = isNaN(b) ? 0 : b, this.getRecordType()) {
                case this.AUDIO_ONLY:
                    this.surfer.setCurrentTime(a, b);
                    break;
                case this.VIDEO_ONLY:
                case this.AUDIO_VIDEO:
                case this.ANIMATION:
                    var c = Math.min(a, b);
                    this.player().controlBar.currentTimeDisplay.el().firstChild.innerHTML = this.formatTime(c, b)
            }
        }, setDuration: function (a) {
            switch (a = isNaN(a) ? 0 : a, this.getRecordType()) {
                case this.AUDIO_ONLY:
                    this.surfer.setDuration(a);
                    break;
                case this.VIDEO_ONLY:
                case this.AUDIO_VIDEO:
                case this.ANIMATION:
                    this.player().controlBar.durationDisplay.el().firstChild.innerHTML = this.formatTime(a, a)
            }
        }, load: function (a) {
            switch (this.getRecordType()) {
                case this.AUDIO_ONLY:
                    this.surfer.load(a);
                    break;
                case this.IMAGE_ONLY:
                case this.VIDEO_ONLY:
                case this.AUDIO_VIDEO:
                case this.ANIMATION:
                    this.mediaElement.src = a
            }
        }, saveAs: function (a) {
            this.engine && void 0 !== a && this.engine.saveAs(a)
        }, destroy: function () {
            switch (this.engine && (this.engine.dispose(), this.engine.off("recordComplete", this.engineStopCallback)), this.stop(), this.stopDevice(), this.clearInterval(this.countDown), this.getRecordType()) {
                case this.AUDIO_ONLY:
                    this.surfer && this.surfer.destroy();
                    break;
                case this.IMAGE_ONLY:
                case this.VIDEO_ONLY:
                case this.AUDIO_VIDEO:
                case this.ANIMATION:
                    this.player().dispose()
            }
            this.resetState()
        }, reset: function () {
            switch (this.engine && (this.engine.dispose(), this.engine.off("recordComplete", this.engineStopCallback)), this.stop(), this.stopDevice(), this.clearInterval(this.countDown), this.loadOptions(), this.resetState(), this.setDuration(this.maxLength), this.setCurrentTime(0), this.player().reset(), this.getRecordType()) {
                case this.AUDIO_ONLY:
                    this.surfer && this.surfer.surfer && this.surfer.surfer.empty();
                    break;
                case this.IMAGE_ONLY:
                case this.ANIMATION:
                    this.player().recordCanvas.hide(), this.player().cameraButton.hide()
            }
            this.player().controlBar.playToggle.hide(), this.player().deviceButton.show(), this.player().recordToggle.hide(), this.player().one("loadedmetadata", function () {
                this.setDuration(this.maxLength)
            }.bind(this))
        }, resetState: function () {
            this._recording = !1, this._processing = !1, this._deviceActive = !1, this.devices = []
        }, getRecordType: function () {
            return this.isModeEnabled(this.recordImage) ? this.IMAGE_ONLY : this.isModeEnabled(this.recordAnimation) ? this.ANIMATION : this.isModeEnabled(this.recordAudio) && !this.isModeEnabled(this.recordVideo) ? this.AUDIO_ONLY : this.isModeEnabled(this.recordAudio) && this.isModeEnabled(this.recordVideo) ? this.AUDIO_VIDEO : !this.isModeEnabled(this.recordAudio) && this.isModeEnabled(this.recordVideo) ? this.VIDEO_ONLY : void 0
        }, createSnapshot: function () {
            var a = this.captureFrame();
            this.player().recordedData = a.toDataURL("image/png"), this.mediaElement.style.display = "none", this.player().recordCanvas.show(), this.stop()
        }, retrySnapshot: function () {
            this._processing = !1, this.player().recordCanvas.hide(), this.player().el().firstChild.style.display = "block"
        }, captureFrame: function () {
            var a = this.player().recordCanvas.el().firstChild;
            return a.width = this.player().width(), a.height = this.player().height(), a.getContext("2d").drawImage(this.mediaElement, 0, 0, a.width, a.height), a
        }, startVideoPreview: function () {
            this.off("timeupdate"), this.off("play"), this.mediaElement.muted = !0, this.displayVolumeControl(!1), void 0 !== this.streamURL && URL.revokeObjectURL(this.streamURL), this.streamURL = URL.createObjectURL(this.stream), this.load(this.streamURL), this.mediaElement.play()
        }, showAnimation: function () {
            var a = this.player().animationDisplay.el().firstChild;
            a.width = this.player().width(), a.height = this.player().height(), this.player().recordCanvas.hide(), a.src = this.mediaURL, this.player().animationDisplay.show()
        }, hideAnimation: function () {
            this.player().recordCanvas.show(), this.player().animationDisplay.hide()
        }, onPlayerStart: function () {
            this.player().seeking() && (this.load(this.mediaURL), this.player().play()), this.getRecordType() === this.AUDIO_VIDEO && this.isChrome() && !this._recording && void 0 !== this.extraAudio && (this.extraAudio.currentTime = this.player().currentTime(), this.extraAudio.play())
        }, onPlayerPause: function () {
            void 0 !== this.extraAudio && this.extraAudio.pause()
        }, playbackTimeUpdate: function () {
            this.setCurrentTime(this.player().currentTime(), this.streamDuration)
        }, enumerateDevices: function () {
            var a = this;
            return navigator.mediaDevices && navigator.mediaDevices.enumerateDevices ? void navigator.mediaDevices.enumerateDevices(this).then(function (b) {
                a.devices = [], b.forEach(function (b) {
                    a.devices.push(b)
                }), a.player().trigger("enumerateReady")
            }).catch(function (b) {
                a.player().enumerateErrorCode = b, a.player().trigger("enumerateError")
            }) : (a.player().enumerateErrorCode = "enumerateDevices() not supported.", void a.player().trigger("enumerateError"))
        }, displayVolumeControl: function (a) {
            void 0 !== this.player().controlBar.volumeMenuButton && (a = a === !0 ? "block" : "none", this.player().controlBar.volumeMenuButton.el().style.display = a)
        }, formatTime: function (a, b) {
            a = a < 0 ? 0 : a, b = b || a;
            var c = Math.floor(a % 60), d = Math.floor(a / 60 % 60), e = Math.floor(a / 3600), f = (Math.floor(b / 60 % 60), Math.floor(b / 3600)), g = Math.floor(1e3 * (a - c));
            return (isNaN(a) || a === 1 / 0) && (e = d = c = g = "-"), b > 0 && b < this.msDisplayMax ? (g < 100 && (g = g < 10 ? "00" + g : "0" + g), g = ":" + g) : g = "", e = e > 0 || f > 0 ? e + ":" : "", d = (e && d < 10 ? "0" + d : d) + ":", c = c < 10 ? "0" + c : c, e + d + c + g
        }, isModeEnabled: function (a) {
            return a === Object(a) || a === !0
        }
    });
    var d, e, f, g, h, i;
    d = a.extend(c, {
        constructor: function (a, b) {
            c.call(this, a, b), this.on("click", this.onClick), this.on("tap", this.onClick), this.on(a, "startRecord", this.onStart), this.on(a, "stopRecord", this.onStop)
        }
    }), d.prototype.onClick = function (a) {
        a.stopImmediatePropagation();
        var b = this.player().recorder;
        b.isRecording() ? b.stop() : b.start()
    }, d.prototype.onStart = function () {
        this.removeClass("vjs-icon-record-start"), this.addClass("vjs-icon-record-stop"), this.el().firstChild.firstChild.innerHTML = this.localize("Stop")
    }, d.prototype.onStop = function () {
        this.removeClass("vjs-icon-record-stop"), this.addClass("vjs-icon-record-start"), this.el().firstChild.firstChild.innerHTML = this.localize("Record")
    }, e = a.extend(c, {
        constructor: function (a, b) {
            c.call(this, a, b), this.on("click", this.onClick), this.on("tap", this.onClick), this.on(a, "startRecord", this.onStart), this.on(a, "stopRecord", this.onStop)
        }
    }), e.prototype.onClick = function (a) {
        a.stopImmediatePropagation();
        var b = this.player().recorder;
        b.isProcessing() ? (b.retrySnapshot(), this.onStop()) : b.start()
    }, e.prototype.onStart = function () {
        this.removeClass("vjs-icon-photo-camera"), this.addClass("vjs-icon-photo-retry"), this.el().firstChild.firstChild.innerHTML = this.localize("Retry")
    }, e.prototype.onStop = function () {
        this.removeClass("vjs-icon-photo-retry"), this.addClass("vjs-icon-photo-camera"), this.el().firstChild.firstChild.innerHTML = this.localize("Image")
    }, f = a.extend(c, {
        constructor: function (a, b) {
            c.call(this, a, b), this.on("click", this.onClick), this.on("tap", this.onClick)
        }
    }), f.prototype.onClick = function (a) {
        a.stopImmediatePropagation(), this.player().recorder.getDevice()
    }, g = a.extend(b, {
        constructor: function (a, c) {
            b.call(this, a, c), this.on(a, "startRecord", this.show), this.on(a, "stopRecord", this.hide)
        }
    }), g.prototype.disable = function () {
        this.off(this.player(), "startRecord", this.show), this.off(this.player(), "stopRecord", this.hide)
    }, h = a.extend(b), i = a.extend(b);
    var j = function (a, c, d) {
        var e = {
            className: "vjs-" + a + "-button vjs-control vjs-icon-" + d,
            innerHTML: '<div class="vjs-control-content"><span class="vjs-control-text">' + c + "</span></div>"
        }, f = {role: "button", "aria-live": "polite", tabIndex: 0};
        return b.prototype.createEl("div", e, f)
    }, k = function () {
        var a = {className: "vjs-record"}, c = {tabIndex: 0};
        return b.prototype.createEl("div", a, c)
    }, l = {
        image: !1,
        audio: !1,
        video: !1,
        animation: !1,
        maxLength: 10,
        frameWidth: 320,
        frameHeight: 240,
        debug: !1,
        videoMimeType: "video/webm",
        videoRecorderType: "auto",
        audioEngine: "recordrtc",
        audioRecorderType: "auto",
        audioMimeType: "auto",
        audioBufferSize: 4096,
        audioSampleRate: 44100,
        audioChannels: 2,
        audioWorkerURL: "",
        animationFrameRate: 200,
        animationQuality: 10
    }, m = function (c) {
        var m = a.mergeOptions(l, c), n = this;
        n.recorder = new a.Recorder(n, {
            el: k(),
            options: m
        }), n.addChild(n.recorder), n.deviceButton = new f(n, {el: j("device", n.localize("Device"), "device-perm")}), n.recorder.addChild(n.deviceButton), n.recordIndicator = new g(n, {el: b.prototype.createEl("div", {className: "vjs-record-indicator vjs-control"})}), n.recordIndicator.hide(), n.recorder.addChild(n.recordIndicator), n.recordCanvas = new h(n, {
            el: b.prototype.createEl("div", {
                className: "vjs-record-canvas",
                innerHTML: "<canvas></canvas>"
            })
        }), n.recordCanvas.hide(), n.recorder.addChild(n.recordCanvas), n.animationDisplay = new i(n, {
            el: b.prototype.createEl("div", {
                className: "vjs-animation-display",
                innerHTML: "<img />"
            })
        }), n.animationDisplay.hide(), n.recorder.addChild(n.animationDisplay), n.cameraButton = new e(n, {el: j("camera", n.localize("Image"), "photo-camera")}), n.cameraButton.hide(), n.recordToggle = new d(n, {el: j("record", n.localize("Record"), "record-start")}), n.recordToggle.hide()
    };
    return a.plugin("record", m), m
});
//# sourceMappingURL=videojs.record.min.js.map