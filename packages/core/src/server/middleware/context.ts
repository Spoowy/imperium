import debug from 'debug';
import isFunction from 'lodash/isFunction';
import ContextMap from './ContextMap';
import {Connectors, ImperiumRequestHandler, ServerModule} from '../../../types';

const d = debug('imperium.core.server.context');

interface ContextMiddlewareOptions {
	connectors: Connectors,
	modules: ServerModule[],
}

/**
 * Express middleware that creates the context (data models & auth info).
 *
 * Adds .context to the req
 *
 * @param connectors
 * @param modules
 * @returns {function(*, *, *)}
 */
export default function context({connectors, modules}: ContextMiddlewareOptions): ImperiumRequestHandler {
	return (req, res, next) => {
		d('Creating context');

		const contextMap = new ContextMap(connectors); // Create a brand new instance of Context

		if (!modules) throw new Error('Modules are not defined');

		// Loop through each defined module and add it's data models (if any) to the context
		modules.forEach(module => {
			if (module.models && isFunction(module.models)) contextMap.addModule(module.models);
		});

		// Add the context object to the req
		req.context = contextMap;

		next();
	};
}