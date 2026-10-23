import Axios from 'axios';
import msgpack from 'msgpack-lite';
import Socket from '../websocket';

const API_BASE_PATH = process.env.API_BASE_PATH;

let api = Axios.create({
  baseURL: API_BASE_PATH,
  timeout: 10000,
});

function getRID() {
  return `${new Date().getTime()}${Math.floor(Math.random() * (9999 - 100)) + 100}`;
}

// Generic store because I don't want to have Vue and Vuex
// bundled with the audio player.  It creates too much
// overhead and it's overkill for the purposes of the player
class Store {
  constructor() {
    this.state = {
      adFreeAudio: false,
      audio: false,
      cacheBust: false,
      color: '#FFFFFE',
      currentRate: 1,
      currentTime: 0,
      distributionChannels: [],
      duration: 0.1,
      episode: false,
      episodeList: {},
      hasPlayed: false,
      height: 200, // Default height
      hideShareSubscribeButtons: false,
      isDark: false,
      isLegacy: false,
      isLoaded: false,
      isMuted: false,
      isPlaying: false,
      isScrubbing: false,
      isWaiting: false,
      loaded: 0,
      playlist: false,
      playStart: 0,
      podcast: {},
      recast: {},
      scrubStart: 0,
      secondsPlayed: {},
      showShare: false,
      showSubscribe: false,
      size: 'size-normal',
      volume: 0.5,
      waveform: false,
      websocket: false,
    };

    window.addEventListener('unload', (event) => {
      this.sendPlayEvent();
      this.sendCompleteEvent();
    });
    window.addEventListener('blur', (event) => {
      if (this.state.isPlaying) {
        this.sendPlayEvent();
      }
    });
    window.addEventListener('focus', (event) => {
      if (this.state.isPlaying) {
        this.sendPlayEvent();
      }
    });
  }

  /* ACTIONS */

  getDistributionChannels(path) {
    api.get(path).then((res) => {
      this.setDistributionChannels(res.data.collection);

      return res.data;
    });
  }

  async getEpisode(episodeId) {
    await api
      .get(`/episodes/${episodeId}/player`)
      .then((res) => {
        this.setEpisode(res.data);
        this.getEpisodeWaveform(res.data);
        // TODO: when podcast/distro info is deprecated from the route this if statement can be removed
        if (res.data.podcast) {
          this.setPodcast(res.data.podcast);
          this.setDistributionChannels(res.data.distribution_channels.collection);
        } else if (res.data.podcast_id) {
          this.getPodcast(res.data.podcast_id);
        }

        return res.data;
      })
      .catch(() => {
        this.setIsLoaded(true);
      });
  }

  getEpisodeWaveform(episode) {
    if (!episode || !episode.waveform_pack) {
      this.setEpisodeWaveform(false);
      return;
    }

    let waveformUrl = episode.waveform_pack;

    if (this.state.cacheBust === true) {
      waveformUrl = `${waveformUrl}?${getRID()}=true`;
    }

    api({
      method: 'get',
      url: waveformUrl,
      responseType: 'arraybuffer',
    })
      .then((res) => {
        const array = new Uint8Array(res.data);
        const waveform = msgpack.decode(array);

        this.setEpisodeWaveform(waveform);
      })
      .catch((res) => {
        this.setEpisodeWaveform(false);
        // console.log('error', res)
      });
  }

  // New /episodes/{id}/player endpoint won't have podcast/distribution info
  getPodcast(podcastId) {
    api
      .get(`/podcasts/${podcastId}/playlist`)
      .then((res) => {
        this.setPodcast(res.data);
        this.setDistributionChannels(res.data.distribution_channels.collection);
        return res.data;
      })
      .catch(() => {
        this.setIsLoaded(true);
      });
  }

  getPlaylist(podcastId) {
    api
      .get(`/podcasts/${podcastId}/playlist`)
      .then((res) => {
        if (res.data.embed_player_types.indexOf('playlist') < 0) return;

        this.setPodcast(res.data);
        this.setEpisode(res.data.episodes.collection[0]);
        this.setDistributionChannels(res.data.distribution_channels.collection);
        this.getEpisodeWaveform(res.data.episodes.collection[0]);
        return res.data;
      })
      .catch(() => {
        this.setIsLoaded(true);
      });
  }

  getRecast(recastId) {
    api
      .get(`${process.env.CDN_BASE_PATH}/tokens/recast/${recastId}`)
      .then((res) => {
        this.setRecast(res.data);

        return res.data;
      })
      .catch(() => {
        // this.setIsLoaded(true)
      });
  }

