<template>
  <div
    ref="scrubberWaveform"
    :class="{dark: isDark, disabled: !epi.enclosure_url}"
    class="scrubber-waveform"
    @mousedown.prevent="start"
    @mouseout.prevent="hoverStop"
    @mouseover.prevent="hoverStart"
    @mouseup.prevent="stop"
    @touchstart.prevent="start"
    @touchend.prevent="stop"
  >
    <div v-if="epi">
      <TimeCurrent :store="store" />
      <TimeTotal :store="store" />

      <!-- Time Progress -->
      <svg
        :class="{'no-waveform': !waveform}"
        :height="height"
        :width="widthTime"
        aria-hidden="true"
        class="scrubber-time"
      >
        <rect
          v-if="!waveform"
          :height="emptyHeight"
          :width="widthTime"
          :y="height / 2 - emptyHeight / 2"
        />
        <path v-else :d="peaks" />
      </svg>

      <!-- Hover Progress -->
      <div v-if="!isLegacy" class="scrubber-hover">
        <div
          v-if="size !== 'size-mini'"
          :style="{left: `${widthHover * 100}%`}"
          class="scrubber-hover-recast"
          @mousedown.prevent.stop="recast"
          @touchstart.prevent.stop="recast"
        >
          Recast <IconRecast />
        </div>
        <svg
          :class="{'no-waveform': !waveform}"
          :height="height"
          :width="`${widthHover * 100}%`"
          aria-hidden="true"
        >
          <rect
            v-if="!waveform"
            :height="emptyHeight"
            :width="widthLoader"
            :y="height / 2 - emptyHeight / 2"
          />
          <path v-else :d="peaks" />
        </svg>
      </div>

      <!-- Loader Progress -->
      <svg
        :class="{'no-waveform': !waveform}"
        :height="height"
        :width="widthLoader"
        class="scrubber-loader"
        aria-hidden="true"
      >
        <rect
          v-if="!waveform"
          :height="emptyHeight"
          :width="widthLoader"
          :y="height / 2 - emptyHeight / 2"
        />
        <path v-else :d="peaks" />
      </svg>

      <!-- Background -->
      <svg
        :class="{'no-waveform': !waveform}"
        :height="height"
        class="scrubber-bg"
        aria-hidden="true"
      >
        <rect
          v-if="!waveform"
          :height="emptyHeight"
          :y="height / 2 - emptyHeight / 2"
          width="100%"
        />
        <path v-else :d="peaks" />
      </svg>
    </div>
    <div v-else :class="{'waveform-placeholder': true, [size]: size}" aria-hidden="true" />
  </div>
</template>

<script>
import {line, curveLinear} from 'd3-shape';
import {scaleLinear} from 'd3-scale';
import IconRecast from '../assets/svg/recast.svg';
import Time from '../helpers/Time';
import Peaks from '../helpers/Peaks.js';
import TimeCurrent from './TimeCurrent';
import TimeTotal from './TimeTotal';

