import { Module } from '@nestjs/common';
import { config } from 'dotenv';
import { TypeOrmModule } from '@nestjs/typeorm';
import {ConfigModule, ConfigService} from "@nestjs/config";

// helps load env variables
config({
    path: ['.env', 'env.prod', 'env.local']
})

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.getOrThrow<string>('DB_HOST'),
                port: configService.getOrThrow<number>('DB_PORT'),
                username: configService.getOrThrow<string>('DB_USERNAME'),
                password: configService.getOrThrow<string>('DB_PASSWORD'),
                database: configService.getOrThrow<string>('DB_NAME'),
                entities: [__dirname + '/../**/*.entity{.ts,.js}'],
                synchronize: configService.getOrThrow<boolean>('DB_SYNC', true),
                logging: configService.getOrThrow<boolean>('DB_LOGGING', false),   
                migrations: [__dirname + '/../migrations/**/*{.ts,.js}'],
         }),
         inject: [ConfigService] // Inject ConfigService to access configuration values
        })
    ],
})
export class DatabaseModule {}