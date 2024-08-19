/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ["page.tsx", "api.ts", "api.tsx"],
};

export default nextConfig;

/**
 * Para informar ao Next.js quais as extensões de arquivos queremos que ele
 * transforme em rotas/páginas da aplicação.
 *
 * Arquivo: next.config.js pageExtensions: ['page.tsx', 'api.ts', 'api.tsx']
 *
 * A partir de agora, todo arquivo que deverá ser uma página, precisa terminar
 * com page.tsx, inclusive o _app e o _document.
 *
 * Por exemplo: _app.page.tsx, _document.page.tsx, home.page.tsx, etc.
 */
