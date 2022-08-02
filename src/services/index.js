/* eslint-disable-next-line import/no-extraneous-dependencies */
import AWS from 'aws-sdk';
import Bottle from 'bottlejs';

import RawDynamoDB from './RawDynamoDB';
import DynamoDB from './DynamoDB';
import Logger from './Logger';

export function createBottle() {
	const bottle = new Bottle();

	bottle.factory('AWS', () => AWS);
	bottle.service('RawDynamoDB', RawDynamoDB, 'AWS');
	bottle.service('DynamoDB', DynamoDB, 'AWS', 'RawDynamoDB');
	bottle.service('Logger', Logger);

	return bottle;
}

export async function bootstrapBottle(/* bottle */) {
	// Bootstrap any connections that must exist

}
