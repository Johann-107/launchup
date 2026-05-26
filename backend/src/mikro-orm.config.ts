import { defineConfig as definePostgresConfig, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { defineConfig as defineSqliteConfig, SqliteDriver } from '@mikro-orm/sqlite';
import { config } from 'dotenv';

config();

const createConfig = () => {
  if (!process.env.DB_HOST) {
    return defineSqliteConfig({
      dbName: ':memory:',
      entities: ['./dist/**/*.entity.js'],
      entitiesTs: ['./src/**/*.entity.ts'],
      debug: true,
      driver: SqliteDriver,
    });
  }

  return definePostgresConfig({
    host: process.env.DB_HOST,
    port: +(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME,
    entities: ['./dist/**/*.entity.js'],
    entitiesTs: ['./src/**/*.entity.ts'],
    debug: true,
    driver: PostgreSqlDriver,
    driverOptions: {
      connection: {
        ssl: { rejectUnauthorized: false },
      },
    },
  });
};

export default createConfig();
