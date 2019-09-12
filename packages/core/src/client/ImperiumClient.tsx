import React from 'react';
import {render} from 'react-dom';
import debug from 'debug';
import isFunction from 'lodash/isFunction';
import isArray from 'lodash/isArray';
import flowRight from 'lodash/flowRight';
import Root from './components/Root';
import {Hoc, ImperiumClientModule, ImperiumClientOptions, ImperiumRoute, RootProps} from '../../types';

const d = debug('imperium.core.client');

export default class ImperiumClient {
	_clientModules: ImperiumClientModule[];
	_rootRoute: ImperiumRoute;
	_routeDefaults: {[key: string]: any};

	_initialConf: {[key: string]: any};
	_initialState: {[key: string]: any};

	constructor(options: ImperiumClientOptions) {
		// @ts-ignore
		this._initialConf = window.__INITIAL_CONF__; // eslint-disable-line no-underscore-dangle
		this._initialState = {};
		this._clientModules = [];
		this._routeDefaults = {};
		this._rootRoute = {
			path: '/',
			exact: true,
			component: () => <div>Undefined Imperium Root Route</div>,
		};

		if (options.routeDefaults) {
			this._routeDefaults = options.routeDefaults;
		}

		if (options.rootRoute) {
			this._rootRoute = options.rootRoute;
		}

		// Loading client module definitions
		if (options.clientModules) {
			// Load module definitions
			this._clientModules = options.clientModules.map(moduleFunc => {
				const moduleDefinition = moduleFunc();
				d(`Loading client module: ${moduleDefinition.name || 'unnamed module'}`);
				return moduleDefinition;
			});
		}
	}

	async start() {
		// if (this._initialState) throw new Error('Client already started');
		d('Starting ImperiumClient...');

		// Build initial state
		this._initialState = await this._clientModules.reduce(async (memo, module) => {
			const state = await memo;
			if (module.initialState && isFunction(module.initialState)) {
				const moreState = await module.initialState(this._initialConf, state);
				if (moreState) {
					return {
						...state,
						...moreState,
					};
				}
				return state;
			}
			return state;
		}, Promise.resolve({}));

		// Run startup functions
		const rootProps = this._clientModules.reduce((memo, module): RootProps => {
			if (module.startup && isFunction(module.startup)) {
				return {
					...memo,
					...module.startup(this),
				};
			}
			return memo;
		}, {});

		// Load routes
		const routes = this._clientModules.reduce(
			(memo, module): ImperiumRoute[] => {
				if (module.routes && isArray(module.routes)) return [...memo, ...module.routes];
				return memo;
			},
			[this._rootRoute] as ImperiumRoute[],
		);

		// HOC's
		const hocs = this._clientModules.reduce(
			(memo, module) => {
				if (module.hocs && isArray(module.hocs)) return [...memo, ...module.hocs];
				return memo;
			},
			[] as Hoc[],
		);
		const hoc = flowRight(hocs);

		// Render the root component
		// The composed HOC's are executed here as well.
		render(
			<Root hoc={hoc(this)} routes={routes} rootProps={rootProps} routeDefaults={this._routeDefaults} />,
			document.getElementById('root'),
		);
	}

	get initialState() {
		return this._initialState;
	}

	get initialConf() {
		return this._initialConf;
	}
}
