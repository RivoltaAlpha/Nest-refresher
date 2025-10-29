import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigrations1761764770803 implements MigrationInterface {
    name = 'NewMigrations1761764770803'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "payment_date"`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "payment_date" datetime2 NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "amount"`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "amount" decimal(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "payment_method"`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "payment_method" nvarchar(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "DF_4e138ff5e470441d31f649f8d9a"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "payment_status"`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "payment_status" nvarchar(20) NOT NULL CONSTRAINT "DF_4e138ff5e470441d31f649f8d9a" DEFAULT 'Pending'`);
        await queryRunner.query(`ALTER TABLE "registrations" DROP CONSTRAINT "DF_8c4905bc573bed0f943739a9438"`);
        await queryRunner.query(`ALTER TABLE "registrations" DROP COLUMN "payment_status"`);
        await queryRunner.query(`ALTER TABLE "registrations" ADD "payment_status" nvarchar(20) NOT NULL CONSTRAINT "DF_8c4905bc573bed0f943739a9438" DEFAULT 'Pending'`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "event_name"`);
        await queryRunner.query(`ALTER TABLE "events" ADD "event_name" nvarchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "event_date"`);
        await queryRunner.query(`ALTER TABLE "events" ADD "event_date" datetime2 NOT NULL`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "event_location"`);
        await queryRunner.query(`ALTER TABLE "events" ADD "event_location" nvarchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "event_description"`);
        await queryRunner.query(`ALTER TABLE "events" ADD "event_description" nvarchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "name" nvarchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "email" nvarchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "password" nvarchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "phone" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "DF_ace513fa30d485cfd25c11a9e4a"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "role" nvarchar(20) NOT NULL CONSTRAINT "DF_ace513fa30d485cfd25c11a9e4a" DEFAULT 'User'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "DF_ace513fa30d485cfd25c11a9e4a"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "role" varchar(10) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "DF_ace513fa30d485cfd25c11a9e4a" DEFAULT 'User' FOR "role"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "phone" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "password" varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "email" varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "name" varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "event_description"`);
        await queryRunner.query(`ALTER TABLE "events" ADD "event_description" varchar(250) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "event_location"`);
        await queryRunner.query(`ALTER TABLE "events" ADD "event_location" varchar(250) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "event_date"`);
        await queryRunner.query(`ALTER TABLE "events" ADD "event_date" varchar(250) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "event_name"`);
        await queryRunner.query(`ALTER TABLE "events" ADD "event_name" varchar(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "registrations" DROP CONSTRAINT "DF_8c4905bc573bed0f943739a9438"`);
        await queryRunner.query(`ALTER TABLE "registrations" DROP COLUMN "payment_status"`);
        await queryRunner.query(`ALTER TABLE "registrations" ADD "payment_status" varchar(10) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "registrations" ADD CONSTRAINT "DF_8c4905bc573bed0f943739a9438" DEFAULT 'Pending' FOR "payment_status"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "DF_4e138ff5e470441d31f649f8d9a"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "payment_status"`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "payment_status" varchar(10) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "DF_4e138ff5e470441d31f649f8d9a" DEFAULT 'Pending' FOR "payment_status"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "payment_method"`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "payment_method" varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "amount"`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "amount" int NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "payment_date"`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "payment_date" varchar(255) NOT NULL`);
    }

}
