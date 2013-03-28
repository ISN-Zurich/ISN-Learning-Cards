/* Load this script using conditional IE comments if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'icomoon\'">' + entity + '</span>' + html;
	}
	var icons = {
			'icon-smiley' : '&#xe000;',
			'icon-checkmark2' : '&#xe001;',
			'icon-settings' : '&#xe002;',
			'icon-checkmark' : '&#xe003;',
			'icon-question' : '&#xe004;',
			'icon-bars' : '&#xe005;',
			'icon-numeric' : '&#xe006;',
			'icon-arrow-up' : '&#xe007;',
			'icon-neutral' : '&#xe008;',
			'icon-lock' : '&#xe009;',
			'icon-arrow-down' : '&#xe00a;',
			'icon-loadingOld' : '&#xe00b;',
			'icon-loading2' : '&#xe00c;',
			'icon-loading' : '&#xe00d;',
			'icon-lms' : '&#xe00e;',
			'icon-info' : '&#xe00f;',
			'icon-icon-move' : '&#xe010;',
			'icon-happy' : '&#xe011;',
			'icon-exit' : '&#xe012;',
			'icon-equals' : '&#xe013;',
			'icon-enter' : '&#xe014;',
			'icon-drag' : '&#xe015;',
			'icon-dash' : '&#xe016;',
			'icon-cross' : '&#xe017;',
			'icon-courses' : '&#xe018;',
			'icon-clozeQuestion' : '&#xe019;',
			'icon-fire' : '&#xe01a;',
			'icon-diamonds' : '&#xe01b;'
		},
		els = document.getElementsByTagName('*'),
		i, attr, html, c, el;
	for (i = 0; i < els.length; i += 1) {
		el = els[i];
		attr = el.getAttribute('data-icon');
		if (attr) {
			addIcon(el, attr);
		}
		c = el.className;
		c = c.match(/icon-[^\s'"]+/);
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
};