  /* MUTATIONS */
  forward() {
    const jump = 15;
    let newTime = this.state.currentTime + jump;
    newTime = newTime > this.state.duration ? this.state.duration : newTime;

    this.sendPlayEvent();
    this.sendSkipEvent(Math.floor(this.state.currentTime), Math.floor(newTime));

    this.state.playStart = newTime;
    this.setCurrentTime(newTime);
    this.setAudioCurrentTime(newTime);
  }

  rewind() {
    const jump = 15;
    let newTime = this.state.currentTime - jump;
    newTime = newTime < 0 ? 0 : newTime;

    this.sendPlayEvent();
    this.sendSkipEvent(this.state.currentTime, newTime);

    this.state.playStart = newTime;
    this.setCurrentTime(newTime);
    this.setAudioCurrentTime(newTime);
  }

  incrementPlaybackRate() {
    const currentRate = this.state.audio.playbackRate;

    let increment = 0.5;
    if (currentRate === 1.2) {
      increment = 0.3;
    } else if (currentRate === 1) {
      increment = 0.2;
    }

    let newRate = currentRate + increment > 2 ? increment : currentRate + increment;

    this.sendPlayEvent();

    this.state.audio.playbackRate = newRate;
    this.state.currentRate = newRate;
  }

  openWebsocket(websocketPath) {
    Socket.open(websocketPath);
  }

  isIeEdge() {
    // 9, 10, 11, Edge
    if (
      this.state.episode &&
      this.state.episode.podcast &&
      this.state.episode.podcast.id === 'a9af4295-0276-4d99-910b-a3ea320979c2'
    ) {
      if (/MSIE 10/i.test(navigator.userAgent)) return true;
      if (/MSIE 9/i.test(navigator.userAgent) || /rv:11.0/i.test(navigator.userAgent)) return true;
      if (/Edge\/\d./i.test(navigator.userAgent)) return true;
    }

    return false;
  }

  // I might want to move these into the Socket file
  sendCompleteEvent() {
    const secondsPlayed = Object.keys(this.state.secondsPlayed).length;
    const percentPlayed = secondsPlayed / Math.floor(this.state.duration);
    const embedLocation =
      window.location !== window.parent.location ? document.referrer : document.location.href;

    Socket.send({
      action: 'complete',
      eventData: {
        event: 'COMPLETE',
        episode: this.state.episode.id,
        user_agent: window.navigator.userAgent,
        completion_percent: Math.min(1, percentPlayed),
        embed_location: embedLocation,
        timecode: Math.floor(this.state.currentTime),
      },
    });
  }

  sendPlayEvent() {
    const embedLocation =
      window.location !== window.parent.location ? document.referrer : document.location.href;

    Socket.send({
      action: 'play',
      eventData: {
        event: 'LISTEN',
        user_agent: window.navigator.userAgent,
        episode: this.state.episode.id,
        segment: {
          start: Math.floor(this.state.playStart),
          end: Math.floor(this.state.currentTime),
        },
        playback_speed: this.state.currentRate,
        embed_location: embedLocation,
        episode_total_length: Math.floor(this.state.duration),
      },
    });

    this.state.playStart = this.state.currentTime;
  }

  sendScrubEvent() {
    Socket.send({
      action: 'scrub',
      eventData: {
        event: 'SCRUB',
        episode: this.state.episode.id,
        user_agent: window.navigator.userAgent,
        from_timecode: Math.floor(this.scrubStart),
        to_timecode: Math.floor(this.state.currentTime),
      },
    });

    this.scrubStart = this.state.currentTime;
  }

  sendShareSubscribeEvent(type, shareEvent, shareService) {
    Socket.send({
      action: type,
      eventData: {
        event: shareEvent,
        episode: this.state.episode.id,
        user_agent: window.navigator.userAgent,
        service: shareService,
        timecode: this.state.currentTime,
      },
    });
  }

  sendSkipEvent(from, to) {
    Socket.send({
      action: 'skip',
      eventData: {
        event: 'SKIP',
        episode: this.state.episode.id,
        user_agent: window.navigator.userAgent,
        from_timecode: from,
        to_timecode: to,
      },
    });
  }
  // END

  setAdFreeAudio(adFreeAudio) {
    this.state.adFreeAudio = adFreeAudio;
  }

  // The 'audio' is the audio tag and we're merging a
  // few additional, custom parameters
  setAudio(audio) {
    this.state.audio = audio;
  }

