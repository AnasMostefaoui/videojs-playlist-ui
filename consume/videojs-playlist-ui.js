/*! @name videojs-playlist-ui @version 4.1.0 @license Apache-2.0 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('video.js')) :
  typeof define === 'function' && define.amd ? define(['video.js'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.videojsPlaylistUi = factory(global.videojs));
})(this, (function (videojs) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var videojs__default = /*#__PURE__*/_interopDefaultLegacy(videojs);

  var version = "4.1.0";

  const dom = videojs__default["default"].dom || videojs__default["default"];
  const registerPlugin = videojs__default["default"].registerPlugin || videojs__default["default"].plugin; // see https://github.com/Modernizr/Modernizr/blob/master/feature-detects/css/pointerevents.js

  const supportsCssPointerEvents = (() => {
    const element = document.createElement('x');
    element.style.cssText = 'pointer-events:auto';
    return element.style.pointerEvents === 'auto';
  })();

  const defaults = {
    className: 'vjs-playlist',
    playOnSelect: false,
    supportsCssPointerEvents
  }; // we don't add `vjs-playlist-now-playing` in addSelectedClass
  // so it won't conflict with `vjs-icon-play
  // since it'll get added when we mouse out

  const addSelectedClass = function (el) {
    el.addClass('vjs-selected');
  };

  const removeSelectedClass = function (el) {
    el.removeClass('vjs-selected');

    if (el.thumbnail) {
      dom.removeClass(el.thumbnail, 'vjs-playlist-now-playing');
    }
  };

  const upNext = function (el) {
    el.addClass('vjs-up-next');
  };

  const notUpNext = function (el) {
    el.removeClass('vjs-up-next');
  };

  const createThumbnail = function (thumbnail) {
    if (!thumbnail) {
      const placeholder = document.createElement('div');
      placeholder.className = 'vjs-playlist-thumbnail vjs-playlist-thumbnail-placeholder';
      return placeholder;
    }

    const picture = document.createElement('picture');
    picture.className = 'vjs-playlist-thumbnail';

    if (typeof thumbnail === 'string') {
      // simple thumbnails
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.src = thumbnail;
      img.alt = '';
      picture.appendChild(img);
    } else {
      // responsive thumbnails
      // additional variations of a <picture> are specified as
      // <source> elements
      for (let i = 0; i < thumbnail.length - 1; i++) {
        const variant = thumbnail[i];
        const source = document.createElement('source'); // transfer the properties of each variant onto a <source>

        for (const prop in variant) {
          source[prop] = variant[prop];
        }

        picture.appendChild(source);
      } // the default version of a <picture> is specified by an <img>


      const variant = thumbnail[thumbnail.length - 1];
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.alt = '';

      for (const prop in variant) {
        img[prop] = variant[prop];
      }

      picture.appendChild(img);
    }

    return picture;
  };

  const Component = videojs__default["default"].getComponent('Component');

  class PlaylistMenuItem extends Component {
    constructor(player, playlistItem, settings) {
      if (!playlistItem.item) {
        throw new Error('Cannot construct a PlaylistMenuItem without an item option');
      }

      playlistItem.showDescription = settings.showDescription;
      super(player, playlistItem);
      this.item = playlistItem.item;
      this.playOnSelect = settings.playOnSelect;
      this.emitTapEvents();
      this.on(['click', 'tap'], this.switchPlaylistItem_);
      this.on('keydown', this.handleKeyDown_);
    }

    handleKeyDown_(event) {
      // keycode 13 is <Enter>
      // keycode 32 is <Space>
      if (event.which === 13 || event.which === 32) {
        this.switchPlaylistItem_();
      }
    }

    switchPlaylistItem_(event) {
      this.player_.playlist.currentItem(this.player_.playlist().indexOf(this.item));

      if (this.playOnSelect) {
        this.player_.play();
      }
    }

    createEl() {
      const li = document.createElement('li');
      const item = this.options_.item;
      this.options_.showDescription;

      if (typeof item.data === 'object') {
        const dataKeys = Object.keys(item.data);
        dataKeys.forEach(key => {
          const value = item.data[key];
          li.dataset[key] = value;
        });
      }

      li.className = 'vjs-playlist-item';
      li.setAttribute('tabIndex', 0); // Thumbnail image

      this.thumbnail = createThumbnail(item.thumbnail);
      li.appendChild(this.thumbnail); // Now playing

      const nowPlayingEl = document.createElement('span');
      const nowPlayingText = this.localize('Now Playing');
      nowPlayingEl.className = 'vjs-playlist-now-playing-text';
      nowPlayingEl.appendChild(document.createTextNode(nowPlayingText));
      nowPlayingEl.setAttribute('title', nowPlayingText);
      this.thumbnail.appendChild(nowPlayingEl); // Up next

      const upNextEl = document.createElement('span');
      const upNextText = this.localize('Up Next');
      upNextEl.className = 'vjs-up-next-text';
      upNextEl.appendChild(document.createTextNode(upNextText));
      upNextEl.setAttribute('title', upNextText);
      this.thumbnail.appendChild(upNextEl); // Video title

      const titleEl = document.createElement('cite');
      const titleText = item.name || this.localize('Untitled Video');
      titleEl.className = 'vjs-playlist-name';
      titleEl.appendChild(document.createTextNode(titleText));
      titleEl.setAttribute('title', titleText);
      li.appendChild(titleEl); // Duration

      if (item.duration) {
        const durationContainer = document.createElement('div');
        durationContainer.className = 'vjs-playlist-duration-container';
        durationContainer.innerHTML = '<svg class="icon icon--play icon--primary icon--16" viewBox="0 0 20 20" version="1.1" aria-hidden="true"><title>play</title><path class="icon-main-color" d="M0 10a10 10 0 1 1 10 10A10 10 0 0 1 0 10zm7.92 4.27a.48.48 0 0 0 .23-.07L14 10.35a.42.42 0 0 0 0-.7L8.15 5.8a.42.42 0 0 0-.43 0 .4.4 0 0 0-.22.36v7.7a.4.4 0 0 0 .22.36.36.36 0 0 0 .2.05z"></path></svg>';
        const duration = document.createElement('time');
        const time = videojs__default["default"].formatTime(item.duration);
        duration.className = 'vjs-playlist-duration';
        duration.setAttribute('datetime', 'PT0H0M' + item.duration + 'S');
        duration.appendChild(document.createTextNode(time));
        durationContainer.appendChild(duration);
        li.appendChild(durationContainer);
      }

      return li;
    }

  }

  class PlaylistMenu extends Component {
    constructor(player, options) {
      if (!player.playlist) {
        throw new Error('videojs-playlist is required for the playlist component');
      }

      super(player, options);
      this.items = [];

      if (options.horizontal) {
        this.addClass('vjs-playlist-horizontal');
      } else {
        this.addClass('vjs-playlist-vertical');
      } // If CSS pointer events aren't supported, we have to prevent
      // clicking on playlist items during ads with slightly more
      // invasive techniques. Details in the stylesheet.


      if (options.supportsCssPointerEvents) {
        this.addClass('vjs-csspointerevents');
      }

      this.createPlaylist_();

      if (!videojs__default["default"].browser.TOUCH_ENABLED) {
        this.addClass('vjs-mouse');
      }

      this.on(player, ['loadstart', 'playlistchange', 'playlistsorted'], event => {
        this.update();
      }); // Keep track of whether an ad is playing so that the menu
      // appearance can be adapted appropriately

      this.on(player, 'adstart', () => {
        this.addClass('vjs-ad-playing');
      });
      this.on(player, 'adend', () => {
        this.removeClass('vjs-ad-playing');
      });
      this.on('dispose', () => {
        this.empty_();
        player.playlistMenu = null;
      });
      this.on(player, 'dispose', () => {
        this.dispose();
      });
    }

    createEl() {
      return dom.createEl('div', {
        className: this.options_.className
      });
    }

    empty_() {
      if (this.items && this.items.length) {
        this.items.forEach(i => i.dispose());
        this.items.length = 0;
      }
    }

    createPlaylist_() {
      const playlist = this.player_.playlist() || [];
      let list = this.el_.querySelector('.vjs-playlist-item-list');
      let overlay = this.el_.querySelector('.vjs-playlist-ad-overlay');

      if (!list) {
        list = document.createElement('ol');
        list.className = 'vjs-playlist-item-list';
        this.el_.appendChild(list);
      }

      this.empty_(); // create new items

      for (let i = 0; i < playlist.length; i++) {
        const item = new PlaylistMenuItem(this.player_, {
          item: playlist[i]
        }, this.options_);
        this.items.push(item);
        list.appendChild(item.el_);
      } // Inject the ad overlay. We use this element to block clicks during ad
      // playback and darken the menu to indicate inactivity


      if (!overlay) {
        overlay = document.createElement('li');
        overlay.className = 'vjs-playlist-ad-overlay';
        list.appendChild(overlay);
      } else {
        // Move overlay to end of list
        list.appendChild(overlay);
      } // select the current playlist item


      const selectedIndex = this.player_.playlist.currentItem();

      if (this.items.length && selectedIndex >= 0) {
        addSelectedClass(this.items[selectedIndex]);
        const thumbnail = this.items[selectedIndex].$('.vjs-playlist-thumbnail');

        if (thumbnail) {
          dom.addClass(thumbnail, 'vjs-playlist-now-playing');
        }
      }
    }

    update() {
      // replace the playlist items being displayed, if necessary
      const playlist = this.player_.playlist();

      if (this.items.length !== playlist.length) {
        // if the menu is currently empty or the state is obviously out
        // of date, rebuild everything.
        this.createPlaylist_();
        return;
      }

      for (let i = 0; i < this.items.length; i++) {
        if (this.items[i].item !== playlist[i]) {
          // if any of the playlist items have changed, rebuild the
          // entire playlist
          this.createPlaylist_();
          return;
        }
      } // the playlist itself is unchanged so just update the selection


      const currentItem = this.player_.playlist.currentItem();

      for (let i = 0; i < this.items.length; i++) {
        const item = this.items[i];

        if (i === currentItem) {
          addSelectedClass(item);

          if (document.activeElement !== item.el()) {
            dom.addClass(item.thumbnail, 'vjs-playlist-now-playing');
          }

          notUpNext(item);
        } else if (i === currentItem + 1) {
          removeSelectedClass(item);
          upNext(item);
        } else {
          removeSelectedClass(item);
          notUpNext(item);
        }
      }
    }

  }
  /**
   * Returns a boolean indicating whether an element has child elements.
   *
   * Note that this is distinct from whether it has child _nodes_.
   *
   * @param  {HTMLElement} el
   *         A DOM element.
   *
   * @return {boolean}
   *         Whether the element has child elements.
   */


  const hasChildEls = el => {
    for (let i = 0; i < el.childNodes.length; i++) {
      if (dom.isEl(el.childNodes[i])) {
        return true;
      }
    }

    return false;
  };
  /**
   * Finds the first empty root element.
   *
   * @param  {string} className
   *         An HTML class name to search for.
   *
   * @return {HTMLElement}
   *         A DOM element to use as the root for a playlist.
   */


  const findRoot = className => {
    const all = document.querySelectorAll('.' + className);
    let el;

    for (let i = 0; i < all.length; i++) {
      if (!hasChildEls(all[i])) {
        el = all[i];
        break;
      }
    }

    return el;
  };
  /**
   * Initialize the plugin on a player.
   *
   * @param  {Object} [options]
   *         An options object.
   *
   * @param  {HTMLElement} [options.el]
   *         A DOM element to use as a root node for the playlist.
   *
   * @param  {string} [options.className]
   *         An HTML class name to use to find a root node for the playlist.
   *
   * @param  {boolean} [options.playOnSelect = false]
   *         If true, will attempt to begin playback upon selecting a new
   *         playlist item in the UI.
   */


  const playlistUi = function (options) {
    const player = this;

    if (!player.playlist) {
      throw new Error('videojs-playlist plugin is required by the videojs-playlist-ui plugin');
    }

    if (dom.isEl(options)) {
      videojs__default["default"].log.warn('videojs-playlist-ui: Passing an element directly to playlistUi() is deprecated, use the "el" option instead!');
      options = {
        el: options
      };
    }

    options = videojs__default["default"].mergeOptions(defaults, options); // If the player is already using this plugin, remove the pre-existing
    // PlaylistMenu, but retain the element and its location in the DOM because
    // it will be re-used.

    if (player.playlistMenu) {
      const el = player.playlistMenu.el(); // Catch cases where the menu may have been disposed elsewhere or the
      // element removed from the DOM.

      if (el) {
        const parentNode = el.parentNode;
        const nextSibling = el.nextSibling; // Disposing the menu will remove `el` from the DOM, but we need to
        // empty it ourselves to be sure.

        player.playlistMenu.dispose();
        dom.emptyEl(el); // Put the element back in its place.

        if (nextSibling) {
          parentNode.insertBefore(el, nextSibling);
        } else {
          parentNode.appendChild(el);
        }

        options.el = el;
      }
    }

    if (!dom.isEl(options.el)) {
      options.el = findRoot(options.className);
    }

    player.playlistMenu = new PlaylistMenu(player, options);
  }; // register components


  videojs__default["default"].registerComponent('PlaylistMenu', PlaylistMenu);
  videojs__default["default"].registerComponent('PlaylistMenuItem', PlaylistMenuItem); // register the plugin

  registerPlugin('playlistUi', playlistUi);
  playlistUi.VERSION = version;
  videojs__default["default"].addLanguage('ar', {
    'Next playlist item': '\u0639\u0646\u0635\u0631 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u062a\u0627\u0644\u064a',
    'Up next in {1} seconds': '\u0627\u0644\u062a\u0627\u0644\u064a \u062e\u0644\u0627\u0644 {1} \u062b\u0648\u0627\u0646',
    'Up next': '\u0627\u0644\u062a\u0627\u0644\u064a',
    'Now Playing': 'يعرض الآن',
    'Up Next': '\u0627\u0644\u062a\u0627\u0644\u064a',
    'Untitled Video': '\u0645\u0642\u0637\u0639 \u0641\u064a\u062f\u064a\u0648 \u0628\u062f\u0648\u0646 \u0639\u0646\u0648\u0627\u0646'
  });
  videojs__default["default"].addLanguage('de', {
    'Next playlist item': 'N\xe4chstes Objekt der Wiedergabeliste',
    'Up next in {1} seconds': 'N\xe4chstes in {1} Sekunden',
    'Up next': 'Als N\xe4chstes',
    'Now Playing': 'Aktuelle Wiedergabe',
    'Up Next': 'Als N\xe4chstes',
    'Untitled Video': 'Video ohne Titel'
  });
  videojs__default["default"].addLanguage('es', {
    'Next playlist item': 'Siguiente t\xedtulo de la lista de reproducci\xf3n',
    'Up next in {1} seconds': 'Siguiente en {1} segundos',
    'Up next': 'Siguiente',
    'Now Playing': 'Reproduciendo',
    'Up Next': 'Siguiente',
    'Untitled Video': 'V\xeddeo sin t\xedtulo'
  });
  videojs__default["default"].addLanguage('fr', {
    'Next playlist item': 'Prochain \xe9l\xe9ment de la liste de lecture',
    'Up next in {1} seconds': '\xc0 suivre dans {1} secondes',
    'Up next': '\xc0 suivre',
    'Now Playing': 'En cours de lecture',
    'Up Next': '\xc0 suivre',
    'Untitled Video': 'Vid\xe9o sans titre'
  });
  videojs__default["default"].addLanguage('ja', {
    'Next playlist item': '\u6b21\u306e\u30d7\u30ec\u30a4\u30ea\u30b9\u30c8\u9805\u76ee',
    'Up next in {1} seconds': '{1} \u79d2\u5f8c\u306b\u6b21\u306e\u52d5\u753b',
    'Up next': '\u6b21\u306e\u52d5\u753b',
    'Now Playing': '\u73fe\u5728\u518d\u751f\u4e2d',
    'Up Next': '\u6b21\u306e\u52d5\u753b',
    'Untitled Video': '\u7121\u984c\u306e\u52d5\u753b'
  });
  videojs__default["default"].addLanguage('ko', {
    'Next playlist item': '\ub2e4\uc74c \uc7ac\uc0dd \ubaa9\ub85d \ud56d\ubaa9',
    'Up next in {1} seconds': '{1}\ucd08 \ud6c4 \ub2e4\uc74c \uc7ac\uc0dd',
    'Up next': '\ub2e4\uc74c \uc7ac\uc0dd',
    'Now Playing': '\uc9c0\uae08 \uc7ac\uc0dd \uc911',
    'Up Next': '\ub2e4\uc74c \uc7ac\uc0dd',
    'Untitled Video': '\uc81c\ubaa9 \uc5c6\ub294 \ube44\ub514\uc624'
  });
  videojs__default["default"].addLanguage('zh-Hans', {
    'Next playlist item': '\u4e0b\u4e00\u4e2a\u64ad\u653e\u5217\u8868\u9879\u76ee',
    'Up next in {1} seconds': '{1} \u79d2\u540e\u64ad\u653e\u4e0b\u4e00\u4e2a',
    'Up next': '\u64ad\u653e\u4e0b\u4e00\u4e2a',
    'Now Playing': '\u6b63\u5728\u64ad\u653e',
    'Up Next': '\u64ad\u653e\u4e0b\u4e00\u4e2a',
    'Untitled Video': '\u65e0\u6807\u9898\u89c6\u9891'
  });
  videojs__default["default"].addLanguage('zh-Hant', {
    'Next playlist item': '\u4e0b\u4e00\u500b\u64ad\u653e\u6e05\u55ae\u9805\u76ee',
    'Up next in {1} seconds': '{1} \u79d2\u5f8c\u64ad\u653e\u4e0b\u4e00\u500b',
    'Up next': '\u64ad\u653e\u4e0b\u4e00\u500b',
    'Now Playing': '\u6b63\u5728\u64ad\u653e',
    'Up Next': '\u64ad\u653e\u4e0b\u4e00\u500b',
    'Untitled Video': '\u672a\u547d\u540d\u8996\u8a0a'
  });

  return playlistUi;

}));
