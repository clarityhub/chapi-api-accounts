export default function bodyParser() {
	return {
		before({ event }, next) {
			event.body = JSON.parse(event.body);

			next();
		},
	};
}
