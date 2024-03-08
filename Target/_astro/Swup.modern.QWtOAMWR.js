const M = new WeakMap();
function D(e, t, i, n) {
	if (!e && !M.has(t)) return !1;
	const r = M.get(t) ?? new WeakMap();
	M.set(t, r);
	const s = r.get(i) ?? new Set();
	r.set(i, s);
	const o = s.has(n);
	return e ? s.add(n) : s.delete(n), o && e;
}
function X(e, t) {
	let i = e.target;
	if (
		(i instanceof Text && (i = i.parentElement),
		i instanceof Element && e.currentTarget instanceof Element)
	) {
		const n = i.closest(t);
		if (n && e.currentTarget.contains(n)) return n;
	}
}
function Q(e, t, i, n = {}) {
	const { signal: r, base: s = document } = n;
	if (r?.aborted) return;
	const { once: o, ...a } = n,
		c = s instanceof Document ? s.documentElement : s,
		h = !!(typeof n == "object" ? n.capture : n),
		l = (f) => {
			const v = X(f, e);
			if (v) {
				const g = Object.assign(f, { delegateTarget: v });
				i.call(c, g),
					o && (c.removeEventListener(t, l, a), D(!1, c, i, u));
			}
		},
		u = JSON.stringify({ selector: e, type: t, capture: h });
	D(!0, c, i, u) || c.addEventListener(t, l, a),
		r?.addEventListener("abort", () => {
			D(!1, c, i, u);
		});
}
function Y(e) {
	for (var t = [], i = 0; i < e.length; ) {
		var n = e[i];
		if (n === "*" || n === "+" || n === "?") {
			t.push({ type: "MODIFIER", index: i, value: e[i++] });
			continue;
		}
		if (n === "\\") {
			t.push({ type: "ESCAPED_CHAR", index: i++, value: e[i++] });
			continue;
		}
		if (n === "{") {
			t.push({ type: "OPEN", index: i, value: e[i++] });
			continue;
		}
		if (n === "}") {
			t.push({ type: "CLOSE", index: i, value: e[i++] });
			continue;
		}
		if (n === ":") {
			for (var r = "", s = i + 1; s < e.length; ) {
				var o = e.charCodeAt(s);
				if (
					(o >= 48 && o <= 57) ||
					(o >= 65 && o <= 90) ||
					(o >= 97 && o <= 122) ||
					o === 95
				) {
					r += e[s++];
					continue;
				}
				break;
			}
			if (!r) throw new TypeError("Missing parameter name at ".concat(i));
			t.push({ type: "NAME", index: i, value: r }), (i = s);
			continue;
		}
		if (n === "(") {
			var a = 1,
				c = "",
				s = i + 1;
			if (e[s] === "?")
				throw new TypeError(
					'Pattern cannot start with "?" at '.concat(s),
				);
			for (; s < e.length; ) {
				if (e[s] === "\\") {
					c += e[s++] + e[s++];
					continue;
				}
				if (e[s] === ")") {
					if ((a--, a === 0)) {
						s++;
						break;
					}
				} else if (e[s] === "(" && (a++, e[s + 1] !== "?"))
					throw new TypeError(
						"Capturing groups are not allowed at ".concat(s),
					);
				c += e[s++];
			}
			if (a) throw new TypeError("Unbalanced pattern at ".concat(i));
			if (!c) throw new TypeError("Missing pattern at ".concat(i));
			t.push({ type: "PATTERN", index: i, value: c }), (i = s);
			continue;
		}
		t.push({ type: "CHAR", index: i, value: e[i++] });
	}
	return t.push({ type: "END", index: i, value: "" }), t;
}
function Z(e, t) {
	t === void 0 && (t = {});
	for (
		var i = Y(e),
			n = t.prefixes,
			r = n === void 0 ? "./" : n,
			s = "[^".concat(R(t.delimiter || "/#?"), "]+?"),
			o = [],
			a = 0,
			c = 0,
			h = "",
			l = function (E) {
				if (c < i.length && i[c].type === E) return i[c++].value;
			},
			u = function (E) {
				var C = l(E);
				if (C !== void 0) return C;
				var P = i[c],
					N = P.type,
					I = P.index;
				throw new TypeError(
					"Unexpected "
						.concat(N, " at ")
						.concat(I, ", expected ")
						.concat(E),
				);
			},
			d = function () {
				for (var E = "", C; (C = l("CHAR") || l("ESCAPED_CHAR")); )
					E += C;
				return E;
			};
		c < i.length;
	) {
		var f = l("CHAR"),
			v = l("NAME"),
			g = l("PATTERN");
		if (v || g) {
			var m = f || "";
			r.indexOf(m) === -1 && ((h += m), (m = "")),
				h && (o.push(h), (h = "")),
				o.push({
					name: v || a++,
					prefix: m,
					suffix: "",
					pattern: g || s,
					modifier: l("MODIFIER") || "",
				});
			continue;
		}
		var w = f || l("ESCAPED_CHAR");
		if (w) {
			h += w;
			continue;
		}
		h && (o.push(h), (h = ""));
		var b = l("OPEN");
		if (b) {
			var m = d(),
				S = l("NAME") || "",
				p = l("PATTERN") || "",
				x = d();
			u("CLOSE"),
				o.push({
					name: S || (p ? a++ : ""),
					pattern: S && !p ? s : p,
					prefix: m,
					suffix: x,
					modifier: l("MODIFIER") || "",
				});
			continue;
		}
		u("END");
	}
	return o;
}
function tt(e, t) {
	var i = [],
		n = F(e, i, t);
	return et(n, i, t);
}
function et(e, t, i) {
	i === void 0 && (i = {});
	var n = i.decode,
		r =
			n === void 0
				? function (s) {
						return s;
				  }
				: n;
	return function (s) {
		var o = e.exec(s);
		if (!o) return !1;
		for (
			var a = o[0],
				c = o.index,
				h = Object.create(null),
				l = function (d) {
					if (o[d] === void 0) return "continue";
					var f = t[d - 1];
					f.modifier === "*" || f.modifier === "+"
						? (h[f.name] = o[d]
								.split(f.prefix + f.suffix)
								.map(function (v) {
									return r(v, f);
								}))
						: (h[f.name] = r(o[d], f));
				},
				u = 1;
			u < o.length;
			u++
		)
			l(u);
		return { path: a, index: c, params: h };
	};
}
function R(e) {
	return e.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
function B(e) {
	return e && e.sensitive ? "" : "i";
}
function it(e, t) {
	if (!t) return e;
	for (var i = /\((?:\?<(.*?)>)?(?!\?)/g, n = 0, r = i.exec(e.source); r; )
		t.push({
			name: r[1] || n++,
			prefix: "",
			suffix: "",
			modifier: "",
			pattern: "",
		}),
			(r = i.exec(e.source));
	return e;
}
function nt(e, t, i) {
	var n = e.map(function (r) {
		return F(r, t, i).source;
	});
	return new RegExp("(?:".concat(n.join("|"), ")"), B(i));
}
function st(e, t, i) {
	return rt(Z(e, i), t, i);
}
function rt(e, t, i) {
	i === void 0 && (i = {});
	for (
		var n = i.strict,
			r = n === void 0 ? !1 : n,
			s = i.start,
			o = s === void 0 ? !0 : s,
			a = i.end,
			c = a === void 0 ? !0 : a,
			h = i.encode,
			l =
				h === void 0
					? function (I) {
							return I;
					  }
					: h,
			u = i.delimiter,
			d = u === void 0 ? "/#?" : u,
			f = i.endsWith,
			v = f === void 0 ? "" : f,
			g = "[".concat(R(v), "]|$"),
			m = "[".concat(R(d), "]"),
			w = o ? "^" : "",
			b = 0,
			S = e;
		b < S.length;
		b++
	) {
		var p = S[b];
		if (typeof p == "string") w += R(l(p));
		else {
			var x = R(l(p.prefix)),
				E = R(l(p.suffix));
			if (p.pattern)
				if ((t && t.push(p), x || E))
					if (p.modifier === "+" || p.modifier === "*") {
						var C = p.modifier === "*" ? "?" : "";
						w += "(?:"
							.concat(x, "((?:")
							.concat(p.pattern, ")(?:")
							.concat(E)
							.concat(x, "(?:")
							.concat(p.pattern, "))*)")
							.concat(E, ")")
							.concat(C);
					} else
						w += "(?:"
							.concat(x, "(")
							.concat(p.pattern, ")")
							.concat(E, ")")
							.concat(p.modifier);
				else
					p.modifier === "+" || p.modifier === "*"
						? (w += "((?:"
								.concat(p.pattern, ")")
								.concat(p.modifier, ")"))
						: (w += "(".concat(p.pattern, ")").concat(p.modifier));
			else w += "(?:".concat(x).concat(E, ")").concat(p.modifier);
		}
	}
	if (c)
		r || (w += "".concat(m, "?")),
			(w += i.endsWith ? "(?=".concat(g, ")") : "$");
	else {
		var P = e[e.length - 1],
			N =
				typeof P == "string"
					? m.indexOf(P[P.length - 1]) > -1
					: P === void 0;
		r || (w += "(?:".concat(m, "(?=").concat(g, "))?")),
			N || (w += "(?=".concat(m, "|").concat(g, ")"));
	}
	return new RegExp(w, B(i));
}
function F(e, t, i) {
	return e instanceof RegExp
		? it(e, t)
		: Array.isArray(e)
		  ? nt(e, t, i)
		  : st(e, t, i);
}
function y() {
	return (
		(y = Object.assign
			? Object.assign.bind()
			: function (e) {
					for (var t = 1; t < arguments.length; t++) {
						var i = arguments[t];
						for (var n in i)
							Object.prototype.hasOwnProperty.call(i, n) &&
								(e[n] = i[n]);
					}
					return e;
			  }),
		y.apply(this, arguments)
	);
}
const K = (e, t) =>
		String(e)
			.toLowerCase()
			.replace(/[\s/_.]+/g, "-")
			.replace(/[^\w-]+/g, "")
			.replace(/--+/g, "-")
			.replace(/^-+|-+$/g, "") ||
		t ||
		"",
	k = ({ hash: e } = {}) =>
		window.location.pathname +
		window.location.search +
		(e ? window.location.hash : ""),
	ot = (e, t = {}) => {
		const i = y(
			{
				url: (e = e || k({ hash: !0 })),
				random: Math.random(),
				source: "swup",
			},
			t,
		);
		window.history.pushState(i, "", e);
	},
	T = (e = null, t = {}) => {
		e = e || k({ hash: !0 });
		const i = y(
			{},
			window.history.state || {},
			{ url: e, random: Math.random(), source: "swup" },
			t,
		);
		window.history.replaceState(i, "", e);
	},
	at = (e, t, i, n) => {
		const r = new AbortController();
		return (
			(n = y({}, n, { signal: r.signal })),
			Q(e, t, i, n),
			{ destroy: () => r.abort() }
		);
	};
let A = class O extends URL {
	constructor(t, i = document.baseURI) {
		super(t.toString(), i), Object.setPrototypeOf(this, O.prototype);
	}
	get url() {
		return this.pathname + this.search;
	}
	static fromElement(t) {
		const i = t.getAttribute("href") || t.getAttribute("xlink:href") || "";
		return new O(i);
	}
	static fromUrl(t) {
		return new O(t);
	}
};
const Ut = (e, t) => {
	try {
		return tt(e, t);
	} catch (i) {
		throw new Error(`[swup] Error parsing path "${String(e)}":
${String(i)}`);
	}
};
class $ extends Error {
	constructor(t, i) {
		super(t),
			(this.url = void 0),
			(this.status = void 0),
			(this.aborted = void 0),
			(this.timedOut = void 0),
			(this.name = "FetchError"),
			(this.url = i.url),
			(this.status = i.status),
			(this.aborted = i.aborted || !1),
			(this.timedOut = i.timedOut || !1);
	}
}
async function ct(e, t = {}) {
	var i;
	e = A.fromUrl(e).url;
	const { visit: n = this.visit } = t,
		r = y({}, this.options.requestHeaders, t.headers),
		s = (i = t.timeout) != null ? i : this.options.timeout,
		o = new AbortController(),
		{ signal: a } = o;
	t = y({}, t, { headers: r, signal: a });
	let c,
		h = !1,
		l = null;
	s &&
		s > 0 &&
		(l = setTimeout(() => {
			(h = !0), o.abort("timeout");
		}, s));
	try {
		(c = await this.hooks.call(
			"fetch:request",
			n,
			{ url: e, options: t },
			(m, { url: w, options: b }) => fetch(w, b),
		)),
			l && clearTimeout(l);
	} catch (m) {
		throw h
			? (this.hooks.call("fetch:timeout", n, { url: e }),
			  new $(`Request timed out: ${e}`, { url: e, timedOut: h }))
			: m?.name === "AbortError" || a.aborted
			  ? new $(`Request aborted: ${e}`, { url: e, aborted: !0 })
			  : m;
	}
	const { status: u, url: d } = c,
		f = await c.text();
	if (u === 500)
		throw (
			(this.hooks.call("fetch:error", n, {
				status: u,
				response: c,
				url: d,
			}),
			new $(`Server error: ${d}`, { status: u, url: d }))
		);
	if (!f) throw new $(`Empty response: ${d}`, { status: u, url: d });
	const { url: v } = A.fromUrl(d),
		g = { url: v, html: f };
	return (
		!n.cache.write ||
			(t.method && t.method !== "GET") ||
			e !== v ||
			this.cache.set(g.url, g),
		g
	);
}
class lt {
	constructor(t) {
		(this.swup = void 0), (this.pages = new Map()), (this.swup = t);
	}
	get size() {
		return this.pages.size;
	}
	get all() {
		const t = new Map();
		return (
			this.pages.forEach((i, n) => {
				t.set(n, y({}, i));
			}),
			t
		);
	}
	has(t) {
		return this.pages.has(this.resolve(t));
	}
	get(t) {
		const i = this.pages.get(this.resolve(t));
		return i && y({}, i);
	}
	set(t, i) {
		(i = y({}, i, { url: (t = this.resolve(t)) })),
			this.pages.set(t, i),
			this.swup.hooks.callSync("cache:set", void 0, { page: i });
	}
	update(t, i) {
		t = this.resolve(t);
		const n = y({}, this.get(t), i, { url: t });
		this.pages.set(t, n);
	}
	delete(t) {
		this.pages.delete(this.resolve(t));
	}
	clear() {
		this.pages.clear(),
			this.swup.hooks.callSync("cache:clear", void 0, void 0);
	}
	prune(t) {
		this.pages.forEach((i, n) => {
			t(n, i) && this.delete(n);
		});
	}
	resolve(t) {
		const { url: i } = A.fromUrl(t);
		return this.swup.resolveUrl(i);
	}
}
const q = (e, t = document) => t.querySelector(e),
	V = (e, t = document) => Array.from(t.querySelectorAll(e)),
	z = () =>
		new Promise((e) => {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					e();
				});
			});
		});
