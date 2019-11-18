import ContextManager from './ContextManager';

const myConnectors = {
	MyConnector: {},
};

function moduleFunc(/* connectors, context */) {
	return {
		MyDataModel: {
			fakeApiFn: () => 'fake api result',
		},
	};
}

describe('Context', () => {
	it('should add modules properly', () => {
		const context = new ContextManager(myConnectors);
		context.addModule(moduleFunc);
		expect(context.getModel('MyDataModel')).toMatchSnapshot();
		expect(context.models.MyDataModel).toMatchSnapshot();
	});

	it('should set and get auth data', () => {
		const context = new ContextManager(myConnectors);
		context.auth = {name: 'test'};
		expect(context.auth).toMatchSnapshot();
	});

	it('should retrieve the connectors', () => {
		const context = new ContextManager(myConnectors);
		expect(context.connectors).toMatchSnapshot();
	});
});