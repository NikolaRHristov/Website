// @ts-nocheck
import prefetch from "@astrojs/prefetch";
import sitemap from "@astrojs/sitemap";
import compress from "astro-compress";
import critters from "astro-critters";
import rome from "astro-rome";
import { defineConfig } from "astro/config";
import worker from "astrojs-service-worker";

export default defineConfig({
	site: "https://nikolahristov.tech",
	experimental: {
		assets: true,
	},
	integrations: [
		import.meta.env.MODE === "production" ? worker() : null,
		sitemap(),
		critters({ critters: {
			
		} }),
		prefetch(),
		rome({ logger: 1 }),
		compress({ logger: 1 }),
	],
});
