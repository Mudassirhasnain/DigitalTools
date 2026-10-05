'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Mic, Square, Play, Pause, Download, AlertCircle, Volume2, Trash2, ListMusic, Settings2 } from 'lucide-react';

interface AudioRecording {
  id: string;
  url: string;
  wavUrl?: string;
  duration: number;
  blobSize: number;
  timestamp: string;
  name: string;
}

// Convert AudioBuffer to WAV format binary blob
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  let result: Float32Array;
  if (numChannels === 2) {
    const channel1 = buffer.getChannelData(0);
    const channel2 = buffer.getChannelData(1);
    result = new Float32Array(channel1.length + channel2.length);
    let index = 0;
    for (let i = 0; i < channel1.length; i++) {
      result[index++] = channel1[i];
      result[index++] = channel2[i];
    }
  } else {
    result = buffer.getChannelData(0);
  }

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const wavBuffer = new ArrayBuffer(44 + result.length * bytesPerSample);
  const view = new DataView(wavBuffer);

  // Helper to write ASCII
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  /* RIFF identifier */
  writeString(0, 'RIFF');
  /* file length */
  view.setUint32(4, 36 + result.length * bytesPerSample, true);
  /* RIFF type */
  writeString(8, 'WAVE');
  /* format chunk identifier */
  writeString(12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, format, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * blockAlign, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, blockAlign, true);
  /* bits per sample */
  view.setUint16(34, bitDepth, true);
  /* data chunk identifier */
  writeString(36, 'data');
  /* data chunk length */
  view.setUint32(40, result.length * bytesPerSample, true);

  // Write PCM samples (16-bit signed integer)
  let offset = 44;
  for (let i = 0; i < result.length; i++) {
    const s = Math.max(-1, Math.min(1, result[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([view], { type: 'audio/wav' });
}

export const VoiceAudioRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [visualizerMode, setVisualizerMode] = useState<'wave' | 'frequency'>('frequency');

  // Audio Constraints settings
  const [echoCancellation, setEchoCancellation] = useState<boolean>(true);
  const [noiseSuppression, setNoiseSuppression] = useState<boolean>(true);

  // Recordings list
  const [recordings, setRecordings] = useState<AudioRecording[]>([]);
  const [currentPlaybackIndex, setCurrentPlaybackIndex] = useState<number | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);

      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (visualizerMode === 'frequency') {
        analyser.getByteFrequencyData(dataArray);
        const barCount = 48;
        const barWidth = (canvas.width / barCount) - 2;

        for (let i = 0; i < barCount; i++) {
          const idx = Math.floor((i / barCount) * (bufferLength / 2));
          const val = dataArray[idx];
          const percent = val / 255;
          const barHeight = Math.max(4, percent * (canvas.height - 16));

          // Gradient color: blue to emerald
          const r = Math.round(59 + percent * 16);
          const g = Math.round(130 + percent * 80);
          const b = Math.round(246 - percent * 50);
          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

          const x = i * (barWidth + 2) + 1;
          const y = (canvas.height - barHeight) / 2;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 3);
          ctx.fill();
        }
      } else {
        analyser.getByteTimeDomainData(dataArray);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#3b82f6';
        ctx.beginPath();

        const sliceWidth = (canvas.width * 1.0) / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * canvas.height) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }

        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
      }
    };

    render();
  };

  const startRecording = async () => {
    setErrorMessage(null);
    audioChunksRef.current = [];
    setRecordingSeconds(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation,
          noiseSuppression,
        },
      });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      analyserRef.current = analyser;

      drawVisualizer();

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const webmBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const webmUrl = URL.createObjectURL(webmBlob);

        // Convert to WAV in background
        let wavBlobUrl: string | undefined;
        try {
          const arrayBuf = await webmBlob.arrayBuffer();
          const decoded = await audioCtx.decodeAudioData(arrayBuf);
          const wavBlob = audioBufferToWav(decoded);
          wavBlobUrl = URL.createObjectURL(wavBlob);
        } catch {}

        const newRec: AudioRecording = {
          id: Date.now().toString(),
          url: webmUrl,
          wavUrl: wavBlobUrl,
          duration: recordingSeconds,
          blobSize: webmBlob.size,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          name: `Recording #${recordings.length + 1}`,
        };

        setRecordings((prev) => [newRec, ...prev]);
        setCurrentPlaybackIndex(0);

        stream.getTracks().forEach((track) => track.stop());
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };

      recorder.start();
      setIsRecording(true);
      setIsPaused(false);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      setErrorMessage('Microphone access was denied or is not available. Please grant audio permissions.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioElementRef.current) {
      audioElementRef.current.playbackRate = speed;
    }
  };

  const deleteRecording = (id: string) => {
    setRecordings((prev) => prev.filter((r) => r.id !== id));
    if (currentPlaybackIndex !== null && recordings[currentPlaybackIndex]?.id === id) {
      setCurrentPlaybackIndex(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Recording Stage */}
      <Card className="space-y-6 text-center">
        {/* Visualizer Canvas & Mode Selector */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-[#090d16] shadow-inner flex items-center justify-center h-40 relative">
          <canvas ref={canvasRef} width={800} height={160} className="w-full h-full object-cover" />

          {/* Mode Switcher floating tag */}
          <div className="absolute top-3 right-3 flex items-center gap-1 p-1 rounded-lg bg-black/40 backdrop-blur text-[11px] text-slate-300">
            <button
              type="button"
              onClick={() => setVisualizerMode('frequency')}
              className={`px-2 py-0.5 rounded ${visualizerMode === 'frequency' ? 'bg-blue-600 text-white font-bold' : ''}`}
            >
              Equalizer
            </button>
            <button
              type="button"
              onClick={() => setVisualizerMode('wave')}
              className={`px-2 py-0.5 rounded ${visualizerMode === 'wave' ? 'bg-blue-600 text-white font-bold' : ''}`}
            >
              Waveform
            </button>
          </div>

          {!isRecording && (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 font-mono">
              Microphone idle · Press Start Recording to capture audio
            </div>
          )}
        </div>

        {/* Timer Display */}
        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl sm:text-5xl font-mono font-extrabold text-slate-900 dark:text-white tracking-wider">
            {formatSeconds(recordingSeconds)}
          </span>
          {isRecording && (
            <span
              className={`w-3.5 h-3.5 rounded-full ${
                isPaused ? 'bg-amber-500' : 'bg-rose-500 animate-ping'
              }`}
            />
          )}
        </div>

        {/* Recording Controls */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {!isRecording ? (
            <Button
              size="lg"
              onClick={startRecording}
              leftIcon={<Mic className="w-5 h-5 text-rose-500 animate-pulse" />}
            >
              Start Recording
            </Button>
          ) : (
            <>
              {isPaused ? (
                <Button size="lg" variant="secondary" onClick={resumeRecording} leftIcon={<Play className="w-5 h-5" />}>
                  Resume
                </Button>
              ) : (
                <Button size="lg" variant="secondary" onClick={pauseRecording} leftIcon={<Pause className="w-5 h-5" />}>
                  Pause
                </Button>
              )}
              <Button size="lg" variant="danger" onClick={stopRecording} leftIcon={<Square className="w-5 h-5" />}>
                Finish & Save
              </Button>
            </>
          )}
        </div>

        {/* Microphone Settings */}
        {!isRecording && (
          <div className="flex items-center justify-center gap-6 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={echoCancellation}
                onChange={(e) => setEchoCancellation(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Echo Cancellation</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={noiseSuppression}
                onChange={(e) => setNoiseSuppression(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Noise Suppression</span>
            </label>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center justify-center gap-2 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </Card>

      {/* Playlist & Audio Player */}
      {recordings.length > 0 && (
        <Card className="space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ListMusic className="w-4 h-4 text-blue-600" />
              <span>Session Takes ({recordings.length})</span>
            </h3>

            {/* Playback speed controls */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 mr-1">Speed:</span>
              {[0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSpeedChange(s)}
                  className={`px-2 py-0.5 rounded font-mono ${
                    playbackSpeed === s ? 'bg-blue-600 text-white font-bold' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Active Audio Player */}
          {currentPlaybackIndex !== null && recordings[currentPlaybackIndex] && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900 dark:text-white">
                  Now Playing: {recordings[currentPlaybackIndex].name}
                </span>
                <span className="font-mono text-slate-500">
                  {formatSeconds(recordings[currentPlaybackIndex].duration)}
                </span>
              </div>

              <audio
                ref={audioElementRef}
                controls
                src={recordings[currentPlaybackIndex].url}
                className="w-full rounded-lg"
              />
            </div>
          )}

          {/* Recordings list */}
          <div className="space-y-2">
            {recordings.map((rec, idx) => (
              <div
                key={rec.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                  currentPlaybackIndex === idx
                    ? 'border-blue-500 bg-blue-50/40 dark:border-blue-800 dark:bg-blue-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div
                  onClick={() => setCurrentPlaybackIndex(idx)}
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  <div className="p-2 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      {rec.name}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {rec.timestamp} · {formatSeconds(rec.duration)} · {(rec.blobSize / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {rec.wavUrl ? (
                    <a href={rec.wavUrl} download={`${rec.name.toLowerCase().replace(/\s+/g, '_')}.wav`}>
                      <Button size="sm" variant="secondary" leftIcon={<Download className="w-3.5 h-3.5" />}>
                        Download WAV
                      </Button>
                    </a>
                  ) : null}

                  <a href={rec.url} download={`${rec.name.toLowerCase().replace(/\s+/g, '_')}.webm`}>
                    <Button size="sm" variant="outline" leftIcon={<Download className="w-3.5 h-3.5" />}>
                      WebM
                    </Button>
                  </a>

                  <button
                    type="button"
                    onClick={() => deleteRecording(rec.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                    aria-label="Delete take"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