export default {
  components: {
    IconRecast,
    TimeCurrent,
    TimeTotal,
  },
  props: {
    store: {
      type: Object,
      default: function () {},
    },
  },
  data() {
    return {
      emptyHeight: 8,
      height: 40,
      width: 300,
      widthHover: 0,
    };
  },
  computed: {
    audio() {
      return this.store.state.audio;
    },
    currentTime() {
      return this.store.state.currentTime;
    },
    duration() {
      return this.store.state.duration;
    },
    epi() {
      return this.store.state.episode;
    },
    isDark() {
      return this.store.state.isDark;
    },
    isLegacy() {
      return this.store.state.isLegacy;
    },
    loaded() {
      return this.store.state.loaded;
    },
    isNormal() {
      return this.store.state.size === 'size-normal' && !this.store.state.isLegacy;
    },
    peaks() {
      if (!this.waveform) return false;

      // Resample to our target width
      const samplesPerPixel = Math.max(Math.round((this.waveform.length / this.width) * 2), 1);
      const peaks = Peaks.resample(this.waveform, samplesPerPixel);
      const largest = Math.max.apply(null, peaks);

      const y = scaleLinear()
        .domain([0, largest / 3200])
        .range([this.height / 2.75, 0]);

      const x = scaleLinear().domain([0, peaks.length]).rangeRound([0, this.width]);

      // Zero to height
      const top = peaks.map((d, i) => [x(i), Math.round(y(d / 3200))]);

      // Zero to height reversed
      const bottom = top.map((d) => [d[0], this.height - d[1]]).reverse();

      return line().curve(curveLinear)(top.concat(bottom));
    },
    size() {
      return this.store.state.size;
    },
    uid() {
      return this.store.state.episode.legacy_token || this.store.state.episode.id;
    },
    waveform() {
      return this.store.state.waveform;
    },
    widthLoader() {
      return Math.floor(this.loaded * this.width);
    },
    widthTime() {
      return Math.floor((this.currentTime / this.duration) * this.width);
    },
  },
  watch: {
    'store.state.size'(val) {
      this.resize();
    },
    'store.state.waveform'(val) {
      this.resize();
    },
  },
  created() {
    window.addEventListener('resize', this.resize);
  },
  destroyed() {
    window.removeEventListener('resize', this.resize);
  },
  mounted() {
    this.setHeight();
    this.setWidth();
  },
  methods: {
    attachListeners() {
      document.addEventListener('mousemove', this.move);
      document.addEventListener('touchmove', this.move);
      document.addEventListener('mouseup', this.stop);
      document.addEventListener('touchend', this.stop);
    },
    attachHoverListeners() {
      document.addEventListener('mousemove', this.hoverMove);
    },
    detachListeners() {
      document.removeEventListener('mousemove', this.move);
      document.removeEventListener('touchmove', this.move);
      document.removeEventListener('mouseup', this.stop);
      document.removeEventListener('touchend', this.stop);
    },
    detachHoverListeners() {
      document.removeEventListener('mousemove', this.hoverMove);
    },
    getOffset(pageX) {
      return Math.min(1, Math.max((pageX - this.left) / this.width, 0));
    },
    getTouchPageX(e) {
      return e.touches[0] && e.touches[0].pageX ? e.touches[0].pageX : null;
    },
    hoverMove(e) {
      this.setHoverOffset(e.pageX || this.getTouchPageX(e));
    },
    hoverStart(e) {
      if (!this.epi.enclosure_url) return;
      this.attachHoverListeners();
      this.setBounds(e);
      this.setHoverOffset(e.pageX || this.getTouchPageX(e));
    },
    hoverStop(e) {
      this.detachHoverListeners();
    },
    move(e) {
      this.setOffset(e.pageX || this.getTouchPageX(e));
    },
    recast(e) {
      const recastTime = Time.url(this.widthHover * this.store.state.duration);

      window.open(
        `${process.env.RECAST_BASE_PATH || 'https://recast.simplecast.com'}/${
          this.uid
        }?t=${recastTime}`,
        'simplecast-recast',
      );
    },
    setBounds(e) {
      const rect = this.$refs.scrubberWaveform.getBoundingClientRect();
      const xOffset = window.pageXOffset;

      this.left = rect.left + xOffset;
      // this.width = rect.width
    },
    setHoverOffset(pageX) {
      const offset = this.getOffset(pageX);

      this.widthHover = offset;
    },
    setOffset(pageX) {
      const offset = this.getOffset(pageX) * this.scaledWidth();

      this.store.setCurrentTime(offset * this.store.state.duration);
      this.store.setAudioCurrentTime(offset * this.store.state.duration);
    },
    start(e) {
      if (!this.epi.enclosure_url) return;
      this.store.setIsScrubbing(true);
      this.attachListeners();
      this.setBounds(e);
      this.setOffset(e.pageX || this.getTouchPageX(e));
    },
    stop(e) {
      this.store.setIsScrubbing(false);
      this.detachListeners();
    },
    resize() {
      this.setHeight();
      this.setWidth();
    },
    setHeight() {
      this.height = this.$refs.scrubberWaveform.clientHeight;
    },
    setWidth() {
      this.width = this.$refs.scrubberWaveform.getBoundingClientRect().width * this.scaledWidth();
    },
    scaledSize() {
      const height = window.innerHeight;
      if (this.isNormal && height < 200) {
        return height / 200;
      }
      return 1;
    },
    scaledWidth() {
      const height = window.innerHeight;
      if (this.isNormal && height < 200) {
        const width = window.innerWidth;
        const smallWidth = width * this.scaledSize();
        return width / smallWidth;
      }
      return 1;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~colors';
@import '~fonts';

.scrubber-waveform {
  cursor: pointer;
  height: 100%;

  &.disabled {
    cursor: default;
  }

  .scrubber-time {
    fill: $black-trans-800;
    position: absolute;
    z-index: 4;
  }
  .scrubber-hover {
    opacity: 0;
    position: absolute;
    transition: opacity 0.2s ease-in-out;
    width: 100%;
    z-index: 3;

    .scrubber-hover-recast {
      align-items: center;
      background: $black-800;
      border-radius: 2px;
      color: $white-000;
      display: flex;
      margin-left: -33px;
      padding: 1px 5px 3px;
      position: absolute;
      right: 0;
      top: -15px;
      width: 55px;

      @include font-xs-embed(700);

      &:after {
        background: $black-800;
        content: '';
        display: block;
        height: 100%;
        left: 50%;
        margin-left: -1px;
        position: absolute;
        top: 20px;
        width: 1px;
      }
      svg {
        fill: $white-000;
        height: 12px;
        margin-left: 5px;
      }
    }
    svg {
      fill: $black-trans-600;
    }
  }
  .scrubber-loader {
    fill: $black-trans-400;
    position: absolute;
    z-index: 2;
  }
  .scrubber-bg {
    fill: $black-trans-200;
    width: 100%;
  }
  &:hover {
    .current-time {
      opacity: 1;
    }
    .scrubber-hover {
      opacity: 1;
    }
  }
  .current-time {
    // opacity: 0;
    transition: opacity 0.2s ease-in-out;
  }
  .current-time,
  .total-time {
    z-index: 5;
  }
  &.dark .scrubber-time {
    fill: $white-trans-800;
  }
  &.dark .scrubber-hover {
    fill: $white-trans-600;
  }
  &.dark .scrubber-hover svg {
    fill: $white-trans-400;
  }
  &.dark .scrubber-loader {
    fill: $white-trans-400;
  }
  &.dark .scrubber-bg {
    fill: rgba($white-trans-base, 0.25);
  }
  &.dark .scrubber-hover-recast {
    background: $grey-300;
    color: $black-trans-800;
  }
  &.dark .scrubber-hover-recast svg {
    fill: $black-trans-800;
  }
  &.dark .scrubber-hover-recast:after {
    background: $grey-300;
  }
}

.waveform-placeholder {
  background-color: $grey-300;
  border-radius: 2px;
  cursor: default;
  height: 90%;
  .dark & {
    background-color: $grey-700;
  }
  &.size-mini {
    height: 100%;
  }
}
</style>
