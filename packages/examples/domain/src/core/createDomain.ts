/*
	This is the main export from the domain package. This function creates a new domain context
	and should be called on every request/operation.
 */
import debug from 'debug';
import type {AuthenticatedUser} from '@imperium/connector';
import {ImperiumBaseContext} from '@imperium/connector';
import {Authorization} from '../lib/Authorization';
import {AppAbilityTuple, defineRulesFor} from './defineRulesFor';
import type {DomainConnectors} from './DomainConnectors';
import type {User} from '../user';
import {entities} from './entities';
import {services} from './services';
import {SecureModel} from '../other';

const d = debug('imperium.examples.domain.createDomain');

export async function createDomain(connectors: DomainConnectors, authenticatedUser?: AuthenticatedUser) {
	d('*************************************************************');
	d(`Authenticated user: ${authenticatedUser?.auth?.id}`);

	// Create authorization instance
	const authorization = new Authorization<AppAbilityTuple, User>(authenticatedUser);

	// Create a new, blank Entity Manager
	const entityManager = connectors.connections.orm.em.fork(true, true);

	// This is the main context object that will be returned. You can make this look however you wish.
	const ctx = {
		...ImperiumBaseContext(),
		...entities,
		...services(entityManager, connectors, authorization),
		SecureModel,
		// We also tack on a reference to the connectors and the current entity manager.
		connectors,
		entityManager,
	};

	await authorization.prepare({
		defineRulesFor,
		getUserById: ctx.userService.getById__direct.bind(ctx.userService),
		getCache: connectors.connections.sharedCache.get.bind(connectors.connections.sharedCache),
		setCache: connectors.connections.sharedCache.set.bind(connectors.connections.sharedCache),
	});

	return ctx;
}
