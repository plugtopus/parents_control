(function (modules) {
	var installedModules = {};

	function __webpack_require__(moduleId) {
		if (installedModules[moduleId])
			return installedModules[moduleId].exports;
		var module = installedModules[moduleId] = {
			exports: {},
			id: moduleId,
			loaded: !1
		};
		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
		module.loaded = !0;
		return module.exports
	}
	__webpack_require__.m = modules;
	__webpack_require__.c = installedModules;
	__webpack_require__.p = "";
	return __webpack_require__(0)
})([(function (module, exports, __webpack_require__) {
	'use strict';
	var blocker = __webpack_require__(1);

	function makeAsocialBlock() {
		var ASOCIAL_BLOCK = document.createElement('div');
		ASOCIAL_BLOCK.classList.add('asocial_block');
		ASOCIAL_BLOCK.textContent = chrome.i18n.getMessage('motivateMessage');
		return ASOCIAL_BLOCK
	}

	function replaceNewsBlock() {
		var NEWS_BLOCK = document.querySelector('#hook_Block_ContentColumnContainer');
		if (NEWS_BLOCK) {
			var newsParent = NEWS_BLOCK.parentNode;
			newsParent.insertBefore(makeAsocialBlock(), NEWS_BLOCK);
			newsParent.removeChild(NEWS_BLOCK)
		}
	}
	blocker.init('ok', replaceNewsBlock)
}), (function (module, exports) {
	module.exports = {
		CHECKING_TIMEOUT: 5000,
		CHECKING_TIMEOUT_BEFORE_LOAD: 300,
		isDisabled: !1,
		isHidden: !1,
		DOMContentLoaded: !1,
		check: function check(network) {
			chrome.runtime.sendMessage(network);
			var checkingTimeout = this.DOMContentLoaded ? this.CHECKING_TIMEOUT : this.CHECKING_TIMEOUT_BEFORE_LOAD;
			setTimeout(() => this.check(network), checkingTimeout)
		},
		hideDocument: function () {
			if (this.isHidden) {
				return
			}
			var style = document.createElement('style');
			style.id = 'asocial_lock';
			style.innerHTML = 'html { opacity: 0 }';
			document.head.appendChild(style);
			this.isHidden = !0
		},
		showDocument: function () {
			if (!this.isHidden) {
				return
			}
			var style = document.head.querySelector('#asocial_lock');
			if (style) {
				document.head.removeChild(style)
			}
		},
		onMessage: function (network, newsBlocker) {
			return (shouldDisable) => {
				if (this.isDisabled && !shouldDisable) {
					return window.location.reload()
				}
				if (shouldDisable && this.DOMContentLoaded) {
					newsBlocker();
					this.showDocument();
					this.isDisabled = !0
				}
			}
		},
		onDocumentLoaded: function (network) {
			var asocialContentObserver = new MutationObserver(function () {
				chrome.runtime.sendMessage(network)
			});
			this.DOMContentLoaded = !0;
			asocialContentObserver.observe(document.body, {
				attributes: !0
			})
		},
		init: function init(network, newsBlocker) {
			var onFirstMessage = (shouldDisable) => {
				if (shouldDisable) {
					this.hideDocument();
					this.isDisabled = !0
				}
				chrome.runtime.onMessage.removeListener(onFirstMessage);
				chrome.runtime.onMessage.addListener(this.onMessage(network, newsBlocker))
			};
			chrome.runtime.onMessage.addListener(onFirstMessage);
			this.check(network);
			window.addEventListener('DOMContentLoaded', () => this.onDocumentLoaded(network))
		}
	}
})])