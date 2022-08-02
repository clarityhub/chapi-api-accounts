/* eslint-disable import/prefer-default-export */

export class UnauthorizedError extends Error {
	constructor(...args) {
		super(...args);
		Error.captureStackTrace(this, UnauthorizedError);
		this.statusCode = 401;
	}
}

export class ValidationError extends Error {
	constructor(...args) {
		super(...args);
		Error.captureStackTrace(this, ValidationError);
		this.statusCode = 422;
	}
}

export class InvalidRequestError extends Error {
	constructor(...args) {
		super(...args);
		Error.captureStackTrace(this, InvalidRequestError);
		this.statusCode = 400;
	}
}

export class NotFoundError extends Error {
	constructor(...args) {
		super(...args);
		Error.captureStackTrace(this, NotFoundError);
		this.statusCode = 404;
	}
}


export class InternalServerError extends Error {
	constructor(...args) {
		super(...args);
		Error.captureStackTrace(this, InternalServerError);
		this.statusCode = 500;
	}
}
