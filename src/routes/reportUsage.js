import middy from 'middy';
import wrapBottle from '../middleware/wrapBottle';
import bodyParser from '../middleware/bodyParser';
import ReportController from '../controllers/ReportController';

export default middy(async (event, context) => {
	const {
		key,
		method,
		milliseconds,
		memory,
		organizationId,
	} = event.body;

	// Super simple "security" so that random users can't hit this endpoint
	// without really trying
	if (key !== 'dogsdayafternoon') {
		return { status: 'REJECTED' };
	}

	const controller = new ReportController(context.bottle.container);

	await controller.report({
		milliseconds,
		memory,
		organizationId,
		method,
	});

	return { status: 'OK' };
})
	.use(bodyParser())
	.use(wrapBottle());
