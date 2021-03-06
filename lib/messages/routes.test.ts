
import 'mocha';
import * as express from 'express';
import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';
import * as request from 'supertest';
import { Router } from 'express';
import { expect } from 'chai';

describe(__filename, () => {

    let sut: Router;
    let app: express.Express;
    let mocks: any;

    beforeEach(() => {
        app = express();

        mocks = {
            './dao': {
                getAllMessages: sinon.stub(),
                insertMessage: sinon.stub()
            }
        };

        sut = proxyquire('./routes', mocks);
        app.use('/messages', sut);
    });

    it('Should get all messages from the dao', (done) => {

        const mockMessages = [{
            _id: '1',
            body: 'foo'
        }, {
            _id: '2',
            body: 'bar'
        }];
        mocks['./dao'].getAllMessages.returns(Promise.resolve(mockMessages));

        request(app)
            .get('/messages')
            .expect((res: any) => {
                expect(res.body).to.eql({
                    1: 'foo',
                    2: 'bar'
                });
            })
            .expect(200, done);
    });

    it('Should insert a record into the dao', (done) => {
        mocks['./dao'].insertMessage.returns(Promise.resolve());

        request(app)
            .put('/messages')
            .set('Content-Type', 'application/json')
            .send({ message: 'fooMessage' })
            .expect(() => {
                expect(mocks['./dao'].insertMessage.callCount).to.eql(1);
                const arg = mocks['./dao'].insertMessage.getCall(0).args[0];
                expect(arg).to.eql('fooMessage');
            })
            .expect(201, done);
    });

    it('Should get an error on malformed request', (done) => {
        request(app)
            .put('/messages')
            .set('Content-Type', 'application/json')
            .send({ nope: true })
            .expect(500, done);
    });
});
