import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
	// Prevent Next.js 16 from generating AGENTS.md / CLAUDE.md automatically.
	agentRules: false,
};

export default withNextIntl(nextConfig);