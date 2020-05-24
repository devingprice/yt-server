const models = require('../models');
const seed = require('./seed');

let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
let server = require('../app.js');
let should = chai.should();

describe('Users', () => {
  const seedUser = {
    email: 'dumbyTest@email.com',
    password: 's3cureP@ss'
  };

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
      let incorrectUser = {
        email: 'dumbyTest@email.com',
        password: 'incorrect'
      };
      chai
        .request(server)
        .post('/users/login')
        .send(incorrectUser)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.success.should.equal(false);
          done();
        });
    });

    it('it should return bearer token for a correct username/password', done => {
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

  describe('GET /users', () => {
    it('it should reject an unauthenticated request', done => {
      chai
        .request(server)
        .get('/users')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('it should return user for authenticated request', done => {
      chai
        .request(server)
        .post('/users/login')
        .send(seedUser)
        .end((err, res) => {
          let token = res.body.token;

          chai
            .request(server)
            .get('/users')
            .set('Authorization', token)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.success.should.equal(true);
              res.body.should.have.property('user');
              res.body.user.should.have.property('id');
              res.body.user.should.have.property('email');
              res.body.user.email.should.have.equal(seedUser.email);
              done();
            });
        });
    });
  });

  describe('PUT /users', () => {
    it('it should reject an unauthenticated request', done => {
      chai
        .request(server)
        .put('/users')
        .send({ first: 'changedName' })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('it should return success for authorized firstname change', async () => {
      const loginRes = await chai
        .request(server)
        .post('/users/login')
        .send(seedUser);

      loginRes.should.have.status(200);
      loginRes.body.should.be.a('object');
      loginRes.body.should.have.property('token');

      const token = loginRes.body.token;
      const originalFirstName = loginRes.body.user.first;
      originalFirstName.should.equal('Dumb');

      const res = await chai
        .request(server)
        .put('/users')
        .set('Authorization', token)
        .send({ first: 'updatedFirstName' });

      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.success.should.equal(true);
      res.body.should.have.property('message');
      res.body.message.should.equal('Updated User: dumbyTest@email.com');

      const userRes = await chai
        .request(server)
        .get('/users')
        .set('Authorization', token);

      userRes.should.have.status(200);
      userRes.body.should.be.a('object');
      userRes.body.should.have.property('user');
      userRes.body.user.should.have.property('email');
      userRes.body.user.email.should.equal(seedUser.email);
      userRes.body.user.should.property('first');
      userRes.body.user.first.should.equal('updatedFirstName');
    });

    // sequelize model.set ignores data that is not in columns without error
    // formerly: it should reject authorized request with faulty parameters

    it('it should return success for authorized email change', async () => {
      const newEmail = 'uniqueEmail@gmail.com';

      const loginRes = await chai
        .request(server)
        .post('/users/login')
        .send(seedUser);

      loginRes.should.have.status(200);
      loginRes.body.should.be.a('object');
      loginRes.body.should.have.property('token');

      const token = loginRes.body.token;
      const originalUserInfo = loginRes.body.user;

      const res = await chai
        .request(server)
        .put('/users')
        .set('Authorization', token)
        .send({ email: newEmail });

      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.success.should.equal(true);
      res.body.should.have.property('message');
      res.body.message.should.equal('Updated User: ' + newEmail);

      const userRes = await chai
        .request(server)
        .get('/users')
        .set('Authorization', token);

      userRes.should.have.status(200);
      userRes.body.should.be.a('object');
      userRes.body.should.have.property('user');
      userRes.body.user.email.should.equal(newEmail);
      userRes.body.user.id.should.equal(originalUserInfo.id);
      userRes.body.user.first.should.equal(originalUserInfo.first);
      userRes.body.user.last.should.equal(originalUserInfo.last);
      userRes.body.user.phone.should.equal(originalUserInfo.phone);
      userRes.body.user.password.should.equal(originalUserInfo.password);
    });

    it('it should fail for authorized email change when email is already in use', async () => {
      const newEmail = 'dumber@email.com';

      const loginRes = await chai
        .request(server)
        .post('/users/login')
        .send(seedUser);

      loginRes.should.have.status(200);
      loginRes.body.should.be.a('object');
      loginRes.body.should.have.property('token');

      const token = loginRes.body.token;
      const originalEmail = loginRes.body.user.email;

      const res = await chai
        .request(server)
        .put('/users')
        .set('Authorization', token)
        .send({ email: newEmail });

      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.success.should.equal(false);
      res.body.should.have.property('error');
      res.body.error.should.equal(
        'The email address or phone number is already in use'
      );

      // make sure old login still works
      const userRes = await chai
        .request(server)
        .get('/users')
        .set('Authorization', token);

      userRes.should.have.status(200);
      userRes.body.should.be.a('object');
      userRes.body.should.have.property('user');
      userRes.body.user.email.should.equal(originalEmail);
    });

    // token does not expire on password change
    it('it should return success for authorized password change', async () => {
      const newPass = 'R@nd0mN3wPas5';

      const loginRes = await chai
        .request(server)
        .post('/users/login')
        .send(seedUser);

      loginRes.should.have.status(200);
      loginRes.body.should.be.a('object');
      loginRes.body.should.have.property('token');

      const token = loginRes.body.token;

      const res = await chai
        .request(server)
        .put('/users')
        .set('Authorization', token)
        .send({ password: newPass });

      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.success.should.equal(true);
      res.body.should.have.property('message');
      res.body.message.should.equal('Updated User: dumbyTest@email.com');

      // old pass should fail
      const oldPassLoginRes = await chai
        .request(server)
        .post('/users/login')
        .send(seedUser);

      oldPassLoginRes.should.have.status(422);

      // should pass
      const newLoginRes = await chai
        .request(server)
        .post('/users/login')
        .send({ email: seedUser.email, password: newPass });

      newLoginRes.should.have.status(200);
      newLoginRes.body.should.be.a('object');
      newLoginRes.body.should.have.property('token');
    });
  });

  describe('DELETE /users', () => {
    it('it should reject an unauthenticated request', done => {
      chai
        .request(server)
        .delete('/users')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('it should return success for authorized request', async () => {
      const loginRes = await chai
        .request(server)
        .post('/users/login')
        .send(seedUser);

      loginRes.should.have.status(200);
      loginRes.body.should.be.a('object');
      loginRes.body.should.have.property('token');

      const token = loginRes.body.token;

      const res = await chai
        .request(server)
        .delete('/users')
        .set('Authorization', token);

      res.should.have.status(204);
    });

    // currently removes the ownerId from collection table
    it('it should remove user/collections/channels from database on success', done => {
      should.fail('WIP');
      done();
    });
  });
});
