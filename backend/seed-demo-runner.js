const { MikroORM } = require('@mikro-orm/core');
// ensure relative paths in mikro-orm.config resolve to the backend folder
process.chdir(__dirname);
const ormConfigModule = require('./dist/mikro-orm.config');
const ormConfig = ormConfigModule.default || ormConfigModule;

async function run() {
  // require only the entity classes we need and pass them explicitly so discovery succeeds
  const { User } = require('./dist/entities/user.entity');
  const { Startup } = require('./dist/entities/startup.entity');
  const { ReadinessLevel } = require('./dist/entities/readiness-level.entity');
  const { StartupReadinessLevel } = require('./dist/entities/startup-readiness-level.entity');
  const { QualificationStatus } = require('./dist/entities/enums/qualification-status.enum');
  const { ReadinessType } = require('./dist/entities/enums/readiness-type.enum');

  const cfg = Object.assign({}, ormConfig, { entities: [User, Startup, ReadinessLevel, StartupReadinessLevel] });
  const orm = await MikroORM.init(cfg);
  const em = orm.em.fork();

  async function ensureReadinessLevelExists(type, level) {
    let rl = await em.findOne(ReadinessLevel, { readinessType: type, level });
    if (!rl) {
      rl = em.create(ReadinessLevel, { level, name: `Seeded ${type} level ${level}`, readinessType: type });
      em.persist(rl);
      await em.flush();
    }
    return rl;
  }

  // find users
  const demoUser = await em.findOne(User, { email: 'demo@launchup.local' });
  const adminUser = await em.findOne(User, { email: 'admin@launchup.local' });
  const managerUser = await em.findOne(User, { email: 'manager@launchup.local' });
  const mentorUser = await em.findOne(User, { email: 'mentor@launchup.local' });

  if (!demoUser || !adminUser || !managerUser || !mentorUser) {
    console.error('One or more required demo users not found. Aborting.');
    process.exit(1);
  }

  // AgroLink PH
  let agro = await em.findOne(Startup, { name: 'AgroLink PH' });
  if (!agro) {
    agro = em.create(Startup, {
      name: 'AgroLink PH',
      user: managerUser,
      qualificationStatus: QualificationStatus.PENDING,
      dataPrivacy: true,
      eligibility: true,
      links: JSON.stringify({ team: '2 founders', revenue: 0, sector: 'agritech' }),
    });
    em.persist(agro);
    await em.flush();
    if (agro.members && typeof agro.members.add === 'function') agro.members.add(managerUser);
    await em.flush();

    const agroLevels = [
      [ReadinessType.T, 2],
      [ReadinessType.M, 2],
      [ReadinessType.A, 1],
      [ReadinessType.O, 2],
      [ReadinessType.R, 1],
      [ReadinessType.I, 1],
    ];

    for (const [type, level] of agroLevels) {
      const rl = await ensureReadinessLevelExists(type, level);
      const existing = await em.findOne(StartupReadinessLevel, { startup: { id: agro.id }, readinessLevel: { id: rl.id } });
      if (!existing) {
        em.persist(em.create(StartupReadinessLevel, { startup: agro, readinessLevel: rl, remark: 'Seeded baseline for AgroLink PH', createdAt: new Date(), updatedAt: new Date() }));
      }
    }
    await em.flush();
    console.log('Seeded AgroLink PH id=', agro.id);
  } else {
    console.log('AgroLink PH already exists id=', agro.id);
  }

  // MediSync Cebu
  let medi = await em.findOne(Startup, { name: 'MediSync Cebu' });
  if (!medi) {
    medi = em.create(Startup, {
      name: 'MediSync Cebu',
      user: mentorUser,
      qualificationStatus: QualificationStatus.PENDING,
      dataPrivacy: true,
      eligibility: true,
      links: JSON.stringify({ team: '3 founders', revenue: 5000, sector: 'healthtech' }),
    });
    em.persist(medi);
    await em.flush();
    if (medi.members && typeof medi.members.add === 'function') medi.members.add(mentorUser);
    await em.flush();

    const mediLevels = [
      [ReadinessType.T, 5],
      [ReadinessType.M, 4],
      [ReadinessType.A, 3],
      [ReadinessType.O, 4],
      [ReadinessType.R, 3],
      [ReadinessType.I, 3],
    ];

    for (const [type, level] of mediLevels) {
      const rl = await ensureReadinessLevelExists(type, level);
      const existing = await em.findOne(StartupReadinessLevel, { startup: { id: medi.id }, readinessLevel: { id: rl.id } });
      if (!existing) {
        em.persist(em.create(StartupReadinessLevel, { startup: medi, readinessLevel: rl, remark: 'Seeded baseline for MediSync Cebu', createdAt: new Date(), updatedAt: new Date() }));
      }
    }
    await em.flush();
    console.log('Seeded MediSync Cebu id=', medi.id);
  } else {
    console.log('MediSync Cebu already exists id=', medi.id);
  }

  await orm.close(true);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
