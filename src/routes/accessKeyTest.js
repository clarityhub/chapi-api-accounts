import middy from 'middy';
import {
	cors,
} from 'middy/middlewares';

import httpSuccessHandler from '../middleware/httpSuccessHandler';
import httpErrorHandler from '../middleware/httpErrorHandler';

export default middy(async (event) => {
	const { organizationId } = event.requestContext.authorizer;

	return {
		organizationId,
		message: 'Success',
	};
})
	.use(cors())
	.use(httpErrorHandler())
	.use(httpSuccessHandler());
