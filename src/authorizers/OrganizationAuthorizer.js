import { Controller } from '@clarityhub/harmony-server';

import { UnauthorizedError } from '../utilities/errors';

export default class OrganizationAuthorizer extends Controller {
	/**
     * Does the user have access to this org?
     */
	async check({ userId, organizationId }) {
		const params = {
			TableName: process.env.organizationUsersTableName,
			Key: {
				organizationId,
				userId,
			},
			AttributesToGet: ['organizationId'],
		};

		const data = await this.ioc.DynamoDB.get(params).promise();

		if (data && data.Item) {
			return data.Item;
		}

		throw new UnauthorizedError('You do not have access to this organization');
	}
}
