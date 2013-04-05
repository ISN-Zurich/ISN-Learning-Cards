/* Load this script using conditional IE comments if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'icomoon\'">' + entity + '</span>' + html;
	}
	var icons = {
			'icon-diamond' : '&#xe016;',
			'icon-fire' : '&#xe017;',
			'icon-smiley' : '&#xe000;',
			'icon-settings' : '&#xe001;',
			'icon-dash' : '&#xe002;',
			'icon-cross' : '&#xe003;',
			'icon-courses' : '&#xe004;',
			'icon-numeric' : '&#xe005;',
			'icon-question' : '&#xe006;',
			'icon-clozeQuestion' : '&#xe007;',
			'icon-checkmark2' : '&#xe008;',
			'icon-lock' : '&#xe009;',
			'icon-checkmark' : '&#xe00a;',
			'icon-neutral' : '&#xe00b;',
			'icon-bars' : '&#xe00c;',
			'icon-loadingOld' : '&#xe00d;',
			'icon-loading2' : '&#xe00e;',
			'icon-loading' : '&#xe00f;',
			'icon-arrow-down' : '&#xe010;',
			'icon-arrow-up' : '&#xe011;',
			'icon-lms' : '&#xe012;',
			'icon-info' : '&#xe013;',
			'icon-icon-move' : '&#xe014;',
			'icon-happy' : '&#xe015;',
			'icon-exit' : '&#xe018;',
			'icon-equals' : '&#xe019;',
			'icon-enter' : '&#xe01a;',
			'icon-drag' : '&#xe01b;'
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