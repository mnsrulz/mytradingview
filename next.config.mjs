/** @type {import('next').NextConfig} */
const nextConfig = {};

import { withLogtail } from '@logtail/next';

export default withLogtail(nextConfig);
