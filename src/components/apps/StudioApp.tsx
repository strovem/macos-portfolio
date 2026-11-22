'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Sliders,
  AudioWaveform,
  Disc3,
  Layers,
  Sparkles,
  ExternalLink,
  Info,
  Clock,
  Music,
} from 'lucide-react';
import { ORIGINAL_TRACKS, MusicTrack } from '@/data/music';
import { useAudioStore } from '@/stores/useAudioStore';
import { useWindowStore } from '@/stores/useWindowStore';

// Extended production credits and hardware chain per track
const TRACK_PRODUCTION_DETAILS: Record<
  string,
  {
    daw: string;
    synths: string[];
    mixingChain: string[];
    concept: string;
    tags: string[];
  }
> = {
  'track-tech-house-lover': {
    daw: 'Ableton Live 12 Suite & Analog Modular',
    synths: ['Roland TB-303 (Analog Bassline)', 'U-he Diva (Analog Leads)', 'Serum (Vocal Chops)'],
    mixingChain: ['SSL G-Master Bus Compressor', 'FabFilter Pro-Q 3', 'Soundtoys Decapitator', 'Ozone 11 Maximizer'],
    concept:
      'High-energy dancefloor production built around the hypnotic "I Am A Lover" vocal hook. Features a driving 126 BPM analog TB-303 bassline and syncopated percussion polyrhythms.',
    tags: ['Club Master', 'Analog 303', 'Vocal Chop', 'Peak Time'],
  },
  'track-hoodtrap': {
    daw: 'FL Studio & Ableton Live',
    synths: ['Spire (Lead Synth)', '808 Studio Custom Bass', 'Nexus 4 (Arps)'],
    mixingChain: ['CamelCrusher (Sub Saturation)', 'iZotope Trash 2', 'FabFilter Pro-MB (Dynamic Control)'],
    concept:
      'Heavyweight 808 sub-bass pressure combined with 140 BPM polyrhythmic trap hi-hat rolls. Engineered for club subwoofers and fast-paced visual choreography.',
    tags: ['808 Bass', 'Hoodtrap', 'Aggressive Drums', '140 BPM'],
  },
  'track-dark-elektro': {
    daw: 'Logic Pro 11',
    synths: ['Moog Sub 37 (Hardware Bass)', 'Arturia Pigments', 'Korg MS-20 Mini'],
    mixingChain: ['Eventide Blackhole (Spatial Reverb)', 'Elysia mpressor', 'Pultec EQP-1A Emulation'],
    concept:
      'Cinematic synthwave fused with aggressive industrial electronics. Features modular filter sweeps, distorted analog low-end, and a dark dystopian aesthetic.',
    tags: ['Analog Moog', 'Industrial', 'Dark Wave', 'Cinematic'],
  },
  'track-ethnic-garage': {
    daw: 'Ableton Live 12',
    synths: ['Ney & Saz Organic Sampler', 'Native Instruments Kontakt', 'SubBoomBass 2'],
    mixingChain: ['Valhalla VintageVerb', 'Shadow Hills Mastering Compressor', 'Waves CLA-76'],
    concept:
      'Harmonic synthesis of traditional Middle Eastern folk acoustics (ney, saz) with modern syncopated 2-step UK Garage grooves.',
    tags: ['UK Garage', 'Ethnic Fusion', '2-Step Swing', 'Organic Folk'],
  },
  'track-ethnic-psy': {
    daw: 'Cubase 13 Pro',
    synths: ['LennarDigital Sylenth1', 'Infected Mushroom Manipulator', 'Serum'],
    mixingChain: ['Cytomic The Glue', 'Soundtoys Echoboy', 'FabFilter Saturn 2'],
    concept:
      'Tribal percussion sequences, 138 BPM rolling basslines, and hypnotic spatial reverberation designed for immersive psychological listening.',
    tags: ['Psytrance', 'Tribal Rhythms', '138 BPM', 'Hypnotic'],
  },
  'track-guitar-house': {
    daw: 'Logic Pro 11',
    synths: ['Fender American Stratocaster (Live Recording)', 'Spectrasonics Trilian (Bass)', 'Kontakt Grand Piano'],
    mixingChain: ['Universal Audio LA-2A (Optical Levelling)', 'Neve 1073 Preamp/EQ', 'Lexicon 224 Reverb'],
    concept:
      'Recorded live Stratocaster chords and plucks drifting over a sunset Deep House groove with buoyant bass movement.',
    tags: ['Live Guitar', 'Deep House', 'Sunset Vibes', 'Organic Acoustic'],
  },
  'track-tech-house-club': {
    daw: 'Ableton Live 12',
    synths: ['Dave Smith Prophet Rev2', 'Roland Cloud Juno-60', 'Battery 4'],
    mixingChain: ['SSL Channel Strip', 'Universal Audio Pultec', 'Soothe2 (Resonance Suppression)'],
    concept:
      'Minimalist and rhythmically tight club mix. Deep sub-bass pocket, crispy hi-hat layering, and analog Prophet filter sweeps.',
    tags: ['Minimal Tech', 'Groove Heavy', 'Prophet Synth', 'Dancefloor'],
  },
  'track-excalibur': {
    daw: 'Logic Pro 11 & Pro Tools',
    synths: ['Cinematic Brass & Taiko Percussion', 'Moog One', 'Custom Sound Design Risers'],
    mixingChain: ['Dangerous Music BAX EQ', 'Manley Variable Mu Compressor', 'Dolby Atmos Spatial Mastering'],
    concept:
      'Official commercial jingle and sound logo composed for the Casper Excalibur gaming campaign. High-impact cinematic sound design symbolizing speed, power, and technological edge.',
    tags: ['Commercial Campaign', 'Brand Jingle', 'Sound Identity', 'Casper Excalibur'],
  },
};

