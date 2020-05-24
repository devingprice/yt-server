process.env.NODE_ENV = 'test';
process.env.APP = 'test';

const models = require('../models');
const seed = require('./seed');

let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
let server = require('../app.js');
let should = chai.should();

describe('Collections', () => {
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

  describe('GET /collection/:collection_id', () => {
    it('it should 404 a request without a collection id', done => {
      chai
        .request(server)
        .get('/collection/')
        .set('Authorization', token)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          res.body.message.should.equal('Not Found');
          res.body.should.have.property('error');
          res.body.error.should.have.property('status');
          res.body.error.status.should.equal(404);
          done();
        });
    });

    it('it should reject a request for a non existant collection', done => {
      chai
        .request(server)
        .get('/collection/999')
        .set('Authorization', token)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.success.should.equal(false);
          res.body.should.have.property('error');
          res.body.error.should.equal('collection not found with id: 999');
          done();
        });
    });

    it('it should not reject an unauthenticated request', done => {
      chai
        .request(server)
        .get('/collection/1')
        .end((err, res) => {
          should.fail('WIP');
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('success');
          res.body.success.should.equal(true);
          res.body.should.have.property('collection');
          res.body.collection.should.be.a('object');
          res.body.collection.have.property('id');
          res.body.collection.have.property('name');
          res.body.collection.have.property('ownerId');
          res.body.collection.have.property('channels');
          res.body.collection.id.should.equal(1);
          done();
        });
    });

    it('it should return a collection object', done => {
      chai
        .request(server)
        .get('/collection/1')
        .set('Authorization', token)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('success');
          res.body.success.should.equal(true);
          res.body.should.have.property('collection');
          res.body.collection.should.be.a('object');
          res.body.collection.should.have.property('id');
          res.body.collection.should.have.property('name');
          res.body.collection.should.have.property('ownerId');
          res.body.collection.should.have.property('channels');
          res.body.collection.id.should.equal(1);
          done();
        });
    });

    // In future upgrades
    // it should not return a collection if collection is private and user is not owner
  });

  describe('PUT /collection/:collection_id', () => {
    const newName = 'Renamed Collection';

    it('it should 404 a request without a collection id', done => {
      chai
        .request(server)
        .put('/collection/')
        .set('Authorization', token)
        .send({ name: newName })
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          res.body.message.should.equal('Not Found');
          res.body.should.have.property('error');
          res.body.error.should.have.property('status');
          res.body.error.status.should.equal(404);
          done();
        });
    });

    it('it should reject a request for a non existant collection', done => {
      chai
        .request(server)
        .put('/collection/999')
        .set('Authorization', token)
        .send({ name: newName })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.success.should.equal(false);
          res.body.should.have.property('error');
          res.body.error.should.equal('collection not found with id: 999');
          done();
        });
    });

    it('it should rename collection successfully', done => {
      chai
        .request(server)
        .put('/collection/1')
        .set('Authorization', token)
        .send({ name: newName })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('success');
          res.body.success.should.equal(true);
          res.body.should.have.property('collection');
          res.body.collection.should.be.a('object');
          res.body.collection.should.have.property('id');
          res.body.collection.should.have.property('name');
          res.body.collection.should.have.property('ownerId');
          res.body.collection.id.should.equal(1);
          res.body.collection.name.should.equal(newName);
          done();
        });
    });
  });
});
