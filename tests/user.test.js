process.env.NODE_ENV = 'test';
process.env.APP = 'test';

//let Book = require('../app/models/book');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app.js');
// eslint-disable-next-line no-unused-vars
let should = chai.should();

chai.use(chaiHttp);
describe('Testing Test', () => {
  // beforeEach(done => {
  //   Book.remove({}, err => {
  //     done();
  //   });
  // });

  describe('/GET index route', () => {
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
