/**
 * Create a partial filterExpression and expressionAttributeValues
 *
 * @param {*} arr
 * @param {*} prefix
 */
export default function createInExpression(arr, prefix = 'param') {
	const expressionValues = {};
	const filter = arr.map((el, i) => {
		const param = `:${prefix}${i}`;
		expressionValues[param] = el;
		return param;
	}).join(',');

	return [filter, expressionValues];
}
