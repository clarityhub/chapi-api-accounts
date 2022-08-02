import uuid from 'uuid';
import { Controller } from '@clarityhub/harmony-server';

import createInExpression from '../utilities/filterExpressions';
import BILLING_PLANS from '../enums/BillingPlans';

export default class OrganizationsController extends Controller {
	async generateOrganizationId() {
		return uuid.v4();
	}

	/**
	 * Get all Organizations that the userId belongs to
	 */
	async getAll({ userId }) {
		const params = {
			// XXX Change to query/get on userId
			TableName: process.env.organizationUsersTableName,
			ProjectionExpression: '#userId, organizationId',
			FilterExpression: '#userId = :userId',
			ExpressionAttributeNames: {
				'#userId': 'userId',
			},
			ExpressionAttributeValues: {
				':userId': userId,
			},
		};

		const data = await this.ioc.DynamoDB.scan(params).promise();
		const organizationUsers = data.Items;

		if (organizationUsers.length === 0) {
			return [];
		}

		const [filter, expressionValues] = createInExpression(
			organizationUsers.map(a => a.organizationId)
		);

		// XXX Change this scan to be parallel getitems
		const paramsOrganizations = {
			TableName: process.env.organizationsTableName,
			ProjectionExpression: '#organizationId, organizationName, creatorUserId, createdAt, modifiedAt',
			FilterExpression: `#organizationId IN (${filter})`,
			ExpressionAttributeNames: {
				'#organizationId': 'organizationId',
			},
			ExpressionAttributeValues: {
				...expressionValues,
			},
		};

		const dataOrganizations = await this.ioc.DynamoDB.scan(paramsOrganizations).promise();
		return dataOrganizations.Items;
	}

	/**
	 * Create a new Organization
	 */
	async createOrganization({ organizationId, organizationName, creatorUserId }) {
		const params = {
			TableName: process.env.organizationsTableName,
			Item: {
				organizationId: organizationId || uuid.v4(),
				organizationName,
				creatorUserId,
				billingPlan: BILLING_PLANS.FREE,
				createdAt: Date.now(),
				modifiedAt: Date.now(),
			},
		};

		await this.ioc.DynamoDB.put(params).promise();
		return params.Item;
	}

	/**
	 * Join an organization
	 */
	async joinOrganization({ organizationId, userId, email }) {
		const params = {
			TableName: process.env.organizationUsersTableName,
			Item: {
				userId,
				organizationId,
				email,
				createdAt: Date.now(),
				modifiedAt: Date.now(),
			},
		};

		await this.ioc.DynamoDB.put(params).promise();
		return params.Item;
	}

	async leaveOrganization({ organizationId, userId }) {
		const params = {
			TableName: process.env.organizationUsersTableName,
			Key: {
				userId,
				organizationId,
			},
		};

		await this.ioc.DynamoDB.delete(params).promise();
		return true;
	}
}
