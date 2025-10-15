import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1760351840003 implements MigrationInterface {
    name = 'InitialMigration1760351840003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "registrations" ("registration_id" int NOT NULL IDENTITY(1,1), "event_id" int NOT NULL, "user_id" int NOT NULL, "registration_date" datetime2 NOT NULL CONSTRAINT "DF_fc0ebdbb9390df493ed58bcf820" DEFAULT getdate(), "payment_status" varchar(10) NOT NULL CONSTRAINT "DF_8c4905bc573bed0f943739a9438" DEFAULT 'Pending', "payment_amount" decimal(10,2) NOT NULL, "created_at" datetime2 NOT NULL CONSTRAINT "DF_3d402ac2b3d5de5403a2ff7cabd" DEFAULT getdate(), "updated_at" datetime2 NOT NULL CONSTRAINT "DF_a39d49d405d3926d7af13814218" DEFAULT getdate(), CONSTRAINT "PK_c8949057f7da2bee22a15d7cb26" PRIMARY KEY ("registration_id"))`);
        await queryRunner.query(`CREATE TABLE "feedbacks" ("feedback_id" int NOT NULL IDENTITY(1,1), "event_id" int NOT NULL, "user_id" int NOT NULL, "rating" decimal(2) NOT NULL, "comments" varchar(255) NOT NULL, "created_at" datetime NOT NULL, CONSTRAINT "PK_fbbc8db5ceefe347110a51c5659" PRIMARY KEY ("feedback_id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("user_id" int NOT NULL IDENTITY(1,1), "name" varchar(255) NOT NULL, "email" varchar(255) NOT NULL, "password" varchar(255) NOT NULL, "phone" varchar(255), "hashedRefreshToken" varchar(255), "role" varchar(10) NOT NULL CONSTRAINT "DF_ace513fa30d485cfd25c11a9e4a" DEFAULT 'User', "created_at" datetime2 NOT NULL CONSTRAINT "DF_c9b5b525a96ddc2c5647d7f7fa5" DEFAULT getdate(), "updated_at" datetime2 NOT NULL CONSTRAINT "DF_6d596d799f9cb9dac6f7bf7c23c" DEFAULT getdate(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_96aac72f1574b88752e9fb00089" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`CREATE TABLE "payments" ("payment_id" int NOT NULL IDENTITY(1,1), "registration_id" varchar(255) NOT NULL, "payment_date" varchar(255) NOT NULL, "amount" int NOT NULL, "payment_method" varchar(255) NOT NULL, "payment_status" varchar(10) NOT NULL CONSTRAINT "DF_4e138ff5e470441d31f649f8d9a" DEFAULT 'Pending', "created_at" datetime2 NOT NULL CONSTRAINT "DF_1237daf748b7653a6ebb9492fe4" DEFAULT getdate(), "updated_at" datetime2 NOT NULL CONSTRAINT "DF_017ad402d7ab72597d9aa6e8239" DEFAULT getdate(), CONSTRAINT "PK_8866a3cfff96b8e17c2b204aae0" PRIMARY KEY ("payment_id"))`);
        await queryRunner.query(`CREATE TABLE "events" ("event_id" int NOT NULL IDENTITY(1,1), "event_name" varchar(50) NOT NULL, "event_date" varchar(250) NOT NULL, "event_location" varchar(250) NOT NULL, "event_description" varchar(250) NOT NULL, "created_by" varchar(250) NOT NULL, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL, CONSTRAINT "PK_1b77463a4487f09e798dffcb43a" PRIMARY KEY ("event_id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "events"`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "feedbacks"`);
        await queryRunner.query(`DROP TABLE "registrations"`);
    }

}