  setAudioSrc(src) {
    if (src && this.state.audio !== false && this.state.audio.src !== src) {
      // this.state.audio.crossOrigin = 'anonymous'
      this.state.audio.preload = 'none';

      if (this.state.podcast.is_private) {
        this.state.audio.src = src;
      } else {
        if (src.indexOf('?') >= 0) {
          src = `${src}&aid=embed`;
        } else {
          src = `${src}?aid=embed`;
        }

        if (this.state.cacheBust === true) {
          src = `${src}&${getRID()}=true`;
        }
        this.state.audio.src = src;
      }
    }
  }

  setCacheBust(cacheBust) {
    this.state.cacheBust = cacheBust;
  }

  setColor(color) {
    let newColor = color ? `#${color.replace('#', '')}` : '';

    if (!newColor || newColor === '') {
      newColor = this.state.isDark ? '#0F0F0F' : '#FFFFFE';
    }

    this.state.color = newColor;
  }

  setAudioCurrentTime(currentTime) {
    this.state.audio.currentTime = currentTime;
  }

  setCurrentTime(currentTime) {
    if (this.state.isPlaying && !this.state.isScrubbing) {
      this.state.secondsPlayed[Math.floor(currentTime)] = Math.floor(currentTime);
    }

    if (this.state.isScrubbing) {
      this.state.playStart = currentTime;
    }

    this.state.currentTime = currentTime;
  }

  setDistributionChannels(channels) {
    this.state.distributionChannels = channels;
  }

  setDuration(duration) {
    this.state.duration = duration > 0 ? duration : 0.1;
  }

  setEpisode(episode) {
    this.state.episode = episode;

    // Don't set src for IE/Edge since preload="none" is broken
    if (!this.isIeEdge()) {
      this.setAudioSrc(episode.enclosure_url);
    }

    this.setDuration(episode.duration);
    this.setIsLoaded(true);
  }

  setEpisodeWaveform(waveform) {
    this.state.waveform = waveform;
  }

  setHasPlayed(hasPlayed) {
    this.state.hasPlayed = hasPlayed;
  }

  setIsDark(isDark) {
    this.state.isDark = isDark === 'true' || isDark === true;
  }

  setHideShareSubscribeButtons(hideShare) {
    this.state.hideShareSubscribeButtons = hideShare === 'true' || hideShare === true;
  }

  setIsLegacy(isLegacy) {
    this.state.isLegacy = isLegacy === 'true' || isLegacy === true;
  }

  setIsLoaded(loaded) {
    this.state.isLoaded = loaded;
  }

  setIsPlaying(playing) {
    if (playing) {
      if (playing !== this.state.isPlaying) {
        this.state.playStart = this.state.currentTime;
      }
      this.setHasPlayed(true);
    } else {
      this.sendPlayEvent();
    }

    this.state.isPlaying = playing;
  }

  setIsScrubbing(isScrubbing) {
    if (isScrubbing) {
      this.scrubStart = this.state.currentTime;

      this.sendPlayEvent();
    } else {
      this.sendScrubEvent();
    }

    this.state.isScrubbing = isScrubbing;
  }

  setIsWaiting(waiting) {
    this.state.isWaiting = waiting;
  }

  setLoaded(loaded) {
    this.state.loaded = loaded;
  }

  setLoop(loop) {
    if (this.state.audio) {
      this.state.audio.loop = loop;
    }
  }

  setMute(mute) {
    this.state.isMuted = mute;

    if (mute) {
      this.state.audio.volume = 0;
    } else {
      this.state.audio.volume = this.state.volume;
    }
  }

  setPlaybackRate(rate) {
    this.state.audio.playbackRate = rate;
  }

  setPodcast(podcast) {
    this.state.podcast = podcast;
    this.setSize(this.state.height);
  }

  setRecast(recast) {
    this.state.recast = recast;
  }

  setShowShare(showShare) {
    this.state.showShare = showShare;
  }

  setShowSubscribe(showSubscribe) {
    this.state.showSubscribe = showSubscribe;
  }

  setSize(height) {
    let size = 'size-normal';
    const hasSlim = this.state.podcast.embed_player_types
      ? this.state.podcast.embed_player_types.indexOf('slim') > -1
      : true;

    // Check if the mini is available on the plan
    // Set to a slightly larger than mini required size in case of weird zoom
    if (height <= 60 && hasSlim) {
      size = 'size-mini';
    }

    this.state.height = height;
    this.state.size = size;
  }

  setVolume(volume) {
    this.state.audio.volume = volume;
  }

  setWebsocketPath(websocketPath) {
    this.state.websocket = websocketPath !== '' ? websocketPath : false;

    Socket.websocketPath = websocketPath;
  }
}

export default Store;
