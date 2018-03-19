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
	var FormManager = __webpack_require__(1);
	var Rules = __webpack_require__(5);
	var TableController = __webpack_require__(6);
	var translate = __webpack_require__(7);
	var rulesContainer;
	var currentRule;
	var addButton = document.querySelector('#add-button');
	addButton.addEventListener('click', () => FormManager.show('add'));
	FormManager.on('add', (rule) => rulesContainer.add(rule));
	FormManager.on('show', () => addButton.classList.add('hidden'));
	FormManager.on('hide', () => {
		addButton.classList.remove('hidden');
		TableController.deselect()
	});
	FormManager.on('save', (rule) => {
		rulesContainer.edit(currentRule, rule);
		FormManager.hide()
	});
	TableController.on('remove', (number) => rulesContainer.remove(number));
	TableController.on('click', (number) => {
		currentRule = number;
		FormManager.fill(rulesContainer.storage.rules[number]);
		FormManager.show('edit')
	});
	window.addEventListener('load', () => {
		translate.translateHTML();
		chrome.storage.sync.get('rules', obj => {
			rulesContainer = new Rules(obj.rules || []);
			TableController.table(rulesContainer.storage.rules);
			if (rulesContainer.storage.rules.length === 0) {
				addButton.click()
			}
			chrome.storage.onChanged.addListener(() => {
				TableController.table(rulesContainer.storage.rules)
			})
		})
	})
}), (function (module, exports, __webpack_require__) {
	'use strict';
	var utils = __webpack_require__(2);
	var EventEmitter = __webpack_require__(3);
	var TimeHelper = __webpack_require__(4);

	function FormManager() {
		this.form = document.querySelector('#add-rule-form');
		this.days = this.form.elements.day;
		this.networks = this.form.elements.network;
		this.startTime = this.form.elements.start_time;
		this.endTime = this.form.elements.end_time;
		this.container = document.querySelector('#add-rule-container');
		this.addButton = this.form.elements.add_button;
		this.saveButton = this.form.elements.save_button;
		this.inputs = Array.prototype.slice.call(this.form.getElementsByTagName('input'), 0);
		this.fill = (rule) => {
			this.startTime.value = TimeHelper.formatTime(rule.start);
			this.endTime.value = TimeHelper.formatTime(rule.end);
			Array.prototype.forEach.call(this.days, (elem) => {
				elem.checked = rule.days.indexOf(parseInt(elem.value, 10)) !== -1
			});
			Array.prototype.forEach.call(this.networks, (elem) => {
				elem.checked = Boolean(rule.sites[elem.value])
			})
		};
		this.make = () => {
			var rule = {};
			rule.start = TimeHelper.parse(this.startTime.value);
			rule.end = TimeHelper.parse(this.endTime.value);
			rule.sites = {};
			rule.days = Array.prototype.filter.call(this.days, elem => elem.checked).map(elem => parseInt(elem.value, 10));
			Array.prototype.forEach.call(this.networks, (elem) => {
				rule.sites[elem.value] = elem.checked
			});
			return rule
		};
		this.validateCheckbox = (checkboxes) => {
			return Array.prototype.some.call(checkboxes, elem => elem.checked)
		};
		this.validateTime = () => {
			var startArray = TimeHelper.parse(this.startTime.value);
			var endArray = TimeHelper.parse(this.endTime.value);
			if (startArray && endArray) {
				var result;
				var startTime = new Date();
				var endTime = new Date();
				startTime.setHours(startArray[0], startArray[1], 0);
				endTime.setHours(endArray[0], endArray[1], 0);
				result = startTime <= endTime;
				this.endTime.classList.toggle('onerror', !result);
				return result
			}
			return !0
		};
		this.check = () => {
			var isTimeValid = this.validateTime();
			var isValid = this.startTime.checkValidity() || this.endTime.checkValidity() || this.validateCheckbox(this.days) || this.validateCheckbox(this.networks);
			var isFormValid = isValid && isTimeValid;
			this.addButton.disabled = this.saveButton.disabled = !isFormValid;
			return isFormValid
		};
		this.toggleButtons = () => {
			this.addButton.disabled = this.saveButton.disabled = !this.check()
		};
		this.show = (mode) => {
			this.endTime.classList.toggle('onerror', !this.validateTime());
			this.startTime.addEventListener('blur', this.validateTime);
			this.endTime.addEventListener('blur', this.validateTime);
			this.inputs.forEach((input) => {
				input.addEventListener('change', this.toggleButtons)
			});
			this.form.classList.toggle('form-mode-add', mode === 'add');
			this.form.classList.toggle('form-mode-edit', mode === 'edit');
			this.container.classList.add('showed');
			this.trigger('show')
		};
		this.hide = () => {
			this.container.classList.remove('showed');
			this.startTime.removeEventListener('blur', this.validateTime);
			this.endTime.removeEventListener('blur', this.validateTime);
			this.inputs.forEach((input) => {
				input.removeEventListener('change', this.toggleButtons)
			});
			this.trigger('hide')
		};
		this.addButton.addEventListener('click', (e) => {
			e.preventDefault();
			if (this.check()) {
				this.trigger('add', this.make())
			}
		});
		this.saveButton.addEventListener('click', (e) => {
			e.preventDefault();
			if (this.check()) {
				this.trigger('save', this.make());
				this.hide()
			}
		})
	}
	utils.inherit(FormManager, EventEmitter);
	module.exports = new FormManager()
}), (function (module, exports) {
	'use strict';

	function callSuper(method) {
		var args = Array.prototype.slice.call(arguments, 1);
		var superProto = this.constructor.__super.prototype[method];
		return superProto ? superProto.apply(this, args) : null
	}
	module.exports = {
		inherit: function inherit(Child, Parent) {
			Object.assign(Child.prototype, Parent.prototype);
			Child.__super = Parent;
			Child.prototype.callSuper = callSuper
		},
		getFragment: function getFragment(array) {
			var df = document.createDocumentFragment();
			array.forEach(df.appendChild, df);
			return df
		},
		checkRule: function checkRule(time, rule, network) {
			if (network) {
				var disabledNetworks = Object.keys(rule.sites).filter(network => rule.sites[network]);
				if (disabledNetworks.length > 0 && !rule.sites[network]) {
					return !1
				}
			}
			if (rule.days.length !== 0 && rule.days.indexOf(time.getDay()) === -1) {
				return !1
			}
			var startTime = new Date();
			var endTime = new Date();
			var isAfterStart = !0;
			var isBeforeEnd = !0;
			if (rule.start) {
				startTime.setHours(...rule.start, 0, 0);
				isAfterStart = startTime <= time
			}
			if (rule.end) {
				endTime.setHours(...rule.end, 0, 0);
				isBeforeEnd = time < endTime
			}
			return isAfterStart && isBeforeEnd
		},
		setTitle: function setTitle(title) {
			chrome.browserAction.setTitle({
				title
			})
		}
	}
}), (function (module, exports) {
	'use strict';

	function EventEmitter() {}
	EventEmitter.prototype.on = function (event, callback) {
		if (!this.__events) {
			this.__events = {}
		}
		if (this.__events[event]) {
			this.__events[event].push(callback)
		} else {
			this.__events[event] = [callback]
		}
	};
	EventEmitter.prototype.trigger = function (event, data) {
		if (this.__events && this.__events[event]) {
			this.__events[event].forEach(function (func) {
				func(data)
			})
		}
	};
	EventEmitter.prototype.un = function (event, callback) {
		var callbackIndex = this.__events[event].indexOf(callback);
		if (callbackIndex >= 0) {
			this.__events[event].splice(callbackIndex, 1)
		}
	};
	module.exports = EventEmitter
}), (function (module, exports) {
	'use strict';
	var TimeHelper = {
		parse: function (str) {
			var timePattern = /^([0-9]{1,2})[.:, ]?([0-9]{2})/;
			var times = timePattern.exec(str);
			if (times) {
				var hours = parseInt(times[1], 10);
				var minutes = parseInt(times[2], 10);
				hours = Math.min(hours, 23);
				minutes = Math.min(minutes, 59);
				return [hours, minutes]
			}
			return null
		},
		formatItem: function (time) {
			return String(time < 10 ? '0' + time : time)
		},
		formatTime: function (time) {
			return time ? time.map(this.formatItem).join(':') : ''
		},
		formatPeriod: function (start, end) {
			if (start && end) {
				return this.formatTime(start) + '&thinsp;—&thinsp;' + this.formatTime(end)
			} else if (start && !end) {
				return chrome.i18n.getMessage('options_from') + ' ' + this.formatTime(start)
			} else if (!start && end) {
				return chrome.i18n.getMessage('options_to') + ' ' + this.formatTime(end)
			}
			return chrome.i18n.getMessage('options_allday')
		}
	};
	module.exports = TimeHelper
}), (function (module, exports) {
	'use strict';

	function Rules(rules) {
		this.storage = {
			rules
		};
		this.add = this.add.bind(this);
		this.remove = this.remove.bind(this)
	}
	Rules.prototype.add = function (rule) {
		this.storage.rules.push(rule);
		chrome.storage.sync.set(this.storage)
	};
	Rules.prototype.remove = function (number) {
		this.storage.rules.splice(number, 1);
		chrome.storage.sync.set(this.storage)
	};
	Rules.prototype.edit = function (number, rule) {
		this.storage.rules[number] = rule;
		chrome.storage.sync.set(this.storage)
	};
	module.exports = Rules
}), (function (module, exports, __webpack_require__) {
	'use strict';
	var TimeHelper = __webpack_require__(4);
	var EventEmitter = __webpack_require__(3);
	var utils = __webpack_require__(2);

	function getDay(n) {
		return chrome.i18n.getMessage(`days_${n}`)
	}

	function TableController() {
		this.rulesTable = document.querySelector('.time-table');
		this.templateRow = document.querySelector('#row-template').content.querySelector('.rule-line');
		this.rulesTable.addEventListener('click', (e) => {
			var target = e.target;
			if (target.dataset.delete) {
				this.trigger('remove', target.dataset.delete)
			} else {
				var number = target.dataset.number || target.parentNode.dataset.number;
				this.select(number);
				this.trigger('click', number)
			}
		})
	}
	TableController.prototype.getDays = function (days) {
		return (days.length % 7) ? days.map(getDay).join(', ') : chrome.i18n.getMessage('options_everyday')
	};
	TableController.prototype.getNetworkIcon = function (network) {
		var networkBlock = document.createElement('span');
		networkBlock.classList.add('icon', `icon-${network}`);
		return networkBlock
	};
	TableController.prototype.getSites = function (sites) {
		var sitesFilter = Object.keys(sites).filter(k => sites[k]).sort();
		return sitesFilter.length ? utils.getFragment(sitesFilter.map(this.getNetworkIcon)) : document.createTextNode(chrome.i18n.getMessage('options_all'))
	};
	TableController.prototype.row = function (rule, number) {
		var row = this.templateRow.cloneNode(!0);
		var buttonDelete = row.querySelector('.btn-delete');
		row.querySelector('.days').textContent = this.getDays(rule.days);
		row.querySelector('.time').innerHTML = TimeHelper.formatPeriod(rule.start, rule.end);
		row.querySelector('.networks').appendChild(this.getSites(rule.sites));
		buttonDelete.dataset.delete = number;
		buttonDelete.title = chrome.i18n.getMessage('delete');
		row.dataset.number = number;
		if (utils.checkRule(new Date(), rule)) {
			row.classList.add('rule-line-active')
		}
		return row
	};
	TableController.prototype.table = function (rules) {
		this.rulesTable.innerHTML = '';
		this.rulesTable.appendChild(utils.getFragment(rules.map(this.row, this)));
		this.rulesTable.classList.toggle('time-table-empty', rules.lenght === 0)
	};
	TableController.prototype.SELECTED_RULE = 'rule-line-selected';
	TableController.prototype.select = function (ruleNumber) {
		this.deselect();
		this.rulesTable.children[ruleNumber].classList.add(this.SELECTED_RULE)
	};
	TableController.prototype.deselect = function () {
		var selectedRule = this.rulesTable.querySelector('.' + this.SELECTED_RULE);
		if (selectedRule) {
			selectedRule.classList.remove(this.SELECTED_RULE)
		}
	};
	utils.inherit(TableController, EventEmitter);
	module.exports = new TableController()
}), (function (module, exports) {
	'use strict';
	module.exports = {
		translateHTML: function translateHTML() {
			var elems = document.querySelectorAll('[data-i18n]');
			Array.prototype.forEach.call(elems, elem => {
				elem.innerHTML = chrome.i18n.getMessage(elem.dataset.i18n)
			})
		}
	}
})])