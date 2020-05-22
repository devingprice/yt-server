process.env.NODE_ENV = 'test';
process.env.APP = 'test';

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app.js');
// eslint-disable-next-line no-unused-vars
let should = chai.should();

chai.use(chaiHttp);
describe('Testing Test', () => {
  describe('GET /', () => {
    it('it should return a success response', done => {
      chai
        .request(server)
        .get('/')
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });
});
