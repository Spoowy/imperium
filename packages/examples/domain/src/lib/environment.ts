import memoize from 'lodash/memoize';

export const environment = memoize(() => ({
	authorizationCacheTTL: parseInt(process.env.AUTH_CACHE_TTL || '60', 10),
}));
