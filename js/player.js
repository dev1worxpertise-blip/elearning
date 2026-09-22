/**
 * LearnPulse E-Learning Platform - Video Player & Watch Tracker
 * Controls video playback, watch-time gating, and post-video assessment unlock triggers.
 */

class VideoPlayerController {
  constructor() {
    this.currentModule = null;
    this.videoElement = null;
    this.playbackSpeed = 1.0;
  }

  init(containerId, moduleData) {
    this.currentModule = moduleData;
    const container = document.getElementById(containerId);
    if (!container) return;

    const isWatched = window.appState.isVideoFinished(moduleData.id);
    const initialPercent = window.appState.getVideoPercent(moduleData.id);

    container.innerHTML = `
      <div class="video-wrapper bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
        <!-- Video Source (HTML5 with Fallback) -->
        <div class="relative w-full aspect-video bg-black flex items-center justify-center">
          <video 
            id="mainLessonVideo" 
            class="w-full h-full object-contain"
            playsinline
            preload="metadata"
            poster="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80"
          >
            <source src="${moduleData.videoUrl}" type="video/mp4">
            Your browser does not support HTML5 video streaming.
          </video>

          <!-- Big Play Overlay if paused -->
          <button id="videoPlayOverlay" class="absolute inset-0 m-auto w-20 h-20 bg-[#dd1f36]/90 hover:bg-[#dd1f36] text-white rounded-full flex items-center justify-center shadow-2xl transition transform hover:scale-110 active:scale-95 focus:outline-none z-10 backdrop-blur-sm">
            <svg class="w-10 h-10 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </button>
        </div>

        <!-- Custom Player Control Bar -->
        <div class="p-4 bg-slate-900/95 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center space-x-3">
            <button id="ctrlPlayPause" class="p-2.5 rounded-lg bg-[#dd1f36] hover:bg-[#b81427] text-white transition">
              <svg id="playIcon" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              <svg id="pauseIcon" class="w-5 h-5 hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            </button>
            <span id="timeDisplay" class="text-sm font-mono text-slate-400">00:00 / --:--</span>
          </div>

          <!-- Video Watch Status Badge -->
          <div class="flex items-center space-x-3">
            <div id="videoWatchBadge" class="flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold ${isWatched ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}">
              <span class="w-2 h-2 rounded-full ${isWatched ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'}"></span>
              <span id="videoWatchText">${isWatched ? 'Video Completed ✓' : `Watching (${initialPercent}%)`}</span>
            </div>

            <!-- Fast-Track / Test Mode Button -->
            <button 
              id="btnFastTrack" 
              title="Instantly mark this video as watched to unlock the Q&A quiz immediately" 
              class="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-[#dd1f36] transition flex items-center space-x-1.5 font-medium"
            >
              <svg class="w-3.5 h-3.5 text-[#dd1f36]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              <span>Instant Complete (Test Mode)</span>
            </button>
          </div>

          <!-- Controls Right: Speed & Fullscreen -->
          <div class="flex items-center space-x-2">
            <select id="ctrlSpeed" class="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-[#dd1f36] focus:outline-none">
              <option value="0.75">0.75x</option>
              <option value="1.0" selected>1.0x Normal</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2.0">2.0x</option>
            </select>
            <button id="ctrlFullscreen" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
            </button>
          </div>
        </div>

        <!-- Video Progress scrubber bar -->
        <div class="w-full bg-slate-800 h-1.5 cursor-pointer relative" id="videoProgressBarContainer">
          <div id="videoProgressBar" class="h-full bg-[#dd1f36] transition-all duration-150" style="width: ${initialPercent}%"></div>
        </div>
      </div>

      <!-- Unlock Q&A Callout Card -->
      <div id="quizUnlockBanner" class="mt-6 p-5 rounded-2xl border transition-all duration-300 ${isWatched ? 'bg-emerald-950/40 border-emerald-800/60 shadow-lg' : 'bg-slate-900 border-slate-800'}">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isWatched ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'}">
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
                  ? 'Video completed! Take the 4-question interactive Q&A assessment to verify your understanding (80% passing grade required).' 
                  : 'Watch the entire video lesson or click "Instant Complete" above to unlock the required Q&A assessment.'}
              </p>
            </div>
          </div>

          <button 
            id="btnStartQuiz" 
            ${!isWatched ? 'disabled' : ''} 
            class="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm transition flex items-center justify-center space-x-2 shrink-0 ${isWatched ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 btn-unlock-ready' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}"
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
    const btnStartQuiz = document.getElementById("btnStartQuiz");

    if (!this.videoElement) return;

    const togglePlay = () => {
      if (this.videoElement.paused) {
        this.videoElement.play().catch(e => console.log("Auto-play restricted:", e));
        playOverlay.classList.add("hidden");
        playIcon.classList.add("hidden");
        pauseIcon.classList.remove("hidden");
      } else {
        this.videoElement.pause();
        playOverlay.classList.remove("hidden");
        playIcon.classList.remove("hidden");
        pauseIcon.classList.add("hidden");
      }
    };

    playOverlay.addEventListener("click", togglePlay);
    playPauseBtn.addEventListener("click", togglePlay);
    this.videoElement.addEventListener("click", togglePlay);

    // Format time (seconds -> MM:SS)
    const formatTime = (secs) => {
      if (isNaN(secs)) return "00:00";
      const m = Math.floor(secs / 60).toString().padStart(2, '0');
      const s = Math.floor(secs % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    };

    // Time update listener
    this.videoElement.addEventListener("timeupdate", () => {
      const current = this.videoElement.currentTime;
      const duration = this.videoElement.duration || 1;
      const percent = Math.min(100, (current / duration) * 100);

      timeDisplay.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
      progressBar.style.width = `${percent}%`;

      // Record state
      window.appState.recordVideoProgress(this.currentModule.id, percent, percent >= 98);

      // Update badge
      const watchText = document.getElementById("videoWatchText");
      if (watchText && !window.appState.isVideoFinished(this.currentModule.id)) {
        watchText.textContent = `Watching (${Math.round(percent)}%)`;
      }
    });

    // On Video Ended
    this.videoElement.addEventListener("ended", () => {
      this.onVideoCompleted();
    });

    // Speed selector
    speedSelect.addEventListener("change", (e) => {
      this.playbackSpeed = parseFloat(e.target.value);
      this.videoElement.playbackRate = this.playbackSpeed;
    });

    // Fullscreen
    fullscreenBtn.addEventListener("click", () => {
      if (!document.fullscreenElement) {
        this.videoElement.requestFullscreen().catch(err => alert(err.message));
      } else {
        document.exitFullscreen();
      }
    });

    // Seek via progress container click
    progressContainer.addEventListener("click", (e) => {
      const rect = progressContainer.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const ratio = clickX / rect.width;
      if (this.videoElement.duration) {
        this.videoElement.currentTime = ratio * this.videoElement.duration;
      }
    });

    // Instant Fast-Track Button (for quick testing of the certification flow)
    btnFastTrack.addEventListener("click", () => {
      this.onVideoCompleted();
    });

    // Start Quiz button
    btnStartQuiz.addEventListener("click", () => {
      if (window.appState.isVideoFinished(this.currentModule.id)) {
        window.quizController.openQuiz(this.currentModule);
      }
    });
  }

  onVideoCompleted() {
    window.appState.recordVideoProgress(this.currentModule.id, 100, true);

    const watchBadge = document.getElementById("videoWatchBadge");
    const watchText = document.getElementById("videoWatchText");
    const quizBanner = document.getElementById("quizUnlockBanner");
    const startQuizBtn = document.getElementById("btnStartQuiz");

    if (watchBadge) {
      watchBadge.className = "flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
    }
    if (watchText) {
      watchText.textContent = "Video Completed ✓";
    }
    if (quizBanner) {
      quizBanner.className = "mt-6 p-5 rounded-2xl border transition-all duration-300 bg-emerald-950/40 border-emerald-800/60 shadow-lg";
      const iconContainer = quizBanner.querySelector("div.w-12");
      if (iconContainer) {
        iconContainer.className = "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
        iconContainer.innerHTML = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
      }
    }
    if (startQuizBtn) {
      startQuizBtn.disabled = false;
      startQuizBtn.className = "w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm transition flex items-center justify-center space-x-2 shrink-0 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 btn-unlock-ready";
      startQuizBtn.innerHTML = `<span>Take Post-Video Quiz</span><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>`;
    }

    // Trigger subtle celebratory toast
    window.app.showToast("🎉 Video finished! Post-video assessment is now unlocked.", "success");
  }
}

window.videoPlayer = new VideoPlayerController();
