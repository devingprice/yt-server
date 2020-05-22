process.env.NODE_ENV = 'test';
process.env.APP = 'test';

const models = require('../models');
const seed = require('./seed');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app.js');
// eslint-disable-next-line no-unused-vars
let should = chai.should();

chai.use(chaiHttp);
describe('Testing Users', () => {
  beforeEach(done => {
    models.sequelize
      .sync({ force: true, match: /_test$/, logging: false })
      .then(() => {
        return seed(models);
      })
      .then(() => done());
  });

  describe('POST /users', () => {
    it('it should not POST a user without email included', done => {
      chai
        .request(server)
        .post('/users')
        .end((err, res) => {
          res.body.success.should.equal(false);
          res.should.have.status(200);
          done();
        });
    });

    it('it should POST a user with correct details', done => {
      let userDetails = {
        email: 'test@gmail.com',
        password: 's3cureP@ss'
      };
      chai
        .request(server)
        .post('/users')
        .send(userDetails)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.have.property('user');
          res.body.user.should.have.property('id');
          res.body.should.have.property('token');
          res.body.success.should.equal(true);
          done();
        });
    });
  });

  describe('POST /users/login', () => {
    it('it should reject an incorrect username', done => {
      let userDetails = {
        email: 'randomIncorrect@email.com',
        password: 'randomPass'
      };
      chai
        .request(server)
        .post('/users/login')
        .send(userDetails)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.success.should.equal(false);
          res.body.error.should.equal('Not registered');
          done();
        });
    });

    it('it should reject an incorrect password', done => {
      let seedUser = {
        email: 'dumbyTest@email.com',
        password: 'incorrect'
      };
      chai
        .request(server)
        .post('/users/login')
        .send(seedUser)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.success.should.equal(false);
          done();
        });
    });

    it('it should return a token for a correct username/password', done => {
      let seedUser = {
        email: 'dumbyTest@email.com',
        password: 's3cureP@ss'
      };
      chai
        .request(server)
        .post('/users/login')
        .send(seedUser)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.success.should.equal(true);
          res.body.should.be.a('object');
          res.body.should.have.property('token');
          res.body.should.have.property('user');
          res.body.user.should.have.property('id');
          res.body.user.should.have.property('email');
          res.body.user.email.should.have.equal(seedUser.email);
          done();
        });
    });
  });
});
