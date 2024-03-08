function A(e) {
	e = e || 1;
	var t = [],
		r = 0;
	function a(o) {
		t.push(o) > 1 || n();
	}
	function s() {
		r--, n();
	}
	function n() {
		r < e && t.length > 0 && (t.shift()(), r++);
	}
	return [a, s];
}
function g(e, t) {
	const r = t?.timeout ?? 50,
		a = Date.now();
	return setTimeout(function () {
		e({
			didTimeout: !1,
			timeRemaining: function () {
				return Math.max(0, r - (Date.now() - a));
			},
		});
	}, 1);
}
const y = window.requestIdleCallback || g;
var b = y;
const l = ["mouseenter", "touchstart", "focus"],
	v = new Set(),
	d = new Set();
function m({ href: e }) {
	try {
		const t = new URL(e);
		return (
			window.location.origin === t.origin &&
			window.location.pathname !== t.pathname &&
			!v.has(e)
		);
	} catch {}
	return !1;
}
let p, c;
function E(e) {
	v.add(e.href),
		c.observe(e),
		l.map((t) => e.addEventListener(t, h, { passive: !0, once: !0 }));
}
function L(e) {
	c.unobserve(e), l.map((t) => e.removeEventListener(t, h));
}
function h({ target: e }) {
	e instanceof HTMLAnchorElement && w(e);
}
async function w(e) {
	L(e);
	const { href: t } = e;
	try {
		const r = await fetch(t).then((n) => n.text());
		p ||= new DOMParser();
		const a = p.parseFromString(r, "text/html"),
			s = Array.from(a.querySelectorAll('link[rel="stylesheet"]'));
		await Promise.all(
			s
				.filter((n) => !d.has(n.href))
				.map((n) => (d.add(n.href), fetch(n.href))),
		);
	} catch {}
}
function k({
	selector: e = 'a[href][rel~="prefetch"]',
	throttle: t = 1,
	intentSelector: r = 'a[href][rel~="prefetch-intent"]',
}) {
	if (!navigator.onLine)
		return Promise.reject(
			new Error("Cannot prefetch, no network connection"),
		);
	if ("connection" in navigator) {
		const n = navigator.connection;
		if (n.saveData)
			return Promise.reject(
				new Error("Cannot prefetch, Save-Data is enabled"),
			);
		if (/(2|3)g/.test(n.effectiveType))
			return Promise.reject(
				new Error("Cannot prefetch, network conditions are poor"),
			);
	}
	const [a, s] = A(t);
	(c =
		c ||
		new IntersectionObserver((n) => {
			n.forEach((o) => {
				if (o.isIntersecting && o.target instanceof HTMLAnchorElement) {
					const u = o.target.getAttribute("rel") || "";
					let i = !1;
					Array.isArray(r)
						? (i = r.some((f) => u.includes(f)))
						: (i = u.includes(r)),
						i || a(() => w(o.target).finally(s));
				}
			});
		})),
		b(() => {
			[...document.querySelectorAll(e)].filter(m).forEach(E);
			const o = Array.isArray(r) ? r.join(",") : r;
			[...document.querySelectorAll(o)].filter(m).forEach((i) => {
				l.map((f) =>
					i.addEventListener(f, h, { passive: !0, once: !0 }),
				);
			});
		});
}
k({});
//# sourceMappingURL=page.CY1iZwUD.js.map
