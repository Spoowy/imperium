import type {EntityManager} from '@mikro-orm/core';
import {UserService} from '../user';
import type {DomainConnectors} from './DomainConnectors';
import {CategoryService, PhotoService, CommentService} from '../photo';
import {entities} from './entities';
import type {Authorization} from '../lib/Authorization';

/*
	Services usually need instances created for the current request, we create those here.
 */
export function services(em: EntityManager, conn: DomainConnectors, authorization: Authorization<any, any>) {
	return {
		userService: new UserService(em, em.getRepository(entities.User), conn, authorization),
		categoryService: new CategoryService(em, em.getRepository(entities.Category), conn, authorization),
		photoService: new PhotoService(em, em.getRepository(entities.Photo), conn, authorization),
		commentService: new CommentService(em, em.getRepository(entities.Comment), conn, authorization),
	};
}
