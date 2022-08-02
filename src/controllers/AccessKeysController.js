import uuid from 'uuid';
import { Controller } from '@clarityhub/harmony-server';

export default class AccessKeysController extends Controller {
	async getAll({ organizationId }) {
		const params = {
			TableName: process.env.organizationAccessKeysTableName,
			KeyConditionExpression: 'organizationId = :organizationId',
			ExpressionAttributeValues: {
				':organizationId': organizationId,
			},
		};

		const data = await this.ioc.DynamoDB.query(params).promise();

		return data.Items;
	}

	async get({ organizationId, accessKeyId }) {
		const params = {
			TableName: process.env.organizationAccessKeysTableName,
			Key: {
				organizationId,
				accessKeyId,
			},
		};

		const data = await this.ioc.DynamoDB.get(params).promise();

		return data.Item;
	}

	async create({
		organizationId, userId, name, description,
	}) {
		const createdAt = Date.now();
		const modifiedAt = Date.now();
		const accessKeyId = uuid.v4();
		const accessKeySecret = uuid.v4();

		const params = {
			TableName: process.env.organizationAccessKeysTableName,
			Item: {
				organizationId,
				accessKeyId,
				name,
				description: description || null, // Allow empty strings
				creatorUserId: userId,
				createdAt,
				modifiedAt,
			},
		};
		const paramsSecret = {
			TableName: process.env.accessKeysTableName,
			Item: {
				organizationId,
				accessKeyId,
				accessKeySecret,
				creatorUserId: userId,
				createdAt,
				modifiedAt,
			},
		};

		await this.ioc.DynamoDB.put(params).promise();
		await this.ioc.DynamoDB.put(paramsSecret).promise();

		return {
			organizationId,
			accessKeyId,
			accessKeySecret,
			name,
			description,
			creatorUserId: userId,
			createdAt,
			modifiedAt,
		};
	}

	async edit({
		organizationId, accessKeyId, name, description,
	}) {
		const params = {
			TableName: process.env.organizationAccessKeysTableName,
			Key: {
				organizationId,
				accessKeyId,
			},
			ConditionExpression: 'organizationId = :organizationId and accessKeyId = :accessKeyId',
			UpdateExpression: 'set #name = :name, description = :description, modifiedAt = :modifiedAt',
			ExpressionAttributeNames: {
				'#name': 'name',
			},
			ExpressionAttributeValues: {
				':organizationId': organizationId,
				':accessKeyId': accessKeyId,
				':name': name,
				':description': description,
				':modifiedAt': Date.now(),
			},
			ReturnValues: 'ALL_NEW',
		};

		const data = await this.ioc.DynamoDB.update(params).promise();

		return data.Attributes;
	}

	async delete({ organizationId, accessKeyId }) {
		const params = {
			TableName: process.env.organizationAccessKeysTableName,
			Key: {
				organizationId,
				accessKeyId,
			},
		};

		const paramsSecret = {
			TableName: process.env.accessKeysTableName,
			Key: {
				organizationId,
				accessKeyId,
			},
		};

		await this.ioc.DynamoDB.delete(params).promise();
		await this.ioc.DynamoDB.delete(paramsSecret).promise();

		return true;
	}

	async check({ accessKeyId, accessKeySecret }) {
		// XXX change to a get by adding a global secondary index on accessKeyId+accessKeySecret
		// Checkout https://gist.github.com/DavidWells/c7df5df9c3e5039ee8c7c888aece2dd5
		const params = {
			TableName: process.env.accessKeysTableName,
			ProjectionExpression: 'accessKeyId, accessKeySecret, organizationId',
			FilterExpression: 'accessKeyId = :accessKeyId and accessKeySecret = :accessKeySecret',
			ExpressionAttributeValues: {
				':accessKeyId': accessKeyId,
				':accessKeySecret': accessKeySecret,
			},
		};

		const data = await this.ioc.DynamoDB.scan(params).promise();

		return data.Items;
	}
}
