import debug from 'debug';
import pickBy from 'lodash/pickBy';
import pick from 'lodash/pick';
import {AbstractEntityService} from '../lib/AbstractEntityService';
import type {DomainConnectors} from '../core/DomainConnectors';
import type {Photo} from './Photo';

const d = debug('imperium.examples.domain.PhotoService');

function pickFields<T extends object>(obj: T | null, fields: string[]): Partial<T> | null {
	if (!obj) return obj;
	return pickBy(obj, (value, key) => {
		return fields.includes(key);
	});
}

export class PhotoService extends AbstractEntityService<Photo, DomainConnectors> {
	async getByName(name: string): Promise<Photo | null> {
		// this.authorization.throwUnlessCan('read', Photo);
		d('#############################################');
		const photo = await this.repo.findOne({name});
		// const a = this.authorization.permittedFieldsOf('read', photo);
		// d(`  Permitted fields: read ${photo?.name} as ${this.authorization.authUser?.auth?.id}`);
		// d(a);
		// d(`  Allowed: ${this.authorization.can('read', photo)}`);
		d('Source ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
		d(photo);
		// d('PickFields ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
		// const y = pickFields(photo, a);
		// d(y);
		// d('Can Loop ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
		// if (!photo) return photo;
		// Object.keys(photo).forEach(key => {
		// 	d(`  ${key}:${this.authorization.can('read', photo, key)}`);
		// });
		d('Strip ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
		const j = this.authorization.stripFields('read', photo);
		d(j);
		d('#############################################');
		return j;
	}
}
