const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
process.env.DEMO_PASSWORD_RESET_ENABLED = 'false';
process.env.EMAIL_USER = '';
process.env.EMAIL_PASS = '';

const authRoutes = require('../routes/authRoutes');
const errorHandler = require('../middleware/errorHandler');

test('authenticated password change verifies current password and persists confirmed password', async () => {
  const mongo = await MongoMemoryServer.create({ instance: { dbName: 'change_password_test' } });
  await mongoose.connect(mongo.getUri('change_password_test'));

  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use(errorHandler);

  const server = await new Promise((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}/api/auth`;
  const post = async (path, body, token) => {
    const response = await fetch(`${baseUrl}/${path}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    return { status: response.status, body: await response.json() };
  };

  try {
    const signup = await post('register', {
      name: 'Password Change Test',
      email: 'password.change@example.com',
      phone: '9876500091',
      password: 'StartingPass123',
      roles: ['farmer'],
    });
    assert.equal(signup.status, 201);

    const login = await post('login', {
      identifier: 'password.change@example.com',
      password: 'StartingPass123',
    });
    assert.equal(login.status, 200);
    const token = login.body.token;

    const noToken = await post('change-password', {
      currentPassword: 'StartingPass123',
      newPassword: 'UpdatedPass123',
      confirmPassword: 'UpdatedPass123',
    });
    assert.equal(noToken.status, 401);

    const wrongCurrentPassword = await post('change-password', {
      currentPassword: 'WrongCurrent123',
      newPassword: 'UpdatedPass123',
      confirmPassword: 'UpdatedPass123',
    }, token);
    assert.equal(wrongCurrentPassword.status, 400);

    const mismatchedConfirmation = await post('change-password', {
      currentPassword: 'StartingPass123',
      newPassword: 'UpdatedPass123',
      confirmPassword: 'DifferentPass123',
    }, token);
    assert.equal(mismatchedConfirmation.status, 400);

    const changed = await post('change-password', {
      currentPassword: 'StartingPass123',
      newPassword: 'UpdatedPass123',
      confirmPassword: 'UpdatedPass123',
    }, token);
    assert.equal(changed.status, 200);

    const oldPasswordLogin = await post('login', {
      identifier: 'password.change@example.com',
      password: 'StartingPass123',
    });
    assert.equal(oldPasswordLogin.status, 401);

    const newPasswordLogin = await post('login', {
      identifier: 'password.change@example.com',
      password: 'UpdatedPass123',
    });
    assert.equal(newPasswordLogin.status, 200);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    await mongoose.disconnect();
    await mongo.stop();
  }
});
