import type {EntityData, EntityRepository, EntityManager, FilterQuery} from '@mikro-orm/core';
import type {Connector} from '@imperium/connector';
import type {Authorization} from './Authorization';

/**
 * This abstract class can be extended to provide Domain Services for a single mikro-orm entity type.
 * T: Entity
 * C: Connectors
 */
export abstract class AbstractEntityService<T, C extends Connector> {
	protected readonly connectors: C;
	protected readonly authorization: Authorization<any, any>;
	protected readonly repo: EntityRepository<T>;
	protected readonly em: EntityManager;

	constructor(em: EntityManager, repo: EntityRepository<T>, conn: C, authorization: Authorization<any, any>) {
		this.connectors = conn;
		this.authorization = authorization;
		this.repo = repo;
		this.em = em;
	}

	create(data: EntityData<T>) {
		return this.repo.create(data);
	}

	add(obj: T) {
		this.repo.persist(obj);
	}

	getById(id: FilterQuery<T>) {
		return this.repo.findOne(id);
	}
}