function G(e) {
	return (
		!!e &&
		(typeof e == "object" || typeof e == "function") &&
		typeof e.then == "function"
	);
}
function ht(e, t = []) {
	return new Promise((i, n) => {
		const r = e(...t);
		G(r) ? r.then(i, n) : i(r);
	});
}
function Tt(e) {
	var t;
	(t = e = e || document.body) == null || t.getBoundingClientRect();
}
const W = (e) => (window.CSS && window.CSS.escape ? CSS.escape(e) : e),
	_ = (e) => 1e3 * Number(e.slice(0, -1).replace(",", "."));
class ut {
	constructor(t) {
		(this.swup = void 0),
			(this.swupClasses = [
				"to-",
				"is-changing",
				"is-rendering",
				"is-popstate",
				"is-animating",
				"is-leaving",
			]),
			(this.swup = t);
	}
	get selectors() {
		const { scope: t } = this.swup.visit.animation;
		return t === "containers"
			? this.swup.visit.containers
			: t === "html"
			  ? ["html"]
			  : Array.isArray(t)
				  ? t
				  : [];
	}
	get selector() {
		return this.selectors.join(",");
	}
	get targets() {
		return this.selector.trim() ? V(this.selector) : [];
	}
	add(...t) {
		this.targets.forEach((i) => i.classList.add(...t));
	}
	remove(...t) {
		this.targets.forEach((i) => i.classList.remove(...t));
	}
	clear() {
		this.targets.forEach((t) => {
			const i = t.className.split(" ").filter((n) => this.isSwupClass(n));
			t.classList.remove(...i);
		});
	}
	isSwupClass(t) {
		return this.swupClasses.some((i) => t.startsWith(i));
	}
}
class J {
	constructor(t, i) {
		(this.id = void 0),
			(this.state = void 0),
			(this.from = void 0),
			(this.to = void 0),
			(this.containers = void 0),
			(this.animation = void 0),
			(this.trigger = void 0),
			(this.cache = void 0),
			(this.history = void 0),
			(this.scroll = void 0);
		const {
			to: n,
			from: r = t.currentPageUrl,
			hash: s,
			el: o,
			event: a,
		} = i;
		(this.id = Math.random()),
			(this.state = 1),
			(this.from = { url: r }),
			(this.to = { url: n, hash: s }),
			(this.containers = t.options.containers),
			(this.animation = {
				animate: !0,
				wait: !1,
				name: void 0,
				native: t.options.native,
				scope: t.options.animationScope,
				selector: t.options.animationSelector,
			}),
			(this.trigger = { el: o, event: a }),
			(this.cache = { read: t.options.cache, write: t.options.cache }),
			(this.history = {
				action: "push",
				popstate: !1,
				direction: void 0,
			}),
			(this.scroll = { reset: !0, target: void 0 });
	}
	advance(t) {
		this.state < t && (this.state = t);
	}
	abort() {
		this.state = 8;
	}
	get done() {
		return this.state >= 7;
	}
}
function dt(e) {
	return new J(this, e);
}
class ft {
	constructor(t) {
		(this.swup = void 0),
			(this.registry = new Map()),
			(this.hooks = [
				"animation:out:start",
				"animation:out:await",
				"animation:out:end",
				"animation:in:start",
				"animation:in:await",
				"animation:in:end",
				"animation:skip",
				"cache:clear",
				"cache:set",
				"content:replace",
				"content:scroll",
				"enable",
				"disable",
				"fetch:request",
				"fetch:error",
				"fetch:timeout",
				"history:popstate",
				"link:click",
				"link:self",
				"link:anchor",
				"link:newtab",
				"page:load",
				"page:view",
				"scroll:top",
				"scroll:anchor",
				"visit:start",
				"visit:transition",
				"visit:abort",
				"visit:end",
			]),
			(this.swup = t),
			this.init();
	}
	init() {
		this.hooks.forEach((t) => this.create(t));
	}
	create(t) {
		this.registry.has(t) || this.registry.set(t, new Map());
	}
	exists(t) {
		return this.registry.has(t);
	}
	get(t) {
		const i = this.registry.get(t);
		if (i) return i;
		console.error(`Unknown hook '${t}'`);
	}
	clear() {
		this.registry.forEach((t) => t.clear());
	}
	on(t, i, n = {}) {
		const r = this.get(t);
		if (!r) return console.warn(`Hook '${t}' not found.`), () => {};
		const s = y({}, n, { id: r.size + 1, hook: t, handler: i });
		return r.set(i, s), () => this.off(t, i);
	}
	before(t, i, n = {}) {
		return this.on(t, i, y({}, n, { before: !0 }));
	}
	replace(t, i, n = {}) {
		return this.on(t, i, y({}, n, { replace: !0 }));
	}
	once(t, i, n = {}) {
		return this.on(t, i, y({}, n, { once: !0 }));
	}
	off(t, i) {
		const n = this.get(t);
		n && i
			? n.delete(i) || console.warn(`Handler for hook '${t}' not found.`)
			: n && n.clear();
	}
	async call(t, i, n, r) {
		const [s, o, a] = this.parseCallArgs(t, i, n, r),
			{ before: c, handler: h, after: l } = this.getHandlers(t, a);
		await this.run(c, s, o);
		const [u] = await this.run(h, s, o, !0);
		return await this.run(l, s, o), this.dispatchDomEvent(t, s, o), u;
	}
	callSync(t, i, n, r) {
		const [s, o, a] = this.parseCallArgs(t, i, n, r),
			{ before: c, handler: h, after: l } = this.getHandlers(t, a);
		this.runSync(c, s, o);
		const [u] = this.runSync(h, s, o, !0);
		return this.runSync(l, s, o), this.dispatchDomEvent(t, s, o), u;
	}
	parseCallArgs(t, i, n, r) {
		return i instanceof J ||
			(typeof i != "object" && typeof n != "function")
			? [i, n, r]
			: [void 0, i, n];
	}
	async run(t, i = this.swup.visit, n, r = !1) {
		const s = [];
		for (const { hook: o, handler: a, defaultHandler: c, once: h } of t)
			if (i == null || !i.done) {
				h && this.off(o, a);
				try {
					const l = await ht(a, [i, n, c]);
					s.push(l);
				} catch (l) {
					if (r) throw l;
					console.error(`Error in hook '${o}':`, l);
				}
			}
		return s;
	}
	runSync(t, i = this.swup.visit, n, r = !1) {
		const s = [];
		for (const { hook: o, handler: a, defaultHandler: c, once: h } of t)
			if (i == null || !i.done) {
				h && this.off(o, a);
				try {
					const l = a(i, n, c);
					s.push(l),
						G(l) &&
							console.warn(
								`Swup will not await Promises in handler for synchronous hook '${o}'.`,
							);
				} catch (l) {
					if (r) throw l;
					console.error(`Error in hook '${o}':`, l);
				}
			}
		return s;
	}
	getHandlers(t, i) {
		const n = this.get(t);
		if (!n)
			return {
				found: !1,
				before: [],
				handler: [],
				after: [],
				replaced: !1,
			};
		const r = Array.from(n.values()),
			s = this.sortRegistrations,
			o = r.filter(({ before: u, replace: d }) => u && !d).sort(s),
			a = r
				.filter(({ replace: u }) => u)
				.filter((u) => !0)
				.sort(s),
			c = r.filter(({ before: u, replace: d }) => !u && !d).sort(s),
			h = a.length > 0;
		let l = [];
		if (i && ((l = [{ id: 0, hook: t, handler: i }]), h)) {
			const u = a.length - 1,
				d = (f) => {
					const v = a[f - 1];
					return v ? (g, m) => v.handler(g, m, d(f - 1)) : i;
				};
			l = [
				{ id: 0, hook: t, handler: a[u].handler, defaultHandler: d(u) },
			];
		}
		return { found: !0, before: o, handler: l, after: c, replaced: h };
	}
	sortRegistrations(t, i) {
		var n, r;
		return (
			((n = t.priority) != null ? n : 0) -
				((r = i.priority) != null ? r : 0) ||
			t.id - i.id ||
			0
		);
	}
	dispatchDomEvent(t, i, n) {
		if (i != null && i.done) return;
		const r = { hook: t, args: n, visit: i || this.swup.visit };
		document.dispatchEvent(
			new CustomEvent("swup:any", { detail: r, bubbles: !0 }),
		),
			document.dispatchEvent(
				new CustomEvent(`swup:${t}`, { detail: r, bubbles: !0 }),
			);
	}
}
const pt = (e) => {
		if ((e && e.charAt(0) === "#" && (e = e.substring(1)), !e)) return null;
		const t = decodeURIComponent(e);
		let i =
			document.getElementById(e) ||
			document.getElementById(t) ||
			q(`a[name='${W(e)}']`) ||
			q(`a[name='${W(t)}']`);
		return i || e !== "top" || (i = document.body), i;
	},
	U = "transition",
	H = "animation";
