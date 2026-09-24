/**
 * Worxpertise Academy - Video Player & Watch Tracker
 * Supports high-definition HTML5 video streams with multi-source failover,
 * embedded YouTube lecture playback, watch-time gating, and post-video assessment unlock triggers.
 */

class VideoPlayerController {
  constructor() {
    this.currentModule = null;
    this.currentProgram = null;
    this.videoElement = null;
    this.playbackSpeed = 1.0;
    this.activeMode = "html5"; // "html5" | "youtube"
    this.ytProgressInterval = null;
    this.ytCurrentSeconds = 0;
    this.maxWatchedTime = 0; // High-water mark of cumulative legitimate watch time
    this.lastSeekWarningTime = 0; // Throttles skip warning notifications
  }

  init(containerId, moduleData, programData = null) {
    this.currentModule = moduleData;
    this.currentProgram = programData || (window.app && window.app.activeProgram);
    const container = document.getElementById(containerId);
    if (!container) return;

    if (this.ytProgressInterval) {
      clearInterval(this.ytProgressInterval);
      this.ytProgressInterval = null;
    }

    const isWatched = window.appState.isVideoFinished(moduleData.id);
    const initialPercent = window.appState.getVideoPercent(moduleData.id);
    this.maxWatchedTime = isWatched ? Infinity : (window.appState.getMaxWatchedSeconds(moduleData.id) || 0);
    this.lastSeekWarningTime = 0;
    const posterUrl = (this.currentProgram && this.currentProgram.thumbnail) 
      ? this.currentProgram.thumbnail 
      : "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&auto=format&fit=crop&q=80";

    const videoUrl = moduleData.videoUrl || moduleData.video_url || "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4";
    const youtubeId = moduleData.youtubeId || moduleData.youtube_id || "aqz-KE-bpKQ";
    const hasYouTube = Boolean(youtubeId);

    container.innerHTML = `
      <div class="video-wrapper bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
        <!-- Player Source Switcher Bar -->
        <div class="px-5 py-2.5 bg-slate-900 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex items-center space-x-2 text-slate-300 font-semibold truncate">
            <span class="w-2.5 h-2.5 rounded-full bg-[#dd1f36]"></span>
            <span class="truncate">${moduleData.title}</span>
          </div>

          <div class="flex items-center space-x-1.5 shrink-0">
            <button 
              id="btnModeHtml5" 
              type="button"
              class="px-3 py-1 rounded-lg font-bold text-xs transition bg-[#dd1f36] text-white shadow-sm flex items-center space-x-1"
            >
              <span>🎬</span>
              <span>MP4 Stream</span>
            </button>
            ${hasYouTube ? `
              <button 
                id="btnModeYouTube" 
                type="button"
                class="px-3 py-1 rounded-lg font-bold text-xs transition bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center space-x-1"
              >
                <span>🔴</span>
                <span>YouTube Player</span>
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Video Display Area -->
        <div class="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          <!-- 1. HTML5 Video Player Container -->
          <div id="html5VideoContainer" class="w-full h-full relative flex items-center justify-center bg-black">
            <video 
              id="mainLessonVideo" 
              class="w-full h-full object-contain"
              playsinline
              preload="auto"
              poster="${posterUrl}"
            >
              <!-- Primary module stream -->
              <source src="${videoUrl}" type="video/mp4">
              <!-- Local bundled fallback -->
              <source src="assets/videos/lesson-stream.mp4" type="video/mp4">
              <source src="http://localhost:5000/assets/videos/lesson-stream.mp4" type="video/mp4">
              <!-- High-availability global CDN fallbacks -->
              <source src="https://vjs.zencdn.net/v/oceans.mp4" type="video/mp4">
              <source src="https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4" type="video/mp4">
              <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4">
              Your browser does not support HTML5 video streaming.
            </video>

            <!-- Big Center Play Button Overlay -->
            <button 
              id="videoPlayOverlay" 
              type="button"
              title="Click to Play Video"
              class="absolute inset-0 m-auto w-20 h-20 bg-[#dd1f36]/90 hover:bg-[#dd1f36] text-white rounded-full flex items-center justify-center shadow-2xl transition transform hover:scale-110 active:scale-95 focus:outline-none z-10 backdrop-blur-sm cursor-pointer"
            >
              <svg class="w-10 h-10 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </button>

            <!-- Stream Error Fallback Banner (Hidden by default) -->
            <div id="videoErrorBanner" class="hidden absolute inset-0 bg-slate-950/90 z-20 flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div class="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl">
                ⚠️
              </div>
              <h5 class="text-sm font-bold text-white">Direct Stream Unavailable On This Network</h5>
              <p class="text-xs text-slate-400 max-w-sm">
                Your browser or network blocked direct MP4 streaming. You can switch to the YouTube player or mark as completed for evaluation.
              </p>
              <div class="flex flex-wrap items-center justify-center gap-2 pt-2">
                ${hasYouTube ? `
                  <button 
                    id="btnErrorSwitchYouTube" 
                    type="button"
                    class="px-4 py-2 rounded-xl bg-[#dd1f36] hover:bg-[#b81427] text-white text-xs font-bold transition shadow-md"
                  >
                    🔴 Switch to YouTube Video
                  </button>
                ` : ''}
                <button 
                  id="btnErrorFastTrack" 
                  type="button"
                  class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
                >
                  ⚡ Complete Video Now
                </button>
              </div>
            </div>
          </div>

          <!-- 2. YouTube IFrame Player Container (Hidden by default) -->
          <div id="youtubeVideoContainer" class="hidden w-full h-full relative bg-black">
            ${hasYouTube ? `
              <iframe 
                id="youtubePlayerFrame" 
                src=""
                data-src="https://www.youtube-nocookie.com/embed/${youtubeId}?enablejsapi=1&autoplay=1&rel=0" 
                class="w-full h-full border-0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowfullscreen
              ></iframe>
            ` : `
              <div class="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                No YouTube stream associated with this module.
              </div>
            `}
          </div>
        </div>

        <!-- Custom Player Control Bar -->
        <div class="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center space-x-3">
            <button 
              id="ctrlPlayPause" 
              type="button"
              class="p-2.5 rounded-xl bg-[#dd1f36] hover:bg-[#b81427] text-white transition shadow-md shadow-[#dd1f36]/25"
              title="Play / Pause Video"
            >
              <svg id="playIcon" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              <svg id="pauseIcon" class="w-5 h-5 hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            </button>
            <span id="timeDisplay" class="text-xs font-mono text-slate-300">00:00 / ${moduleData.duration || '--:--'}</span>
          </div>

          <!-- Video Watch Status Badge & Anti-Skip Indicator -->
          <div class="flex items-center space-x-2.5">
            <div id="videoWatchBadge" class="flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold ${isWatched ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}">
              <span class="w-2 h-2 rounded-full ${isWatched ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'}"></span>
              <span id="videoWatchText">${isWatched ? 'Video Completed ✓' : `Watching (${initialPercent}%)`}</span>
            </div>

            <div id="antiSkipBadge" class="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${isWatched ? 'bg-slate-800/80 text-slate-400 border border-slate-700/60' : 'bg-purple-950/40 text-purple-300 border border-purple-800/40'}">
              <span>${isWatched ? '🔓' : '🔒'}</span>
              <span>${isWatched ? 'Seeking Unlocked' : 'Anti-Skip Enforced'}</span>
            </div>

            <!-- Fast-Track / Test Mode Button -->
            <button 
              id="btnFastTrack" 
              type="button"
              title="Instantly mark this video as watched to unlock the Q&A quiz immediately" 
              class="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-[#dd1f36] transition flex items-center space-x-1.5 font-medium shadow-sm"
            >
              <svg class="w-3.5 h-3.5 text-[#dd1f36]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              <span>Instant Complete (Test Mode)</span>
            </button>

            <!-- Reset Watch Status (For Testing Anti-Skip) -->
            ${isWatched ? `
              <button 
                id="btnResetLesson" 
                type="button"
                title="Reset this module back to unwatched to test anti-skip gate" 
                class="text-xs px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-amber-400 border border-slate-700/70 transition flex items-center space-x-1"
              >
                <span>↺</span>
                <span class="hidden md:inline">Reset Watch</span>
              </button>
            ` : ''}
          </div>

          <!-- Controls Right: Speed & Fullscreen -->
          <div class="flex items-center space-x-2">
            <select id="ctrlSpeed" class="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:ring-1 focus:ring-[#dd1f36] focus:outline-none">
              <option value="0.75">0.75x</option>
              <option value="1.0" selected>1.0x Normal</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2.0">2.0x</option>
            </select>
            <button 
              id="ctrlFullscreen" 
              type="button"
              class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Fullscreen"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
            </button>
          </div>
        </div>

        <!-- Video Progress scrubber bar -->
        <div 
          class="w-full bg-slate-800 h-2 cursor-pointer relative overflow-hidden group select-none transition-all" 
          id="videoProgressBarContainer" 
          title="${isWatched ? 'Seek freely (unlocked)' : 'Seek restricted: Click to rewind or replay watched segments (forward skipping locked)'}"
        >
          <!-- Watched range track (allowed seek range) -->
          <div 
            id="videoWatchedRangeBar" 
            class="h-full bg-slate-600/70 absolute left-0 top-0 transition-all duration-150" 
            style="width: ${isWatched ? '100%' : `${initialPercent}%`}"
          ></div>
          <!-- Current playback position -->
          <div 
            id="videoProgressBar" 
            class="h-full bg-gradient-to-r from-[#dd1f36] to-[#b81427] relative z-10 transition-all duration-75" 
            style="width: ${initialPercent}%"
          ></div>
        </div>
      </div>

      <!-- Unlock Q&A Callout Card -->
      <div id="quizUnlockBanner" class="mt-6 p-5 rounded-3xl border transition-all duration-300 ${isWatched ? 'bg-emerald-950/40 border-emerald-800/60 shadow-lg' : 'bg-slate-900 border-slate-800'}">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isWatched ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'}">
              ${isWatched 
                ? `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
                : `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>`}
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <h4 class="font-bold text-white text-base">Module Assessment Quiz</h4>
                ${isWatched ? '<span class="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">Unlocked</span>' : '<span class="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">Locked</span>'}
              </div>
              <p class="text-xs text-slate-400 mt-1">
                ${isWatched 
                  ? 'Video completed! Take the interactive Q&A assessment to verify your understanding (80% passing grade required).' 
                  : 'Watch the entire video lesson or click "Instant Complete" above to unlock the required Q&A assessment.'}
              </p>
            </div>
          </div>

          <button 
            id="btnStartQuiz" 
            type="button"
            ${!isWatched ? 'disabled' : ''} 
            class="w-full sm:w-auto px-6 py-3 rounded-2xl font-bold text-sm transition flex items-center justify-center space-x-2 shrink-0 ${isWatched ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 btn-unlock-ready' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}"
          >
            <span>${isWatched ? 'Take Post-Video Quiz' : 'Locked (Watch Video)'}</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </button>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    this.videoElement = document.getElementById("mainLessonVideo");
    const playOverlay = document.getElementById("videoPlayOverlay");
    const playPauseBtn = document.getElementById("ctrlPlayPause");
    const playIcon = document.getElementById("playIcon");
    const pauseIcon = document.getElementById("pauseIcon");
    const timeDisplay = document.getElementById("timeDisplay");
    const speedSelect = document.getElementById("ctrlSpeed");
    const fullscreenBtn = document.getElementById("ctrlFullscreen");
    const progressBar = document.getElementById("videoProgressBar");
    const progressContainer = document.getElementById("videoProgressBarContainer");
    const btnFastTrack = document.getElementById("btnFastTrack");
    const btnResetLesson = document.getElementById("btnResetLesson");
    const btnStartQuiz = document.getElementById("btnStartQuiz");
    const btnModeHtml5 = document.getElementById("btnModeHtml5");
    const btnModeYouTube = document.getElementById("btnModeYouTube");
    const btnErrorSwitchYouTube = document.getElementById("btnErrorSwitchYouTube");
    const btnErrorFastTrack = document.getElementById("btnErrorFastTrack");

    if (!this.videoElement) return;

    // Helper: format seconds to MM:SS
    const formatTime = (secs) => {
      if (isNaN(secs) || secs < 0) return "00:00";
      const m = Math.floor(secs / 60).toString().padStart(2, '0');
      const s = Math.floor(secs % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    };

    // Safe toggle play
    const togglePlay = () => {
      if (this.activeMode === "youtube") {
        return; // YouTube controls are handled directly inside iframe
      }

      if (this.videoElement.paused) {
        const playPromise = this.videoElement.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.warn("HTML5 playback error:", err);
            // If primary video source cannot be played, show fallback banner
            const errorBanner = document.getElementById("videoErrorBanner");
            if (errorBanner) errorBanner.classList.remove("hidden");
          });
        }
      } else {
        this.videoElement.pause();
      }
    };

    // React to native video playback events (Guarantees icons always match reality)
    this.videoElement.addEventListener("playing", () => {
      if (playOverlay) playOverlay.classList.add("hidden");
      if (playIcon) playIcon.classList.add("hidden");
      if (pauseIcon) pauseIcon.classList.remove("hidden");
      const errorBanner = document.getElementById("videoErrorBanner");
      if (errorBanner) errorBanner.classList.add("hidden");
    });

    this.videoElement.addEventListener("pause", () => {
      if (playOverlay) playOverlay.classList.remove("hidden");
      if (playIcon) playIcon.classList.remove("hidden");
      if (pauseIcon) pauseIcon.classList.add("hidden");
    });

    this.videoElement.addEventListener("loadedmetadata", () => {
      const duration = this.videoElement.duration;
      if (timeDisplay && !isNaN(duration) && duration > 0) {
        timeDisplay.textContent = `${formatTime(this.videoElement.currentTime)} / ${formatTime(duration)}`;
      }

      const isFinished = window.appState.isVideoFinished(this.currentModule.id);
      if (isFinished) {
        this.maxWatchedTime = duration || Infinity;
      } else {
        const savedMax = window.appState.getMaxWatchedSeconds(this.currentModule.id);
        const savedPercent = window.appState.getVideoPercent(this.currentModule.id);
        if (savedMax > 0 && duration > 0) {
          this.maxWatchedTime = Math.min(savedMax, duration);
        } else if (savedPercent > 0 && duration > 0) {
          this.maxWatchedTime = Math.min((savedPercent / 100) * duration, duration * 0.95);
        }
      }

      const watchedRangeBar = document.getElementById("videoWatchedRangeBar");
      if (watchedRangeBar && duration > 0) {
        const watchedPercent = isFinished ? 100 : Math.min(100, (this.maxWatchedTime / duration) * 100);
        watchedRangeBar.style.width = `${watchedPercent}%`;
      }
    });

    // Handle HTML5 video errors gracefully
    this.videoElement.addEventListener("error", (e) => {
      console.warn("Video element reported error:", e);
      const errorBanner = document.getElementById("videoErrorBanner");
      if (errorBanner) errorBanner.classList.remove("hidden");
    });

    playOverlay?.addEventListener("click", togglePlay);
    playPauseBtn?.addEventListener("click", togglePlay);
    this.videoElement.addEventListener("click", togglePlay);

    // Trap native seeking to prevent skipping forward past watched territory
    this.videoElement.addEventListener("seeking", () => {
      const isFinished = window.appState.isVideoFinished(this.currentModule.id);
      if (isFinished) return;

      if (this.videoElement.currentTime > this.maxWatchedTime + 1.5) {
        // Clamp back to highest watched position
        this.videoElement.currentTime = this.maxWatchedTime;
        this.showSkipRestrictedNotice();
      }
    });

    // Time update listener - handles natural progress tracking & high-water mark advancement
    this.videoElement.addEventListener("timeupdate", () => {
      if (this.videoElement.seeking) return;

      const current = this.videoElement.currentTime;
      const duration = this.videoElement.duration || 1;
      const isFinished = window.appState.isVideoFinished(this.currentModule.id);

      // Only advance maxWatchedTime during legitimate natural forward playback
      if (!this.videoElement.paused) {
        if (current > this.maxWatchedTime) {
          if (current - this.maxWatchedTime <= 3.0 || isFinished) {
            this.maxWatchedTime = current;
          } else if (!isFinished) {
            // Sudden jump detected - revert back
            this.videoElement.currentTime = this.maxWatchedTime;
            return;
          }
        }
      }

      const playheadPercent = Math.min(100, (current / duration) * 100);
      const watchedPercent = isFinished ? 100 : Math.min(100, (this.maxWatchedTime / duration) * 100);

      if (timeDisplay && !isNaN(duration)) {
        timeDisplay.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
      }
      if (progressBar) {
        progressBar.style.width = `${playheadPercent}%`;
      }
      const watchedRangeBar = document.getElementById("videoWatchedRangeBar");
      if (watchedRangeBar) {
        watchedRangeBar.style.width = `${watchedPercent}%`;
      }

      // Check if watched requirement has legitimately been met
      const hasCompletedWatching = watchedPercent >= 98;
      window.appState.recordVideoProgress(
        this.currentModule.id, 
        watchedPercent, 
        hasCompletedWatching,
        this.maxWatchedTime
      );

      // Update badge
      const watchText = document.getElementById("videoWatchText");
      if (watchText && !isFinished) {
        if (hasCompletedWatching) {
          watchText.textContent = "Video Completed ✓";
        } else {
          watchText.textContent = `Watching (${Math.round(watchedPercent)}%)`;
        }
      }

      // Automatically complete once full content is genuinely watched
      if (hasCompletedWatching && !isFinished) {
        this.onVideoCompleted();
      }
    });

    // On Video Ended
    this.videoElement.addEventListener("ended", () => {
      const duration = this.videoElement.duration || 1;
      // Genuine completion requires having watched practically the whole video
      if (this.maxWatchedTime >= duration * 0.90 || window.appState.isVideoFinished(this.currentModule.id)) {
        this.maxWatchedTime = duration;
        this.onVideoCompleted();
      }
    });

    // Speed selector
    speedSelect?.addEventListener("change", (e) => {
      this.playbackSpeed = parseFloat(e.target.value);
      this.videoElement.playbackRate = this.playbackSpeed;
    });

    // Fullscreen
    fullscreenBtn?.addEventListener("click", () => {
      const wrapper = document.querySelector(".video-wrapper") || this.videoElement;
      if (!document.fullscreenElement) {
        wrapper.requestFullscreen().catch(err => {
          this.videoElement.requestFullscreen().catch(() => {});
        });
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    // Seek via progress container click (Gated: only allow seeking within watched range)
    progressContainer?.addEventListener("click", (e) => {
      if (this.activeMode !== "html5") return;
      const duration = this.videoElement.duration;
      if (!duration || isNaN(duration)) return;

      const rect = progressContainer.getBoundingClientRect();
      const clickX = Math.max(0, e.clientX - rect.left);
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      const targetTime = ratio * duration;
      const isFinished = window.appState.isVideoFinished(this.currentModule.id);

      if (!isFinished) {
        // Anti-skip rule: Seeking backwards or within already watched bounds is permitted.
        // Forward scrubbing beyond the highest watched position is blocked.
        if (targetTime > this.maxWatchedTime + 1.0) {
          this.videoElement.currentTime = this.maxWatchedTime;
          this.showSkipRestrictedNotice();
          return;
        }
      }

      this.videoElement.currentTime = targetTime;
    });

    // Reset Watch Status (Allows instructors / testers to re-test the anti-skip gate)
    btnResetLesson?.addEventListener("click", () => {
      if (confirm("Reset this lesson's progress to 0% to test the anti-skip watch gate?")) {
        window.appState.resetVideoProgress(this.currentModule.id);
        this.init("videoPlayerContainer", this.currentModule, this.currentProgram);
        if (window.app && window.app.showToast) {
          window.app.showToast("Lesson progress reset. Anti-skip lock is active for testing.", "info");
        }
      }
    });

    // Mode Switchers (MP4 vs YouTube)
    btnModeHtml5?.addEventListener("click", () => this.switchMode("html5"));
    btnModeYouTube?.addEventListener("click", () => this.switchMode("youtube"));
    btnErrorSwitchYouTube?.addEventListener("click", () => this.switchMode("youtube"));
    btnErrorFastTrack?.addEventListener("click", () => this.onVideoCompleted());

    // Instant Fast-Track Button (for quick testing of the certification flow)
    btnFastTrack?.addEventListener("click", () => {
      this.onVideoCompleted();
    });

    // Start Quiz button
    btnStartQuiz?.addEventListener("click", () => {
      if (window.appState.isVideoFinished(this.currentModule.id)) {
        window.quizController.openQuiz(this.currentModule);
      }
    });
  }

  switchMode(mode) {
    this.activeMode = mode;
    const html5Box = document.getElementById("html5VideoContainer");
    const ytBox = document.getElementById("youtubeVideoContainer");
    const ytFrame = document.getElementById("youtubePlayerFrame");
    const btnHtml5 = document.getElementById("btnModeHtml5");
    const btnYT = document.getElementById("btnModeYouTube");
    const playPauseBtn = document.getElementById("ctrlPlayPause");

    if (mode === "youtube") {
      // Pause HTML5 video
      if (this.videoElement && !this.videoElement.paused) {
        this.videoElement.pause();
      }

      if (html5Box) html5Box.classList.add("hidden");
      if (ytBox) ytBox.classList.remove("hidden");

      if (btnHtml5) {
        btnHtml5.className = "px-3 py-1 rounded-lg font-bold text-xs transition bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center space-x-1";
      }
      if (btnYT) {
        btnYT.className = "px-3 py-1 rounded-lg font-bold text-xs transition bg-[#dd1f36] text-white shadow-sm flex items-center space-x-1";
      }

      // Activate YouTube iframe
      if (ytFrame && ytFrame.dataset.src && ytFrame.src !== ytFrame.dataset.src) {
        ytFrame.src = ytFrame.dataset.src;
      }

      // Hide or disable direct play button in control bar when in YouTube mode
      if (playPauseBtn) playPauseBtn.classList.add("opacity-40", "pointer-events-none");

      // Start simulated watch progress tracker in YouTube mode
      this.startYouTubeProgressTracker();
    } else {
      // Switch back to HTML5
      if (ytBox) ytBox.classList.add("hidden");
      if (html5Box) html5Box.classList.remove("hidden");

      if (btnHtml5) {
        btnHtml5.className = "px-3 py-1 rounded-lg font-bold text-xs transition bg-[#dd1f36] text-white shadow-sm flex items-center space-x-1";
      }
      if (btnYT) {
        btnYT.className = "px-3 py-1 rounded-lg font-bold text-xs transition bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center space-x-1";
      }

      if (playPauseBtn) playPauseBtn.classList.remove("opacity-40", "pointer-events-none");

      if (this.ytProgressInterval) {
        clearInterval(this.ytProgressInterval);
        this.ytProgressInterval = null;
      }
    }
  }

  startYouTubeProgressTracker() {
    if (this.ytProgressInterval) clearInterval(this.ytProgressInterval);

    const progressBar = document.getElementById("videoProgressBar");
    const watchText = document.getElementById("videoWatchText");
    const timeDisplay = document.getElementById("timeDisplay");

    // Standard assumed 10 minute duration for progress simulation
    const totalDuration = 600;
    let current = Math.round((window.appState.getVideoPercent(this.currentModule.id) / 100) * totalDuration);

    this.ytProgressInterval = setInterval(() => {
      current += 2;
      const percent = Math.min(100, (current / totalDuration) * 100);

      if (progressBar) progressBar.style.width = `${percent}%`;
      if (watchText && !window.appState.isVideoFinished(this.currentModule.id)) {
        watchText.textContent = `Watching (${Math.round(percent)}%)`;
      }
      if (timeDisplay) {
        const m = Math.floor(current / 60).toString().padStart(2, '0');
        const s = Math.floor(current % 60).toString().padStart(2, '0');
        timeDisplay.textContent = `${m}:${s} / 10:00 (YouTube Stream)`;
      }

      window.appState.recordVideoProgress(this.currentModule.id, percent, percent >= 95);

      if (percent >= 95) {
        clearInterval(this.ytProgressInterval);
        this.ytProgressInterval = null;
        this.onVideoCompleted();
      }
    }, 2000);
  }

  showSkipRestrictedNotice() {
    const now = Date.now();
    if (now - this.lastSeekWarningTime < 2500) return;
    this.lastSeekWarningTime = now;

    if (window.app && window.app.showToast) {
      window.app.showToast("⏩ Forward skipping is restricted. Please watch the complete lesson to unlock the assessment.", "info");
    }

    const container = document.getElementById("videoProgressBarContainer");
    if (container) {
      container.classList.add("ring-2", "ring-[#dd1f36]");
      setTimeout(() => {
        container.classList.remove("ring-2", "ring-[#dd1f36]");
      }, 800);
    }
  }

  onVideoCompleted() {
    const duration = this.videoElement && !isNaN(this.videoElement.duration) ? this.videoElement.duration : 600;
    this.maxWatchedTime = duration;
    window.appState.recordVideoProgress(this.currentModule.id, 100, true, duration);

    const watchBadge = document.getElementById("videoWatchBadge");
    const watchText = document.getElementById("videoWatchText");
    const antiSkipBadge = document.getElementById("antiSkipBadge");
    const quizBanner = document.getElementById("quizUnlockBanner");
    const startQuizBtn = document.getElementById("btnStartQuiz");
    const progressBar = document.getElementById("videoProgressBar");
    const watchedRangeBar = document.getElementById("videoWatchedRangeBar");

    if (progressBar) progressBar.style.width = "100%";
    if (watchedRangeBar) watchedRangeBar.style.width = "100%";

    if (watchBadge) {
      watchBadge.className = "flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
    }
    if (watchText) {
      watchText.textContent = "Video Completed ✓";
    }
    if (antiSkipBadge) {
      antiSkipBadge.className = "hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800/80 text-slate-400 border border-slate-700/60";
      antiSkipBadge.innerHTML = "<span>🔓</span><span>Seeking Unlocked</span>";
    }
    if (quizBanner) {
      quizBanner.className = "mt-6 p-5 rounded-3xl border transition-all duration-300 bg-emerald-950/40 border-emerald-800/60 shadow-lg";
      const iconContainer = quizBanner.querySelector("div.w-12");
      if (iconContainer) {
        iconContainer.className = "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
        iconContainer.innerHTML = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
      }
    }
    if (startQuizBtn) {
      startQuizBtn.disabled = false;
      startQuizBtn.className = "w-full sm:w-auto px-6 py-3 rounded-2xl font-bold text-sm transition flex items-center justify-center space-x-2 shrink-0 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 btn-unlock-ready";
      startQuizBtn.innerHTML = `<span>Take Post-Video Quiz</span><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>`;
    }

    // Trigger toast
    if (window.app && window.app.showToast) {
      window.app.showToast("🎉 Video finished! Post-video assessment is now unlocked.", "success");
    }
  }
}

window.videoPlayer = new VideoPlayerController();
