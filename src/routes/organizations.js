import middy from 'middy';
import { cors } from 'middy/middlewares';

import OrganizationsController from '../controllers/OrganizationsController';
import httpSuccessHandler from '../middleware/httpSuccessHandler';
import httpErrorHandler from '../middleware/httpErrorHandler';
import wrapBottle from '../middleware/wrapBottle';
import bodyValidator from '../middleware/bodyValidator';
import bodyParser from '../middleware/bodyParser';
import getUsername from '../middleware/getUsername';

import organizationCreateRequestSchema from '../../schemas/organizationCreateRequest.json';

/**
 * Get All Organizations
 * GET /accounts/organizations
 */
export const getAll = middy(async (event, context) => {
	const controller = new OrganizationsController(context.bottle.container);
	const organizations = await controller.getAll({
		userId: context.username,
	});

	return {
		items: organizations,
	};
})
	.use(cors())
	.use(wrapBottle())
	.use(getUsername())
	.use(httpErrorHandler())
	.use(httpSuccessHandler());

/**
 * Create Organization
 * POST /accounts/organizations
 */
export const create = middy(async (event, context) => {
	const { organizationName } = event.body;
	const controller = new OrganizationsController(context.bottle.container);
	const organizationId = await controller.generateOrganizationId();

	// XXX this should be a controller method
	const [organization, organizationUser] = await Promise.all([
		controller.createOrganization({
			organizationId,
			organizationName,
			creatorUserId: context.username,
		}),
		controller.joinOrganization({
			organizationId,
			userId: context.username,
			email: context.email,
		}),
	]);
	// TODO rollback in-case of failure
	// See transactWriteItems

	return {
		item: {
			organization,
			organizationUser,
		},
	};
})
	.use(cors())
	.use(bodyParser())
	.use(wrapBottle())
	.use(getUsername())
	.use(bodyValidator({
		inputSchema: organizationCreateRequestSchema,
		ajvOptions: {
			allErrors: true,
		},
	}))
	.use(httpErrorHandler())
	.use(httpSuccessHandler());

export const get = middy(async (event, context) => {
	const { organizationId } = event.pathParameters;

	const controller = new OrganizationsController(context.bottle.container);
	const status = await controller.leaveOrganization({
		organizationId,
		userId: context.username,
	});

	return {
		item: {
			status,
		},
	};
})
	.use(cors())
	.use(bodyParser())
	.use(wrapBottle())
	.use(httpErrorHandler())
	.use(httpSuccessHandler());
