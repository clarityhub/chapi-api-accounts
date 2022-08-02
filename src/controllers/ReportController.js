import { Controller } from '@clarityhub/harmony-server';

const STANDARD_MILLISECONDS = 100.0;
const STANDARD_MEMORY = 512.0;

/*
 * Takes the given miliseconds and memory and translates them
 * into a "rate" where 1 rate is 100 milliseconds of 512 MB of memory.
 *
 * If you use 1024 MB of memory, your rate usage is effectively doubled.
 */
const standardize = (milliseconds, memory) => {
	return milliseconds * memory / (STANDARD_MILLISECONDS * STANDARD_MEMORY);
};

export default class ReportController extends Controller {
	async report({
		method, milliseconds, memory, organizationId,
	}) {
		const params = {
			TableName: process.env.reportTableName,
			Item: {
				organizationId,
				method,
				memory,
				milliseconds,
				rate: standardize(milliseconds, memory),
				createdAt: Date.now(),
			},
		};

		await this.ioc.DynamoDB.put(params).promise();
		return params.Item;
	}
}
