process.env.NODE_ENV = 'test';
process.env.APP = 'test';

const models = require('../models');
const seed = require('./seed');

let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
let server = require('../app.js');

describe('Follows', () => {
  const seedUser = {
    email: 'dumbyTest@email.com',
    password: 's3cureP@ss'
  };
  let token;

  beforeEach(done => {
    models.sequelize
      .sync({ force: true, match: /_test$/, logging: false })
      .then(() => {
        return seed(models);
      })
      .then(() => {
        chai
          .request(server)
          .post('/users/login')
          .send(seedUser)
          .end((err, res) => {
            token = res.body.token;
            done();
          });
      });
  });

  describe('POST /follow', () => {
    it('it should reject unauthenticated request');
    it('it should create a userCollection in database');
  });

  describe('PUT /follow/:follow_id', () => {
    it('it should 404 a request without a follow id');
    it('it should reject a request for a non existant follow');
    it('it should reject unauthenticated request');
    it('it should reject unauthorized request');
    it('it should update userCollection in database');
  });

  describe('DELETE /follow/:follow_id', () => {
    it('it should 404 a request without a follow id');
    it('it should reject a request for a non existant follow');
    it('it should reject unauthenticated request');
    it('it should reject unauthorized request');
    it('it should remove userCollection from database');
  });
});
