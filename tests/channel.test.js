process.env.NODE_ENV = 'test';
process.env.APP = 'test';

const models = require('../models');
const seed = require('./seed');

let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
let server = require('../app.js');

describe('Channels', () => {
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

  describe('POST /channel/:collection_id', () => {
    it('it should 404 a request without a collection id');
    it('it should reject a request for a non existant collection');
    it('it should reject unauthenticated request');
    it('it should reject unauthorized request');
    it('it should create a channel associated with collection');
  });

  describe('DELETE /channel/:channel_id', () => {
    it('it should 404 a request without a channel id');
    it('it should reject a request for a non existant channel');
    it('it should reject unauthenticated request');
    it('it should reject unauthorized request');
    it('it should remove channel from database');
  });
});
