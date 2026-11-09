/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://lorbegaxjcsvikqxandw.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'sb_publishable_fGgXpt5W9lU64V3LlgTidQ_y7XzPz83',
  },
};

export default nextConfig;