async function mt({ elements: e, selector: t }) {
	if (t === !1 && !e) return;
	let i = [];
	if (e) i = Array.from(e);
	else if (t && ((i = V(t, document.body)), !i.length))
		return void console.warn(
			`[swup] No elements found matching animationSelector \`${t}\``,
		);
	const n = i.map((r) =>
		(function (s) {
			const {
				type: o,
				timeout: a,
				propCount: c,
			} = (function (h, l) {
				const u = window.getComputedStyle(h),
					d = L(u, `${U}Delay`),
					f = L(u, `${U}Duration`),
					v = j(d, f),
					g = L(u, `${H}Delay`),
					m = L(u, `${H}Duration`),
					w = j(g, m);
				let b = null,
					S = 0,
					p = 0;
				return (
					(S = Math.max(v, w)),
					(b = S > 0 ? (v > w ? U : H) : null),
					(p = b ? (b === U ? f.length : m.length) : 0),
					{ type: b, timeout: S, propCount: p }
				);
			})(s);
			return (
				!(!o || !a) &&
				new Promise((h) => {
					const l = `${o}end`,
						u = performance.now();
					let d = 0;
					const f = () => {
							s.removeEventListener(l, v), h();
						},
						v = (g) => {
							if (g.target === s) {
								if (
									!(function (m) {
										return [`${U}end`, `${H}end`].includes(
											m.type,
										);
									})(g)
								)
									throw new Error(
										"Not a transition or animation event.",
									);
								(performance.now() - u) / 1e3 < g.elapsedTime ||
									(++d >= c && f());
							}
						};
					setTimeout(() => {
						d < c && f();
					}, a + 1),
						s.addEventListener(l, v);
				})
			);
		})(r),
	);
	n.filter(Boolean).length > 0
		? await Promise.all(n)
		: t &&
		  console.warn(
				`[swup] No CSS animation duration defined on elements matching \`${t}\``,
		  );
}
function L(e, t) {
	return (e[t] || "").split(", ");
}
function j(e, t) {
	for (; e.length < t.length; ) e = e.concat(e);
	return Math.max(...t.map((i, n) => _(i) + _(e[n])));
}
function vt(e, t = {}, i = {}) {
	if (typeof e != "string")
		throw new Error("swup.navigate() requires a URL parameter");
	if (this.shouldIgnoreVisit(e, { el: i.el, event: i.event }))
		return void window.location.assign(e);
	const { url: n, hash: r } = A.fromUrl(e),
		s = this.createVisit(y({}, i, { to: n, hash: r }));
	this.performNavigation(s, t);
}
async function gt(e, t = {}) {
	if (this.navigating) {
		if (this.visit.state >= 6)
			return (
				(e.state = 2),
				void (this.onVisitEnd = () => this.performNavigation(e, t))
			);
		await this.hooks.call("visit:abort", this.visit, void 0),
			delete this.visit.to.document,
			(this.visit.state = 8);
	}
	(this.navigating = !0), (this.visit = e);
	const { el: i } = e.trigger;
	(t.referrer = t.referrer || this.currentPageUrl),
		t.animate === !1 && (e.animation.animate = !1),
		e.animation.animate || this.classes.clear();
	const n = t.history || i?.getAttribute("data-swup-history") || void 0;
	n && ["push", "replace"].includes(n) && (e.history.action = n);
	const r = t.animation || i?.getAttribute("data-swup-animation") || void 0;
	var s, o;
	r && (e.animation.name = r),
		typeof t.cache == "object"
			? ((e.cache.read = (s = t.cache.read) != null ? s : e.cache.read),
			  (e.cache.write = (o = t.cache.write) != null ? o : e.cache.write))
			: t.cache !== void 0 &&
			  (e.cache = { read: !!t.cache, write: !!t.cache }),
		delete t.cache;
	try {
		await this.hooks.call("visit:start", e, void 0), (e.state = 3);
		const a = this.hooks.call(
			"page:load",
			e,
			{ options: t },
			async (c, h) => {
				let l;
				return (
					c.cache.read && (l = this.cache.get(c.to.url)),
					(h.page = l || (await this.fetchPage(c.to.url, h.options))),
					(h.cache = !!l),
					h.page
				);
			},
		);
		if (
			(a.then(({ html: c }) => {
				e.advance(5),
					(e.to.html = c),
					(e.to.document = new DOMParser().parseFromString(
						c,
						"text/html",
					));
			}),
			!e.history.popstate)
		) {
			const c = e.to.url + e.to.hash;
			e.history.action === "replace" || e.to.url === this.currentPageUrl
				? T(c)
				: (this.currentHistoryIndex++,
				  ot(c, { index: this.currentHistoryIndex }));
		}
		if (
			((this.currentPageUrl = k()),
			e.history.popstate && this.classes.add("is-popstate"),
			e.animation.name && this.classes.add(`to-${K(e.animation.name)}`),
			e.animation.wait && (await a),
			e.done ||
				(await this.hooks.call(
					"visit:transition",
					e,
					void 0,
					async () => {
						if (!e.animation.animate)
							return (
								await this.hooks.call("animation:skip", void 0),
								void (await this.renderPage(e, await a))
							);
						e.advance(4),
							await this.animatePageOut(e),
							e.animation.native && document.startViewTransition
								? await document.startViewTransition(
										async () =>
											await this.renderPage(e, await a),
								  ).finished
								: await this.renderPage(e, await a),
							await this.animatePageIn(e);
					},
				),
				e.done))
		)
			return;
		await this.hooks.call("visit:end", e, void 0, () =>
			this.classes.clear(),
		),
			(e.state = 7),
			(this.navigating = !1),
			this.onVisitEnd && (this.onVisitEnd(), (this.onVisitEnd = void 0));
	} catch (a) {
		if (!a || (a != null && a.aborted)) return void (e.state = 8);
		(e.state = 9),
			console.error(a),
			(this.options.skipPopStateHandling = () => (
				window.location.assign(e.to.url + e.to.hash), !0
			)),
			window.history.back();
	} finally {
		delete e.to.document;
	}
}
const wt = async function (e) {
		await this.hooks.call("animation:out:start", e, void 0, () => {
			this.classes.add("is-changing", "is-animating", "is-leaving");
		}),
			await this.hooks.call(
				"animation:out:await",
				e,
				{ skip: !1 },
				(t, { skip: i }) => {
					if (!i)
						return this.awaitAnimations({
							selector: t.animation.selector,
						});
				},
			),
			await this.hooks.call("animation:out:end", e, void 0);
	},
	yt = function (e) {
		var t;
		const i = e.to.document;
		if (!i) return !1;
		const n =
			((t = i.querySelector("title")) == null ? void 0 : t.innerText) ||
			"";
		document.title = n;
		const r = V('[data-swup-persist]:not([data-swup-persist=""])'),
			s = e.containers
				.map((o) => {
					const a = document.querySelector(o),
						c = i.querySelector(o);
					return a && c
						? (a.replaceWith(c.cloneNode(!0)), !0)
						: (a ||
								console.warn(
									`[swup] Container missing in current document: ${o}`,
								),
						  c ||
								console.warn(
									`[swup] Container missing in incoming document: ${o}`,
								),
						  !1);
				})
				.filter(Boolean);
		return (
			r.forEach((o) => {
				const a = o.getAttribute("data-swup-persist"),
					c = q(`[data-swup-persist="${a}"]`);
				c && c !== o && c.replaceWith(o);
			}),
			s.length === e.containers.length
		);
	},
	Et = function (e) {
		const t = { behavior: "auto" },
			{ target: i, reset: n } = e.scroll,
			r = i ?? e.to.hash;
		let s = !1;
		return (
			r &&
				(s = this.hooks.callSync(
					"scroll:anchor",
					e,
					{ hash: r, options: t },
					(o, { hash: a, options: c }) => {
						const h = this.getAnchorElement(a);
						return h && h.scrollIntoView(c), !!h;
					},
				)),
			n &&
				!s &&
				(s = this.hooks.callSync(
					"scroll:top",
					e,
					{ options: t },
					(o, { options: a }) => (
						window.scrollTo(y({ top: 0, left: 0 }, a)), !0
					),
				)),
			s
		);
	},
	bt = async function (e) {
		if (e.done) return;
		const t = this.hooks.call(
			"animation:in:await",
			e,
			{ skip: !1 },
			(i, { skip: n }) => {
				if (!n)
					return this.awaitAnimations({
						selector: i.animation.selector,
					});
			},
		);
		await z(),
			await this.hooks.call("animation:in:start", e, void 0, () => {
				this.classes.remove("is-animating");
			}),
			await t,
			await this.hooks.call("animation:in:end", e, void 0);
	},
	St = async function (e, t) {
		if (e.done) return;
		e.advance(6);
		const { url: i } = t;
		this.isSameResolvedUrl(k(), i) ||
			(T(i),
			(this.currentPageUrl = k()),
			(e.to.url = this.currentPageUrl)),
			await this.hooks.call(
				"content:replace",
				e,
				{ page: t },
				(n, {}) => {
					if (
						(this.classes.remove("is-leaving"),
						n.animation.animate && this.classes.add("is-rendering"),
						!this.replaceContent(n))
					)
						throw new Error("[swup] Container mismatch, aborting");
					n.animation.animate &&
						(this.classes.add(
							"is-changing",
							"is-animating",
							"is-rendering",
						),
						n.animation.name &&
							this.classes.add(`to-${K(n.animation.name)}`));
				},
			),
			await this.hooks.call("content:scroll", e, void 0, () =>
				this.scrollToContent(e),
			),
			await this.hooks.call("page:view", e, {
				url: this.currentPageUrl,
				title: document.title,
			});
	},
	kt = function (e) {
		var t;
		if (((t = e), !!t?.isSwupPlugin)) {
			if (
				((e.swup = this),
				!e._checkRequirements || e._checkRequirements())
			)
				return (
					e._beforeMount && e._beforeMount(),
					e.mount(),
					this.plugins.push(e),
					this.plugins
				);
		} else console.error("Not a swup plugin instance", e);
	};
