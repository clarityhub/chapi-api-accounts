import middy from 'middy';
import { httpHeaderNormalizer } from 'middy/middlewares';
import jwk from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import request from 'request-promise';
import { createBottle, bootstrapBottle } from '../services';
import OrganizationAuthorizer from '../authorizers/OrganizationAuthorizer';
import { InvalidRequestError } from '../utilities/errors';
import { settled } from '../utilities/promises';

const iss = `https://cognito-idp.${process.env.REGION}.amazonaws.com/${process.env.USER_POOL_ID}`;

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

async function checkAllKeys(keys, token) {
	const verifies = await settled(keys.map((k) => {
		const jwkArray = {
			kty: k.kty,
			n: k.n,
			e: k.e,
		};

		const pem = jwkToPem(jwkArray);

		// Verify the token:
		return new Promise((resolve, reject) => {
			jwk.verify(token, pem, { issuer: iss }, async (err, decoded) => {
				if (err) {
					reject(new Error('Unauthorized'));
				}

				resolve(decoded);
			});
		});
	}));

	const resolved = verifies.find(v => v.state === 'fulfilled');

	if (!resolved) {
		// reject
		throw new Error('Unauthorized');
	}

	return resolved.value;
}

async function cognitoPolicy({
	authorization, organizationId, methodArn,
}, bottle) {
	// Remove 'bearer ' from token:
	const token = authorization.substring(7);
	// Make a request to the iss + .well-known/jwks.json URL:
	const response = await request({
		url: `${iss}/.well-known/jwks.json`,
		json: true,
		resolveWithFullResponse: true,
	});

	if (response.statusCode !== 200) {
		throw new Error('Unauthorized');
	}

	const { keys } = response.body;
	const decoded = await checkAllKeys(keys, token);

	// Can access organization;
	const authorizer = new OrganizationAuthorizer(bottle.container);

	if (!organizationId) {
		throw new InvalidRequestError('You must provide an X-ClarityHub-Organization header');
	}

	let userId = decoded.sub;

	if (process.env.STAGE === 'local') {
		userId = 'offline_username';
	}

	await authorizer.check({
		organizationId,
		userId,
	});

	return generatePolicy({
		principalId: userId,
		organizationId,
	}, 'Allow', methodArn);
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
		case 'bearer':
			// AWS Cognito
			return await cognitoPolicy({
				organizationId,
				authorization,
				methodArn,
			}, bottle);
		case 'basic':
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
