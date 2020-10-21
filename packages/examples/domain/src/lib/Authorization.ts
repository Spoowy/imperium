import debug from 'debug';
import {Ability, AbilityTuple, CanParameters, RawRuleOf} from '@casl/ability';
import {packRules, permittedFieldsOf, unpackRules} from '@casl/ability/extra';
import type {AuthenticatedUser} from '@imperium/connector';
import {environment} from './environment';

const d = debug('imperium.examples.domain.Authorization');
const env = environment();

interface AuthorizationOpts<A extends AbilityTuple, U> {
	defineRulesFor: (user: U | null) => RawRuleOf<Ability<A>>[];
	getUserById: (id: string) => Promise<U | null>;
	setCache: (key: string, data: any, expire?: number) => Promise<typeof data>;
	getCache: (key: string) => Promise<any>;
}

/*
  # Authorization

	## Create Instance
	On every request, you create a new instance of the Authorization class, using the currently logged in user id.

	The Authorization class is a generic with the following types:
	  - A extends AbilityTuple: Is a type of a tuple of your action strings and entity strings.
	  - U: The type of your user object.

	## Prepare
	Next you have to prepare the authorization library with 3 things:
	  - a defineRulesFor function
	  - a getUserById function
	  - getCache and setCache functions

	### `defineRulesFor`
	This function takes in a user object of type U (or null) and returns a Casl `rules` object.
	Here you can define Casl rule logic for authorization.

	### `getUserById`
	This function needs to find a user by its ID (with no authorization taking place) or return null if not found.

	### `getCache` and `setCache`
	You can use any caching mechanism for caching authorization logic.

	## Use

	### `can()`
	This function returns a boolean and operated the same as Casl `can()` method.

	### `throwUnlessCan`
	This function throws an error if the action(s) cannot be performed.
 */
export class Authorization<A extends AbilityTuple, U> {
	public ability: Ability<A>;
	public readonly authUser?: AuthenticatedUser;

	constructor(authenticatedUser?: AuthenticatedUser) {
		this.authUser = authenticatedUser;
		this.ability = new Ability<A>();
	}

	public async prepare({defineRulesFor, getUserById, getCache, setCache}: AuthorizationOpts<A, U>) {
		const cacheKey = `imp:auth:rules:${this.authUser?.auth?.id || 'anonymous'}`;
		const packedRules = await getCache(cacheKey);
		if (packedRules) {
			const unpackedRules = unpackRules(packedRules);
			this.ability = new Ability(unpackedRules);
			return;
		}

		let rules;
		if (this.authUser?.auth?.id) {
			const u = await getUserById(this.authUser.auth.id);
			rules = defineRulesFor(u);
		} else {
			rules = defineRulesFor(null);
		}

		await setCache(cacheKey, packRules(rules), env.authorizationCacheTTL);
		this.ability = new Ability<A>(rules);
	}

	public throwUnlessCan(action: A[0], subject: A[1], field?: string | string[]) {
		if (Array.isArray(field)) {
			field.forEach(f => this.throwUnlessCan(action, subject, f));
			return;
		}
		// @ts-ignore TODO I'm not sure what the correct Typescript is here.
		const result = this.ability.can(action, subject, field);
		if (!result) throw new Error(`Unauthorized: ${action}`);
	}

	public can(...args: CanParameters<A>) {
		return this.ability.can(...args);
	}

	public permittedFieldsOf(action: A[0], subject: A[1]) {
		return permittedFieldsOf(this.ability, action, subject);
	}

	public stripFields(action: A[0], obj: A[1] | null): A[1] | null {
		if (!obj) return obj;
		return Object.keys(obj).reduce((memo, v) => {
			if (this.can(action, obj, v)) {
				return {
					...memo,
					[v]: obj[v],
				};
			}
			return memo;
		}, {} as Partial<A[1]>);
	}
}
