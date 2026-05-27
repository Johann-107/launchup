const { MikroORM } = require('@mikro-orm/core');
require('dotenv').config({ path: `${__dirname}/.env` });
const ormConfigModule = require('./dist/mikro-orm.config');
const ormConfig = ormConfigModule.default || ormConfigModule;
const { User } = require('./dist/entities/user.entity');
const { Startup } = require('./dist/entities/startup.entity');
const { ReadinessLevel } = require('./dist/entities/readiness-level.entity');
const { StartupReadinessLevel } = require('./dist/entities/startup-readiness-level.entity');

const SCORE_TARGETS = {
  'AgroLink PH': {
    Technology: 3,
    Market: 2,
    Acceptance: 2,
    Organizational: 2,
    Investment: 1,
  },
  'MediSync Cebu': {
    Technology: 5,
    Market: 5,
    Acceptance: 4,
    Organizational: 5,
    Investment: 4,
  },
};

function tierFor(score) {
  return score >= 85 ? 'Strong' : score >= 70 ? 'Ready' : score >= 55 ? 'Emerging' : score >= 40 ? 'Developing' : 'Early';
}

function composite(levels) {
  const weights = {
    Acceptance: 0.3,
    Market: 0.25,
    Technology: 0.2,
    Organizational: 0.15,
    Investment: 0.1,
  };

  const byType = Object.fromEntries(levels.map((item) => [item.readinessLevel.readinessType, item.readinessLevel.level]));
  const score = Math.round(
    Object.entries(weights).reduce(
      (total, [type, weight]) => total + (((byType[type] || 0) / 5) * 100 * weight),
      0,
    ),
  );

  return { score, tier: tierFor(score) };
}

async function run() {
  const cfg = Object.assign({}, ormConfig, { entities: [User, Startup, ReadinessLevel, StartupReadinessLevel] });
  const orm = await MikroORM.init(cfg);
  const em = orm.em.fork();

  for (const [name, targets] of Object.entries(SCORE_TARGETS)) {
    const startup = await em.findOne(Startup, { name }, { populate: ['readinessLevels', 'readinessLevels.readinessLevel'] });
    if (!startup) {
      throw new Error(`Startup not found: ${name}`);
    }

    for (const [typeName, targetLevel] of Object.entries(targets)) {
      const readinessLevel = await em.findOne(ReadinessLevel, { readinessType: typeName, level: targetLevel });
      if (!readinessLevel) {
        throw new Error(`Missing readiness level ${typeName} ${targetLevel}`);
      }

      let link = await em.findOne(
        StartupReadinessLevel,
        { startup: startup.id, readinessLevel: { readinessType: typeName } },
        { populate: ['readinessLevel'] },
      );

      if (!link) {
        link = em.create(StartupReadinessLevel, {
          startup,
          readinessLevel,
          remark: `Adjusted demo tier for ${name}`,
        });
        em.persist(link);
      } else {
        link.readinessLevel = readinessLevel;
      }
    }
  }

  await em.flush();

  for (const name of Object.keys(SCORE_TARGETS)) {
    const startup = await em.findOne(Startup, { name }, { populate: ['readinessLevels', 'readinessLevels.readinessLevel'] });
    const { score, tier } = composite(startup.readinessLevels.getItems());
    console.log(`${name}: composite=${score}, tier=${tier}`);
  }

  await orm.close(true);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
