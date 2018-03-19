(function (a) {
	function b(d) {
		if (c[d]) return c[d].exports;
		var e = c[d] = {
			exports: {},
			id: d,
			loaded: !1
		};
		return a[d].call(e.exports, e, e.exports, b), e.loaded = !0, e.exports
	}
	var c = {};
	return b.m = a, b.c = c, b.p = '', b(0)
})([function (a, b, c) {
	'use strict';
	c(1), c(4), c(5)
}, function (a, b, c) {
	'use strict';

	function d(h, i) {
		chrome.storage.sync.get('rules', j => {
			var k = new Date,
				l = (j.rules || []).filter(m => f.checkRule(k, m, h));
			i(l)
		})
	}

	function e(h) {
		if (0 === h.length) return void f.setTitle('Asocial');
		var i = h.reduce(function (k, l) {
				return l.end ? g.formatTime(k.end) > g.formatTime(l.end) ? k : l : l
			}),
			j = i.end ? g.formatTime(i.end) : chrome.i18n.getMessage('title_tomorrow');
		f.setTitle(`${chrome.i18n.getMessage('title_closed')} ${j}`)
	}
	var f = c(2),
		g = c(3);
	chrome.runtime.onMessage.addListener(function (h, i) {
		d(h, function (j) {
			var k = 0 < j.length;
			chrome.tabs.sendMessage(i.tab.id, k), e(j)
		})
	})
}, function (a) {
	'use strict';

	function c(d) {
		var e = Array.prototype.slice.call(arguments, 1),
			f = this.constructor.__super.prototype[d];
		return f ? f.apply(this, e) : null
	}
	a.exports = {
		inherit: function (e, f) {
			Object.assign(e.prototype, f.prototype), e.__super = f, e.prototype.callSuper = c
		},
		getFragment: function (e) {
			var f = document.createDocumentFragment();
			return e.forEach(f.appendChild, f), f
		},
		checkRule: function (e, f, g) {
			if (g) {
				var h = Object.keys(f.sites).filter(m => f.sites[m]);
				if (0 < h.length && !f.sites[g]) return !1
			}
			if (0 !== f.days.length && -1 === f.days.indexOf(e.getDay())) return !1;
			var i = new Date,
				j = new Date,
				k = !0,
				l = !0;
			return f.start && (i.setHours(...f.start, 0, 0), k = i <= e), f.end && (j.setHours(...f.end, 0, 0), l = e < j), k && l
		},
		setTitle: function (e) {
			chrome.browserAction.setTitle({
				title: e
			})
		}
	}
}, function (a) {
	'use strict';
	a.exports = {
		parse: function (d) {
			var e = /^([0-9]{1,2})[.:, ]?([0-9]{2})/,
				f = e.exec(d);
			if (f) {
				var g = parseInt(f[1], 10),
					h = parseInt(f[2], 10);
				return g = Math.min(g, 23), h = Math.min(h, 59), [g, h]
			}
			return null
		},
		formatItem: function (d) {
			return (10 > d ? '0' + d : d) + ''
		},
		formatTime: function (d) {
			return d ? d.map(this.formatItem).join(':') : ''
		},
		formatPeriod: function (d, e) {
			if (d && e) return this.formatTime(d) + '&thinsp;\u2014&thinsp;' + this.formatTime(e);
			return d && !e ? chrome.i18n.getMessage('options_from') + ' ' + this.formatTime(d) : !d && e ? chrome.i18n.getMessage('options_to') + ' ' + this.formatTime(e) : chrome.i18n.getMessage('options_allday')
		}
	}
}, function () {
	'use strict';
	chrome.browserAction.onClicked.addListener(() => {
		chrome.tabs.create({
			active: !0,
			url: '../html/options.html'
		}, null)
	})
}, function (a, b, c) {
	'use strict';

	function d() {
		e.setTitle('Asocial')
	}
	var e = c(2);
	chrome.tabs.onActivated.addListener(d), chrome.tabs.onUpdated.addListener(d)
}]);