export function StudioApp() {
  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    playTrack,
    togglePlay,
    pause,
    seek,
    nextTrack,
    prevTrack,
    setVolume,
  } = useAudioStore();

  const openFinderToSection = useWindowStore((state) => state.openFinderToSection);

  const [activeTab, setActiveTab] = useState<'arrangement' | 'mixer' | 'credits'>('arrangement');
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [mutedTracks, setMutedTracks] = useState<Record<string, boolean>>({});
  const [soloTrackId, setSoloTrackId] = useState<string | null>(null);

  // Animated Audio Level Meter Simulation
  const [leftDbMeter, setLeftDbMeter] = useState<number>(0);
  const [rightDbMeter, setRightDbMeter] = useState<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Active track production details
  const activeTrack = currentTrack || ORIGINAL_TRACKS[0];
  const activeDetails = useMemo(() => {
    return (
      TRACK_PRODUCTION_DETAILS[activeTrack.id] || {
        daw: 'Ableton Live & Logic Pro',
        synths: ['Analog Hardware & Virtual Synths'],
        mixingChain: ['SSL Bus Compressor, FabFilter Pro-Q 3, Ozone Mastering'],
        concept: activeTrack.description,
        tags: [activeTrack.genre, `${activeTrack.bpm} BPM`, activeTrack.year],
      }
    );
  }, [activeTrack]);

  // Real-time Level Meter Animation
  useEffect(() => {
    let phase = 0;
    const updateMeters = () => {
      if (isPlaying) {
        phase += 0.2;
        const base = Math.sin(phase) * 0.25 + 0.65;
        const jitterL = (Math.random() - 0.5) * 0.15;
        const jitterR = (Math.random() - 0.5) * 0.15;
        setLeftDbMeter(Math.max(0.05, Math.min(0.98, (base + jitterL) * volume)));
        setRightDbMeter(Math.max(0.05, Math.min(0.98, (base + jitterR) * volume)));
      } else {
        setLeftDbMeter((prev) => Math.max(0, prev * 0.85));
        setRightDbMeter((prev) => Math.max(0, prev * 0.85));
      }
      animFrameRef.current = requestAnimationFrame(updateMeters);
    };

    animFrameRef.current = requestAnimationFrame(updateMeters);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, volume]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  // Logic Pro style bars and beats readout
  const barsBeats = useMemo(() => {
    const totalBars = Math.floor(currentTime / 2) + 1;
    const currentBar = String(totalBars).padStart(3, '0');
    const beat = (Math.floor(currentTime * 2) % 4) + 1;
    const ticks = Math.floor((currentTime * 100) % 240);
    return `${currentBar} . ${beat} . 1 . ${String(ticks).padStart(3, '0')}`;
  }, [currentTime]);

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const targetSeconds = percentage * (duration || activeTrack.durationSeconds || 180);
    seek(targetSeconds);
  };

  const handleTrackSelect = (track: MusicTrack) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  const toggleMute = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMutedTracks((prev) => ({ ...prev, [trackId]: !prev[trackId] }));
  };

  const toggleSolo = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSoloTrackId((prev) => (prev === trackId ? null : trackId));
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#141419] text-neutral-200 select-none overflow-hidden font-sans">
      {/* 1. TOP TRANSPORT BAR (Logic Pro / Ableton style header) */}
      <header className="h-14 bg-[#1C1C24] border-b border-white/10 px-4 flex items-center justify-between shrink-0 shadow-md">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-800 flex items-center justify-center shadow-[0_0_12px_rgba(147,51,234,0.4)] border border-violet-400/30">
            <AudioWaveform className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-wide text-white flex items-center gap-1.5">
              <span>Hüseyin Studio</span>
              <span className="px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 text-[9px] font-mono border border-violet-500/30">
                PRO 12
              </span>
            </span>
            <span className="text-[10px] text-neutral-400">Audio Lab & Multitrack Showcase</span>
          </div>
        </div>

        {/* Center: Main Transport Controls & LCD Readout */}
        <div className="flex items-center gap-3">
          {/* Playback Buttons */}
          <div className="flex items-center gap-1 bg-[#121217] p-1 rounded-lg border border-white/10">
            <button
              type="button"
              onClick={prevTrack}
              title="Previous Track"
              className="p-1.5 rounded hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              className={`p-1.5 px-3 rounded font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                isPlaying
                  ? 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span className="text-xs font-mono">{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>

            <button
              type="button"
              onClick={pause}
              title="Stop"
              className="p-1.5 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>

            <button
              type="button"
              onClick={nextTrack}
              title="Next Track"
              className="p-1.5 rounded hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setIsLooping(!isLooping)}
              title={isLooping ? 'Loop Mode: ON' : 'Loop Mode: OFF'}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                isLooping ? 'text-amber-400 bg-amber-400/10' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Logic Pro LCD Display */}
          <div className="bg-[#0B0D11] border border-emerald-500/30 rounded-lg px-3 py-1 flex items-center gap-4 text-emerald-400 font-mono shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
            {/* Bars & Beats */}
            <div className="flex flex-col items-center">
              <span className="text-[8px] text-emerald-600 font-sans uppercase tracking-wider">Bars / Beats</span>
              <span className="text-xs font-bold tracking-wider">{barsBeats}</span>
            </div>

            <div className="h-6 w-[1px] bg-emerald-900/60" />

            {/* Timecode */}
            <div className="flex flex-col items-center">
              <span className="text-[8px] text-emerald-600 font-sans uppercase tracking-wider">Timecode</span>
              <span className="text-xs font-bold tracking-wider">
                {formatTime(currentTime)} / {formatTime(duration || activeTrack.durationSeconds || 180)}
              </span>
            </div>

            <div className="h-6 w-[1px] bg-emerald-900/60" />

            {/* Tempo & Key */}
            <div className="flex flex-col items-center">
              <span className="text-[8px] text-emerald-600 font-sans uppercase tracking-wider">Tempo</span>
              <span className="text-xs font-bold text-amber-300">{activeTrack.bpm} BPM</span>
            </div>

            <div className="h-6 w-[1px] bg-emerald-900/60" />

            {/* Sample Rate */}
            <div className="hidden sm:flex flex-col items-center">
              <span className="text-[8px] text-emerald-600 font-sans uppercase tracking-wider">Master</span>
              <span className="text-[10px] text-neutral-400">48kHz / 24b</span>
            </div>
          </div>
        </div>

        {/* Right: Master Volume & Stereo Peak Meters */}
        <div className="flex items-center gap-3">
          {/* Master Stereo Level Meter */}
          <div className="flex flex-col gap-0.5 bg-black/60 p-1.5 rounded-md border border-white/10">
            <div className="flex items-center gap-1 text-[8px] font-mono text-neutral-400 leading-none">
              <span className="w-2.5">L</span>
              <div className="w-18 h-1.5 bg-neutral-900 rounded-xs overflow-hidden flex">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-yellow-400 to-red-500 transition-all duration-75"
                  style={{ width: `${leftDbMeter * 100}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-1 text-[8px] font-mono text-neutral-400 leading-none">
              <span className="w-2.5">R</span>
              <div className="w-18 h-1.5 bg-neutral-900 rounded-xs overflow-hidden flex">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-yellow-400 to-red-500 transition-all duration-75"
                  style={{ width: `${rightDbMeter * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Master Fader */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
              className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              {volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 sm:w-20 accent-emerald-500 h-1 bg-neutral-800 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] font-mono w-7 text-right text-neutral-400">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      </header>

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="h-9 bg-[#17171F] border-b border-white/5 px-4 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('arrangement')}
            className={`px-3 py-1 rounded font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'arrangement'
                ? 'bg-white/15 text-white shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-violet-400" />
            <span>Arrangement & Waveforms</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('credits')}
            className={`px-3 py-1 rounded font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'credits'
                ? 'bg-white/15 text-white shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Production Notes & Stems</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => openFinderToSection('music')}
          className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-violet-300 transition-colors cursor-pointer"
        >
          <span>View in Finder ↗</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* 3. MAIN WORKSPACE (Arrangement or Credits) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Tracklist (8 Tracks with Mute/Solo and Details) */}
        <div className="w-72 sm:w-80 bg-[#17171F] border-r border-white/10 flex flex-col shrink-0">
          <div className="p-2.5 px-3 bg-[#13131A] border-b border-white/5 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
            <span>TRACK LIST ({ORIGINAL_TRACKS.length})</span>
            <span>M / S / VOL</span>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1.5">
            {ORIGINAL_TRACKS.map((track, idx) => {
              const isSelected = activeTrack.id === track.id;
              const isTrackPlaying = isSelected && isPlaying;
              const isMuted = !!mutedTracks[track.id];
              const isSolo = soloTrackId === track.id;

              return (
                <div
                  key={track.id}
                  onClick={() => handleTrackSelect(track)}
                  className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-violet-950/40 border-violet-500/50 shadow-sm'
                      : 'bg-[#1D1D27]/80 hover:bg-[#232330] border-white/5'
                  }`}
                >
                  {/* Left: Track Indicator and Info */}
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className="font-mono text-[10px] text-neutral-500 w-3">
                      {String(idx + 1).padStart(2, '0')}
                    </span>

                    {/* Mini Cover Art / Status */}
                    <div
                      className={`w-7 h-7 rounded-md bg-gradient-to-br ${track.coverGradient} flex items-center justify-center shrink-0 shadow-xs relative`}
                    >
                      {isTrackPlaying ? (
                        <div className="flex items-end gap-0.5 h-3">
                          <span className="w-0.5 h-2.5 bg-white rounded-full animate-bounce" style={{ animationDuration: '0.4s' }} />
                          <span className="w-0.5 h-3 bg-white rounded-full animate-bounce" style={{ animationDuration: '0.6s' }} />
                          <span className="w-0.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDuration: '0.5s' }} />
                        </div>
                      ) : (
                        <Music className="w-3.5 h-3.5 text-white/80" />
                      )}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className={`text-xs font-semibold truncate ${isSelected ? 'text-white' : 'text-neutral-300'}`}>
                        {track.title}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
                        <span className="text-amber-400/90 font-mono">{track.bpm} BPM</span>
                        <span>•</span>
                        <span>{track.genre.split('/')[0]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Solo / Mute Buttons */}
                  <div className="flex items-center gap-1 shrink-0 ml-1">
                    <button
                      type="button"
                      onClick={(e) => toggleMute(track.id, e)}
                      title="Mute Track"
                      className={`w-5 h-5 rounded text-[9px] font-bold font-mono transition-colors cursor-pointer flex items-center justify-center ${
                        isMuted ? 'bg-red-500 text-white shadow-xs' : 'bg-black/30 text-neutral-400 hover:text-white'
                      }`}
                    >
                      M
                    </button>
                    <button
                      type="button"
                      onClick={(e) => toggleSolo(track.id, e)}
                      title="Solo Track"
                      className={`w-5 h-5 rounded text-[9px] font-bold font-mono transition-colors cursor-pointer flex items-center justify-center ${
                        isSolo ? 'bg-amber-400 text-black shadow-xs font-extrabold' : 'bg-black/30 text-neutral-400 hover:text-white'
                      }`}
                    >
                      S
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center/Right: Interactive Waveform & Production Inspector */}
        <div className="flex-1 flex flex-col bg-[#121217] overflow-y-auto no-scrollbar">
          {activeTab === 'arrangement' ? (
            <div className="p-4 flex flex-col gap-4">
              {/* Active Track Hero Header */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#1B1829] via-[#1E1933] to-[#161424] border border-violet-500/30 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${activeTrack.coverGradient} flex items-center justify-center shadow-md relative`}
                  >
                    <Disc3
                      className={`w-8 h-8 text-white ${isPlaying ? 'animate-spin' : ''}`}
                      style={{ animationDuration: '4s' }}
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-semibold border border-violet-500/30">
                        {activeTrack.genre}
                      </span>
                      <span className="text-[11px] text-amber-400 font-mono font-bold">{activeTrack.bpm} BPM</span>
                      <span className="text-[11px] text-neutral-400">{activeTrack.year} Release</span>
                    </div>
                    <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">{activeTrack.title}</h2>
                    <span className="text-xs text-neutral-400">Production & Mix: {activeTrack.artist}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={togglePlay}
                  className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-md cursor-pointer transition-all ${
                    isPlaying
                      ? 'bg-emerald-500 text-white shadow-emerald-500/30 hover:bg-emerald-400'
                      : 'bg-violet-600 text-white shadow-violet-600/30 hover:bg-violet-500'
                  }`}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  <span className="text-xs">{isPlaying ? 'Pause' : 'Play Track'}</span>
                </button>
              </div>

              {/* Interactive DAW Waveform Arrangement Canvas */}
              <div className="p-4 rounded-xl bg-[#191924] border border-white/10 flex flex-col gap-3 shadow-inner">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <div className="flex items-center gap-2">
                    <AudioWaveform className="w-4 h-4 text-violet-400" />
                    <span className="font-bold text-neutral-200">Main Stereo Stem & Waveform</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-emerald-400 font-bold">{formatTime(currentTime)}</span>
                    <span className="text-neutral-600">/</span>
                    <span>{formatTime(duration || activeTrack.durationSeconds || 180)}</span>
                  </div>
                </div>

                {/* Timeline Measure Bar */}
                <div className="h-4 bg-[#111116] rounded-xs flex items-center px-2 text-[9px] font-mono text-neutral-500 border border-white/5">
                  <div className="w-full flex justify-between">
                    <span>1.1</span>
                    <span>9.1</span>
                    <span>17.1 (Drop)</span>
                    <span>25.1</span>
                    <span>33.1</span>
                    <span>41.1 (Outro)</span>
                  </div>
                </div>

                {/* Clickable Waveform Track */}
                <div
                  onClick={handleWaveformClick}
                  className="relative h-28 bg-[#0F0F14] rounded-lg border border-violet-500/20 overflow-hidden cursor-crosshair group shadow-inner flex items-center justify-center px-1"
                >
                  {/* Grid lines */}
                  <div className="absolute inset-0 grid grid-cols-12 pointer-events-none opacity-15">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="border-r border-violet-400 h-full" />
                    ))}
                  </div>

                  {/* Pseudo Waveform Bars */}
                  <div className="flex items-center justify-between gap-[2px] w-full h-full px-2 z-10">
                    {Array.from({ length: 64 }).map((_, i) => {
                      const seed = activeTrack.title.charCodeAt(i % activeTrack.title.length);
                      const baseHeight = Math.abs(Math.sin((i / 64) * Math.PI * 3 + seed)) * 75 + 15;
                      const progress = currentTime / (duration || activeTrack.durationSeconds || 180);
                      const isPassed = i / 64 <= progress;

                      return (
                        <div
                          key={i}
                          className="flex flex-col items-center justify-center flex-1 h-full py-2 pointer-events-none"
                        >
                          <div
                            className={`w-full rounded-full transition-colors duration-100 ${
                              isPassed
                                ? 'bg-gradient-to-t from-violet-500 to-cyan-300 shadow-[0_0_6px_rgba(168,85,247,0.5)]'
                                : 'bg-neutral-700/80 group-hover:bg-neutral-600'
                            }`}
                            style={{ height: `${baseHeight}%` }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Scrubber Playhead Line */}
                  <div
                    className="absolute top-0 bottom-0 w-[2px] bg-cyan-400 shadow-[0_0_10px_#22d3ee] pointer-events-none z-20"
                    style={{
                      left: `${Math.min(
                        100,
                        (currentTime / (duration || activeTrack.durationSeconds || 180)) * 100
                      )}%`,
                    }}
                  >
                    <div className="w-2.5 h-2.5 bg-cyan-400 rotate-45 -ml-1 -mt-0.5 rounded-xs" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                  <span>💡 Click anywhere along the waveform to scrub or seek through the track.</span>
                  <span className="font-mono text-emerald-400 text-xs">
                    {isPlaying ? '● LIVE PLAYING' : '○ PAUSED'}
                  </span>
                </div>
              </div>

              {/* Dynamic Spectrum EQ Curve (Visual representation) */}
              <div className="p-3.5 rounded-xl bg-[#191924] border border-white/10 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-200 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Real-Time Spectrum Analyzer (Sub 20Hz - Air 20kHz)</span>
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">Master Bus Output</span>
                </div>

                <div className="h-16 bg-[#0E0E14] rounded-lg p-2 flex items-end justify-between gap-1 border border-white/5">
                  {Array.from({ length: 32 }).map((_, idx) => {
                    const freqScale = Math.sin((idx / 32) * Math.PI) * 0.8 + 0.2;
                    const randomJitter = isPlaying ? (Math.random() - 0.5) * 0.3 : 0;
                    const heightPercent = isPlaying
                      ? Math.max(10, Math.min(100, (freqScale + randomJitter) * 90 * volume))
                      : 8;

                    return (
                      <div
                        key={idx}
                        className="flex-1 bg-gradient-to-t from-emerald-500 via-cyan-400 to-violet-500 rounded-t-xs transition-all duration-75"
                        style={{ height: `${heightPercent}%` }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Credits & Production Deep Dive Tab */
            <div className="p-5 flex flex-col gap-5">
              <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/30 flex flex-col gap-2">
                <span className="text-xs font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Creative Direction & Production Philosophy</span>
                </span>
                <p className="text-sm text-neutral-200 leading-relaxed">{activeDetails.concept}</p>
              </div>

              {/* Tech Stack Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Synths and Instruments */}
                <div className="p-4 rounded-xl bg-[#191924] border border-white/10 flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <Music className="w-3.5 h-3.5" />
                    <span>Synthesizers & Instruments Used</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-neutral-300">
                    {activeDetails.synths.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Mixing & Mastering Chain */}
                <div className="p-4 rounded-xl bg-[#191924] border border-white/10 flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Mixing & Mastering Hardware / Plugin Chain</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-neutral-300">
                    {activeDetails.mixingChain.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* DAW and Format Info */}
              <div className="p-3.5 rounded-xl bg-[#15151F] border border-white/5 flex items-center justify-between text-xs text-neutral-300">
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400">Recording & DAW Environment:</span>
                  <span className="font-semibold text-white">{activeDetails.daw}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400">Mastering Delivery:</span>
                  <span className="font-mono text-emerald-400 font-bold">WAV 96kHz / 24-bit PCM</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
