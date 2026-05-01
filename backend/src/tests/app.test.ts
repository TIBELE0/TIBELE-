import request from 'supertest';
import bcrypt from 'bcryptjs';
import { describe, expect, test } from '@jest/globals';
import { createApp } from '../app';
import prisma from '../config/prisma';

const { app } = createApp();

const getCsrf = async (agent: any): Promise<string> => {
  const csrfRes = await agent.get('/api/auth/csrf');
  return csrfRes.body.csrfToken as string;
};

const loginAsAdmin = async () => {
  const salt = parseInt(process.env.BCRYPT_SALT || '12', 10);
  const password = 'Admin1234';
  const hashed = await bcrypt.hash(password, salt);

  await prisma.user.create({
    data: {
      email: 'admin@test.com',
      passwordHash: hashed,
      fullName: 'Admin Test',
      matricule: 'MED999999',
      school: 'Test School',
      studyYear: '6',
      major: 'Medecine',
      matriculeValidated: true,
      role: 'admin',
    },
  });

  const agent = request.agent(app);
  const csrfToken = await getCsrf(agent);
  const loginRes = await agent
    .post('/api/auth/login')
    .set('X-CSRF-Token', csrfToken)
    .send({ email: 'admin@test.com', password });

  return {
    agent,
    token: loginRes.body.accessToken as string,
  };
};

describe('TIBELE API baseline flows', () => {
  test('register + login + me', async () => {
    const agent = request.agent(app);
    const csrfToken = await getCsrf(agent);

    const registerRes = await agent
      .post('/api/auth/register')
      .set('X-CSRF-Token', csrfToken)
      .send({
        email: 'student@test.com',
        password: 'Student1234',
        fullName: 'Student One',
        matricule: 'INF123456',
        school: 'INFAS',
        studyYear: '3',
        major: 'Soins infirmiers',
      });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.user.matricule).toBe('INF123456');

    const meRes = await agent
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${registerRes.body.accessToken}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.email).toBe('student@test.com');
  });

  test('admin CRUD pathology', async () => {
    const { agent, token } = await loginAsAdmin();

    const createCsrf = await getCsrf(agent);
    const createRes = await agent
      .post('/api/pathologies')
      .set('Authorization', `Bearer ${token}`)
      .set('X-CSRF-Token', createCsrf)
      .send({
        title: 'Pathologie Test',
        shortDescription: 'Description courte de test',
        definition: 'Definition de test suffisamment longue',
        examinations: 'Examens test',
        referentialDiagnosis: 'Diagnostic test',
        onSiteTreatment: 'Traitement test',
        dischargeOrder: 'Ordonnance test',
        prevention: 'Prevention test',
        isFree: true,
        groupe: 'Autres',
      });

    expect(createRes.status).toBe(201);
    const pathologyId = createRes.body.pathology._id as string;

    const updateCsrf = await getCsrf(agent);
    const updateRes = await agent
      .put(`/api/pathologies/${pathologyId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('X-CSRF-Token', updateCsrf)
      .send({ shortDescription: 'Description mise a jour de test' });

    expect(updateRes.status).toBe(200);

    const deleteCsrf = await getCsrf(agent);
    const deleteRes = await agent
      .delete(`/api/pathologies/${pathologyId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('X-CSRF-Token', deleteCsrf);

    expect(deleteRes.status).toBe(200);
  });

  test('forum topic + response', async () => {
    const agent = request.agent(app);
    const csrfToken = await getCsrf(agent);

    const registerRes = await agent
      .post('/api/auth/register')
      .set('X-CSRF-Token', csrfToken)
      .send({
        email: 'forum@test.com',
        password: 'Forum1234',
        fullName: 'Forum User',
        matricule: 'PHAR123456',
        school: 'UFR Pharma',
        studyYear: '2',
        major: 'Pharmacie',
      });

    const token = registerRes.body.accessToken as string;

    const topicCsrf = await getCsrf(agent);
    const topicRes = await agent
      .post('/api/forum/topics')
      .set('Authorization', `Bearer ${token}`)
      .set('X-CSRF-Token', topicCsrf)
      .send({ title: 'Sujet test', content: 'Contenu de sujet test forum' });

    expect(topicRes.status).toBe(201);

    const msgCsrf = await getCsrf(agent);
    const msgRes = await agent
      .post('/api/forum/messages')
      .set('Authorization', `Bearer ${token}`)
      .set('X-CSRF-Token', msgCsrf)
      .send({ topicId: topicRes.body.topic._id, content: 'Reponse test forum' });

    expect(msgRes.status).toBe(201);
  });

  test('qcm access + submit answer', async () => {
    const agent = request.agent(app);
    const csrfToken = await getCsrf(agent);

    const registerRes = await agent
      .post('/api/auth/register')
      .set('X-CSRF-Token', csrfToken)
      .send({
        email: 'qcm@test.com',
        password: 'Qcmtest1234',
        fullName: 'Qcm User',
        matricule: 'MED123457',
        school: 'UFR Medecine',
        studyYear: '4',
        major: 'Medecine',
      });

    const token = registerRes.body.accessToken as string;

    const pathology = await prisma.pathology.create({
      data: {
        title: 'Pathologie QCM',
        slug: 'pathologie-qcm',
        shortDescription: 'Description pathologie qcm',
        definition: 'Definition pathologie qcm longue',
        examinations: 'Examens',
        referentialDiagnosis: 'Diag',
        onSiteTreatment: 'Traitement',
        dischargeOrder: 'Ordonnance',
        prevention: 'Prevention',
        isFree: true,
        groupe: 'Autres',
      },
    });

    const question = await prisma.question.create({
      data: {
        pathologyId: pathology.id,
        questionText: 'Question test ?',
        type: 'QCM',
        options: [
          { text: 'Option A', isCorrect: true },
          { text: 'Option B', isCorrect: false },
        ],
      },
    });

    const questionsRes = await agent
      .get(`/api/questions/${String(pathology.id)}`)
      .set('Authorization', `Bearer ${token}`);

    expect(questionsRes.status).toBe(200);

    const answerCsrf = await getCsrf(agent);
    const answerRes = await agent
      .post('/api/questions/answer')
      .set('Authorization', `Bearer ${token}`)
      .set('X-CSRF-Token', answerCsrf)
      .send({ questionId: String(question.id), answer: 0 });

    expect(answerRes.status).toBe(201);
    expect(answerRes.body.data.isCorrect).toBe(true);
  });
});
