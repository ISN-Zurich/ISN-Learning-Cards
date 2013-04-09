/* Load this script using conditional IE comments if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'icomoon\'">' + entity + '</span>' + html;
	}
	var icons = {
			'icon-clozeQuestion' : '&#xe000;',
			'icon-diamond' : '&#xe039;',
			'icon-dash' : '&#xe00f;',
			'icon-cross' : '&#xe010;',
			'icon-loadingOld' : '&#xe011;',
			'icon-smiley' : '&#xe002;',
			'icon-happy' : '&#xe003;',
			'icon-loading2' : '&#xe012;',
			'icon-courses' : '&#xe013;',
			'icon-arrow-down' : '&#xe004;',
			'icon-settings' : '&#xe006;',
			'icon-checkmark2' : '&#xe014;',
			'icon-lms' : '&#xe018;',
			'icon-question' : '&#xe007;',
			'icon-numeric' : '&#xe008;',
			'icon-checkmark' : '&#xe019;',
			'icon-neutral' : '&#xe009;',
			'icon-loading' : '&#xe01a;',
			'icon-lock' : '&#xe00a;',
			'icon-info' : '&#xe01b;',
			'icon-exit' : '&#xe00b;',
			'icon-bars' : '&#xe01c;',
			'icon-equals' : '&#xe00c;',
			'icon-enter' : '&#xe00d;',
			'icon-arrow-up' : '&#xe01e;',
			'icon-icon-fire' : '&#xe038;',
			'icon-drag' : '&#xe00e;',
			'icon-icon-move' : '&#xe01d;'
		},
		els = document.getElementsByTagName('*'),
		i, attr, html, c, el;
	for (i = 0; ; i += 1) {
		el = els[i];
		if(!el) {
			break;
		}
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