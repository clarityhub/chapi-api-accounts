import middy from 'middy';
import { httpHeaderNormalizer } from 'middy/middlewares';
import { createBottle, bootstrapBottle } from '../services';
import AccessKeysController from '../controllers/AccessKeysController';

const getAuthTypeFromHeader = (authorization) => {
	const parts = authorization.split(' ');

	return parts[0].toLowerCase();
};

const generatePolicy = (result, effect, resource) => {
	if (effect && resource) {
		return {
			principalId: result.principalId,
			policyDocument: {
				Version: '2012-10-17',
				Statement: [{
					Action: 'execute-api:Invoke',
					Effect: effect,
					Resource: resource,
				}],
			},
			context: {
				organizationId: result.organizationId,
			},
			usageIdentifierKey: result.principalId,
		};
	}

	return {
		principalId: result.principalId,
		// No policy
	};
};

const getAccessKeysFromHeader = (authorization) => {
	const parts = authorization.split(' ');

	if (parts && parts.length && parts.length > 1) {
		const buf = Buffer.from(parts[1], 'base64');
		const plainAuth = buf.toString();

		return plainAuth.split(':');
	}

	throw new Error('Malformed authorization header');
};

async function clarityHubPolicy({
	authorization, methodArn,
}, bottle) {
	// Get organization id from user:pass
	const [accessKeyId, accessKeySecret] = getAccessKeysFromHeader(authorization);

	const controller = new AccessKeysController(bottle.container);
	const items = await controller.check({ accessKeyId, accessKeySecret });

	if (items.length > 0) {
		const result = items[0];

		return generatePolicy({
			organizationId: result.organizationId,
			principalId: result.accessKeyId,
		}, 'Allow', methodArn);
	}

	return generatePolicy({ principalId: accessKeyId }, 'Deny', methodArn);
}

export default middy(async (event) => {
	const organizationId = event.headers['X-Clarityhub-Organization'];
	const authorization = event.headers.Authorization;
	const { methodArn } = event;
	const bottle = createBottle();

	try {
		await bootstrapBottle(bottle);

		if (!authorization) {
			return {
				statusCode: 402,
				message: 'Unauthenticated',
			};
		}

		const authType = getAuthTypeFromHeader(authorization);

		switch (authType) {
		case 'basic':
			// Clarity Hub Access Key
			return await clarityHubPolicy({
				organizationId,
				authorization,
				methodArn,
			}, bottle);
		case 'bearer':
		default:
			// Unknown auth type
			bottle.container.Logger.info('Malformed authorization header', authorization);
			throw new Error('Malformed authorization header');
		}
	} catch (err) {
		bottle.container.Logger.error(err);
		throw new Error('Something bad happened');
	}
})
	.use(httpHeaderNormalizer());
