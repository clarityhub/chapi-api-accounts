import OrganizationAuthorizer from '../authorizers/OrganizationAuthorizer';
import { InvalidRequestError } from '../utilities/errors';

export default function canAccessOrganization() {
	return {
		async before({ event, context }) {
			if (context.organization) {
				// Passthrough - organization has already been set
				return;
			}

			const organizationId = event.headers['X-Clarityhub-Organization'];
			const authorizer = new OrganizationAuthorizer(context.bottle.container);

			if (!organizationId) {
				throw new InvalidRequestError('You must provide an X-ClarityHub-Organization header');
			}

			await authorizer.check({
				organizationId,
				userId: context.username,
			});
		},
	};
}
