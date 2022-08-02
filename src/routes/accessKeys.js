import middy from 'middy';
import {
	cors,
	httpHeaderNormalizer,
} from 'middy/middlewares';

import AccessKeysController from '../controllers/AccessKeysController';

import { NotFoundError } from '../utilities/errors';

import canAccessOrganization from '../middleware/canAccessOrganization';
import wrapBottle from '../middleware/wrapBottle';
import httpSuccessHandler from '../middleware/httpSuccessHandler';
import httpErrorHandler from '../middleware/httpErrorHandler';
import bodyValidator from '../middleware/bodyValidator';
import bodyParser from '../middleware/bodyParser';
import getUsername from '../middleware/getUsername';

import accessKeyCreateRequestSchema from '../../schemas/accessKeyCreateRequest.json';
import accessKeyEditRequestSchema from '../../schemas/accessKeyEditRequest.json';

/**
 * Get Access keys
 * GET /accounts/access-keys
 * Header: X-Clarityhub-Organization: orgId
 */
export const getAll = middy(async (event, context) => {
	const organizationId = event.headers['X-Clarityhub-Organization'];
	const controller = new AccessKeysController(context.bottle.container);

	const accessKeys = await controller.getAll({
		organizationId,
	});

	return {
		items: accessKeys,
	};
})
	.use(cors())
	.use(httpHeaderNormalizer())
	.use(wrapBottle())
	.use(getUsername())
	.use(canAccessOrganization())
	.use(httpErrorHandler())
	.use(httpSuccessHandler());

/**
 * Get Access key
 * GET /accounts/access-keys/{accessKeyId}
 * Header: X-Clarityhub-Organization: orgId
 */
export const get = middy(async (event, context) => {
	const organizationId = event.headers['X-Clarityhub-Organization'];
	const { accessKeyId } = event.pathParameters;

	const controller = new AccessKeysController(context.bottle.container);

	const accessKey = await controller.get({
		organizationId,
		accessKeyId,
	});

	if (!accessKey) {
		throw new NotFoundError('Access Key not found');
	}

	return {
		item: accessKey,
	};
})
	.use(cors())
	.use(bodyParser())
	.use(httpHeaderNormalizer())
	.use(wrapBottle())
	.use(getUsername())
	.use(canAccessOrganization())
	.use(httpErrorHandler())
	.use(httpSuccessHandler());

/**
 * Create Access key
 * POST /accounts/access-keys
 * Header: X-Clarityhub-Organization: orgId
 */
export const create = middy(async (event, context) => {
	const organizationId = event.headers['X-Clarityhub-Organization'];
	const { name, description } = event.body;

	const controller = new AccessKeysController(context.bottle.container);

	const accessKey = await controller.create({
		organizationId,
		userId: context.username,
		name,
		description,
	});

	return {
		item: accessKey,
	};
})
	.use(cors())
	.use(bodyParser())
	.use(httpHeaderNormalizer())
	.use(wrapBottle())
	.use(getUsername())
	.use(bodyValidator({
		inputSchema: accessKeyCreateRequestSchema,
		ajvOptions: {
			allErrors: true,
		},
	}))
	.use(canAccessOrganization())
	.use(httpErrorHandler())
	.use(httpSuccessHandler());

/**
 * Edit Access key
 * PUT /accounts/access-keys/:accessKeyId
 * Header: X-Clarityhub-Organization: orgId
 */
export const edit = middy(async (event, context) => {
	const organizationId = event.headers['X-Clarityhub-Organization'];
	const { accessKeyId } = event.pathParameters;
	const { name, description } = event.body;

	const controller = new AccessKeysController(context.bottle.container);

	const accessKey = await controller.edit({
		accessKeyId,
		organizationId,
		name,
		description,
	});

	return {
		item: accessKey,
	};
})
	.use(cors())
	.use(bodyParser())
	.use(httpHeaderNormalizer())
	.use(wrapBottle())
	.use(bodyValidator({
		inputSchema: accessKeyEditRequestSchema,
		ajvOptions: {
			allErrors: true,
		},
	}))
	.use(getUsername())
	.use(canAccessOrganization())
	.use(httpErrorHandler())
	.use(httpSuccessHandler());

/**
 * Delete Access key
 * DELETE /accounts/access-keys/:accessKeyId
 * Header: X-Clarityhub-Organization: orgId
 */
export const del = middy(async (event, context) => {
	const organizationId = event.headers['X-Clarityhub-Organization'];
	const { accessKeyId } = event.pathParameters;

	const controller = new AccessKeysController(context.bottle.container);

	const accessKey = await controller.delete({
		accessKeyId,
		organizationId,
	});

	return {
		item: accessKey,
	};
})
	.use(cors())
	.use(bodyParser())
	.use(httpHeaderNormalizer())
	.use(wrapBottle())
	.use(getUsername())
	.use(canAccessOrganization())
	.use(httpErrorHandler())
	.use(httpSuccessHandler());
