import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { MikroORM } from '@mikro-orm/core';
import { hash } from 'argon2';
import { User } from './entities/user.entity';
import { Startup } from './entities/startup.entity';
import { ReadinessLevel } from './entities/readiness-level.entity';
import { StartupReadinessLevel } from './entities/startup-readiness-level.entity';
import { QualificationStatus } from './entities/enums/qualification-status.enum';
import { Role } from './entities/enums/role.enum';
import { ReadinessType } from './entities/enums/readiness-type.enum';
import { CapsuleProposal } from './entities/capsule-proposal.entity';

async function seedLocalDemoData(orm: MikroORM) {
  const em = orm.em.fork();

  const demoPasswordHash = await hash('password123');

  let demoUser = await em.findOne(User, { email: 'demo@launchup.local' });
  if (!demoUser) {
    demoUser = em.create(User, {
      email: 'demo@launchup.local',
      hash: demoPasswordHash,
      firstName: 'Demo',
      lastName: 'Founder',
      role: Role.Startup,
    });
    em.persist(demoUser);
  }

  let adminUser = await em.findOne(User, { email: 'admin@launchup.local' });
  if (!adminUser) {
    adminUser = em.create(User, {
      email: 'admin@launchup.local',
      hash: demoPasswordHash,
      firstName: 'Demo',
      lastName: 'Admin',
      role: Role.Admin,
    });
    em.persist(adminUser);
  }

  let managerUser = await em.findOne(User, { email: 'manager@launchup.local' });
  if (!managerUser) {
    managerUser = em.create(User, {
      email: 'manager@launchup.local',
      hash: demoPasswordHash,
      firstName: 'Demo',
      lastName: 'Manager',
      role: Role.Manager,
    });
    em.persist(managerUser);
  }

  let mentorUser = await em.findOne(User, { email: 'mentor@launchup.local' });
  if (!mentorUser) {
    mentorUser = em.create(User, {
      email: 'mentor@launchup.local',
      hash: demoPasswordHash,
      firstName: 'Demo',
      lastName: 'Mentor',
      role: Role.Mentor,
    });
    em.persist(mentorUser);
  }

  const readinessSeeds = [
    { level: 3, name: 'Team traction baseline', readinessType: ReadinessType.A },
    { level: 4, name: 'Market validation baseline', readinessType: ReadinessType.M },
    { level: 2, name: 'Product maturity baseline', readinessType: ReadinessType.T },
    { level: 3, name: 'Execution baseline', readinessType: ReadinessType.O },
    { level: 1, name: 'Funding baseline', readinessType: ReadinessType.I },
  ];

  for (const seed of readinessSeeds) {
    const existing = await em.findOne(ReadinessLevel, {
      readinessType: seed.readinessType,
      level: seed.level,
    });

    if (!existing) {
      em.persist(
        em.create(ReadinessLevel, {
          level: seed.level,
          name: seed.name,
          readinessType: seed.readinessType,
        }),
      );
    }
  }

  await em.flush();

  let demoStartup = await em.findOne(Startup, {
    user: { id: demoUser.id },
  });

  if (!demoStartup) {
    demoStartup = em.create(Startup, {
      name: 'LaunchUp Demo Startup',
      user: demoUser,
      qualificationStatus: QualificationStatus.PENDING,
      dataPrivacy: true,
      eligibility: true,
    });
    em.persist(demoStartup);
    await em.flush();
    demoStartup.members.add(demoUser);
    await em.flush();
  }

  const readinessLevels = await em.find(ReadinessLevel, {});
  const readinessLevelByType = new Map(
    readinessLevels.map((level) => [level.readinessType, level]),
  );

  for (const readinessType of [
    ReadinessType.A,
    ReadinessType.M,
    ReadinessType.T,
    ReadinessType.O,
    ReadinessType.I,
  ]) {
    const readinessLevel = readinessLevelByType.get(readinessType);
    if (!readinessLevel) continue;

    const existingLink = await em.findOne(StartupReadinessLevel, {
      startup: { id: demoStartup.id },
      readinessLevel: { id: readinessLevel.id },
    });

    if (!existingLink) {
      em.persist(
        em.create(StartupReadinessLevel, {
          startup: demoStartup,
          readinessLevel,
          remark: 'Seeded local demo readiness data',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );
    }
  }
  // The original startup initialization remains unmodified
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://launchup.onrender.com',
      'https://launchup.vercel.app',
      // 'http://localhost:5173',
      // 'http://127.0.0.1:5173',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const orm = app.get(MikroORM);
  await orm.getSchemaGenerator().updateSchema();
  await seedLocalDemoData(orm);

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on port ${port}`);
}

bootstrap().catch(console.error);