function xt(e) {
	const t = this.findPlugin(e);
	if (t)
		return (
			t.unmount(),
			t._afterUnmount && t._afterUnmount(),
			(this.plugins = this.plugins.filter((i) => i !== t)),
			this.plugins
		);
	console.error("No such plugin", t);
}
function Ct(e) {
	return this.plugins.find(
		(t) => t === e || t.name === e || t.name === `Swup${String(e)}`,
	);
}
function Pt(e) {
	if (typeof this.options.resolveUrl != "function")
		return (
			console.warn(
				"[swup] options.resolveUrl expects a callback function.",
			),
			e
		);
	const t = this.options.resolveUrl(e);
	return t && typeof t == "string"
		? t.startsWith("//") || t.startsWith("http")
			? (console.warn(
					"[swup] options.resolveUrl needs to return a relative url",
			  ),
			  e)
			: t
		: (console.warn("[swup] options.resolveUrl needs to return a url"), e);
}
function At(e, t) {
	return this.resolveUrl(e) === this.resolveUrl(t);
}
const Rt = {
	animateHistoryBrowsing: !1,
	animationSelector: '[class*="transition-"]',
	animationScope: "html",
	cache: !0,
	containers: ["#swup"],
	ignoreVisit: (e, { el: t } = {}) =>
		!(t == null || !t.closest("[data-no-swup]")),
	linkSelector: "a[href]",
	linkToSelf: "scroll",
	native: !1,
	plugins: [],
	resolveUrl: (e) => e,
	requestHeaders: {
		"X-Requested-With": "swup",
		Accept: "text/html, application/xhtml+xml",
	},
	skipPopStateHandling: (e) => {
		var t;
		return ((t = e.state) == null ? void 0 : t.source) !== "swup";
	},
	timeout: 0,
};
class $t {
	constructor(t = {}) {
		var i, n;
		(this.version = "4.6.0"),
			(this.options = void 0),
			(this.defaults = Rt),
			(this.plugins = []),
			(this.visit = void 0),
			(this.cache = void 0),
			(this.hooks = void 0),
			(this.classes = void 0),
			(this.currentPageUrl = k()),
			(this.currentHistoryIndex = void 0),
			(this.clickDelegate = void 0),
			(this.navigating = !1),
			(this.onVisitEnd = void 0),
			(this.use = kt),
			(this.unuse = xt),
			(this.findPlugin = Ct),
			(this.log = () => {}),
			(this.navigate = vt),
			(this.performNavigation = gt),
			(this.createVisit = dt),
			(this.delegateEvent = at),
			(this.fetchPage = ct),
			(this.awaitAnimations = mt),
			(this.renderPage = St),
			(this.replaceContent = yt),
			(this.animatePageIn = bt),
			(this.animatePageOut = wt),
			(this.scrollToContent = Et),
			(this.getAnchorElement = pt),
			(this.getCurrentUrl = k),
			(this.resolveUrl = Pt),
			(this.isSameResolvedUrl = At),
			(this.options = y({}, this.defaults, t)),
			(this.handleLinkClick = this.handleLinkClick.bind(this)),
			(this.handlePopState = this.handlePopState.bind(this)),
			(this.cache = new lt(this)),
			(this.classes = new ut(this)),
			(this.hooks = new ft(this)),
			(this.visit = this.createVisit({ to: "" })),
			(this.currentHistoryIndex =
				(i = (n = window.history.state) == null ? void 0 : n.index) !=
				null
					? i
					: 1),
			this.checkRequirements() && this.enable();
	}
	checkRequirements() {
		return (
			typeof Promise < "u" ||
			(console.warn("Promise is not supported"), !1)
		);
	}
	async enable() {
		var t;
		const { linkSelector: i } = this.options;
		(this.clickDelegate = this.delegateEvent(
			i,
			"click",
			this.handleLinkClick,
		)),
			window.addEventListener("popstate", this.handlePopState),
			this.options.animateHistoryBrowsing &&
				(window.history.scrollRestoration = "manual"),
			(this.options.native =
				this.options.native && !!document.startViewTransition),
			this.options.plugins.forEach((n) => this.use(n)),
			((t = window.history.state) == null ? void 0 : t.source) !==
				"swup" && T(null, { index: this.currentHistoryIndex }),
			await z(),
			await this.hooks.call("enable", void 0, void 0, () => {
				const n = document.documentElement;
				n.classList.add("swup-enabled"),
					n.classList.toggle("swup-native", this.options.native);
			});
	}
	async destroy() {
		this.clickDelegate.destroy(),
			window.removeEventListener("popstate", this.handlePopState),
			this.cache.clear(),
			this.options.plugins.forEach((t) => this.unuse(t)),
			await this.hooks.call("disable", void 0, void 0, () => {
				const t = document.documentElement;
				t.classList.remove("swup-enabled"),
					t.classList.remove("swup-native");
			}),
			this.hooks.clear();
	}
	shouldIgnoreVisit(t, { el: i, event: n } = {}) {
		const { origin: r, url: s, hash: o } = A.fromUrl(t);
		return (
			r !== window.location.origin ||
			!(!i || !this.triggerWillOpenNewWindow(i)) ||
			!!this.options.ignoreVisit(s + o, { el: i, event: n })
		);
	}
	handleLinkClick(t) {
		const i = t.delegateTarget,
			{ href: n, url: r, hash: s } = A.fromElement(i);
		if (this.shouldIgnoreVisit(n, { el: i, event: t })) return;
		if (this.navigating && r === this.visit.to.url)
			return void t.preventDefault();
		const o = this.createVisit({ to: r, hash: s, el: i, event: t });
		t.metaKey || t.ctrlKey || t.shiftKey || t.altKey
			? this.hooks.callSync("link:newtab", o, { href: n })
			: t.button === 0 &&
			  this.hooks.callSync("link:click", o, { el: i, event: t }, () => {
					var a;
					const c = (a = o.from.url) != null ? a : "";
					t.preventDefault(),
						r && r !== c
							? this.isSameResolvedUrl(r, c) ||
							  this.performNavigation(o)
							: s
							  ? this.hooks.callSync(
										"link:anchor",
										o,
										{ hash: s },
										() => {
											T(r + s), this.scrollToContent(o);
										},
								  )
							  : this.hooks.callSync(
										"link:self",
										o,
										void 0,
										() => {
											this.options.linkToSelf ===
											"navigate"
												? this.performNavigation(o)
												: (T(r),
												  this.scrollToContent(o));
										},
								  );
			  });
	}
	handlePopState(t) {
		var i, n, r, s;
		const o =
			(i = (n = t.state) == null ? void 0 : n.url) != null
				? i
				: window.location.href;
		if (
			this.options.skipPopStateHandling(t) ||
			this.isSameResolvedUrl(k(), this.currentPageUrl)
		)
			return;
		const { url: a, hash: c } = A.fromUrl(o),
			h = this.createVisit({ to: a, hash: c, event: t });
		h.history.popstate = !0;
		const l =
			(r = (s = t.state) == null ? void 0 : s.index) != null ? r : 0;
		l &&
			l !== this.currentHistoryIndex &&
			((h.history.direction =
				l - this.currentHistoryIndex > 0 ? "forwards" : "backwards"),
			(this.currentHistoryIndex = l)),
			(h.animation.animate = !1),
			(h.scroll.reset = !1),
			(h.scroll.target = !1),
			this.options.animateHistoryBrowsing &&
				((h.animation.animate = !0), (h.scroll.reset = !0)),
			this.hooks.callSync("history:popstate", h, { event: t }, () => {
				this.performNavigation(h);
			});
	}
	triggerWillOpenNewWindow(t) {
		return !!t.matches('[download], [target="_blank"]');
	}
}
export {
	A as Location,
	K as classify,
	ot as createHistoryRecord,
	$t as default,
	at as delegateEvent,
	W as escapeCssIdentifier,
	Tt as forceReflow,
	k as getCurrentUrl,
	G as isPromise,
	Ut as matchPath,
	z as nextTick,
	q as query,
	V as queryAll,
	ht as runAsPromise,
	_ as toMs,
	T as updateHistoryRecord,
};
//# sourceMappingURL=Swup.modern.QWtOAMWR.js.map
