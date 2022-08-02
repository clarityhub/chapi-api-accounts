import { getAll } from '../../src/routes/organizations';

describe('GET /accounts/organizations', () => {
	test('User logged in', async () => {
		const MOCK_EVENT = {
			path: '/organizations',
			body: '',
			requestContext: {
				httpMethod: 'GET',
				identity: {
					cognitoIdentityId: 'test-id',
				},
			},
		};

		const response = await getAll(MOCK_EVENT);

		expect(response.statusCode).toEqual(200);
		expect(typeof response.body).toBe('string');
	});
});
