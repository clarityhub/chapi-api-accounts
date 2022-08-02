import middy from 'middy';

import httpSuccessHandler from '../middleware/httpSuccessHandler';
import httpErrorHandler from '../middleware/httpErrorHandler';
import wrapBottle from '../middleware/wrapBottle';

import { settled } from '../utilities/promises';

async function checkDynamoDBConnection(ioc) {
	try {
		await ioc.RawDynamoDB.listTables().promise();

		return {
			status: 'OK',
		};
	} catch (err) {
		ioc.Logger.error(err);
		return {
			status: 'SICK',
			message: JSON.stringify(err),
		};
	}
}

export default middy(async (event, context) => {
	const values = await settled([
		checkDynamoDBConnection(context.bottle.container),
	]);

	const dynamoDBStatus = values[0].value;

	const allServicesOkay = dynamoDBStatus.status === 'OK';
	const message = {
		status: allServicesOkay ? 'OK' : 'SICK',
		items: [{
			service: 'DynamoDB',
			status: dynamoDBStatus,
		}],
	};

	if (allServicesOkay) {
		return message;
	}

	return {
		statusCode: 500,
		body: JSON.stringify(message),
	};
})
	.use(wrapBottle())
	.use(httpErrorHandler())
	.use(httpSuccessHandler());
