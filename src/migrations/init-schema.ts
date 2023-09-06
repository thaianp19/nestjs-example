import { MigrationInterface, QueryRunner } from 'typeorm';

export class initSchema implements MigrationInterface {
  name = 'initSchema';
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('create database nest-example if not exist');
    await queryRunner.query(
      'create table "user" ("id" character varying not null, "email"  character varying not null, "password" character varying not null)',
    );
    await queryRunner.query(
      'create table "product" ("id" character varying not null, "title"  character varying not null, "user_id" character varying not null)',
    );
    await queryRunner.query(
      'alter table "product" add constraint "FK_b4f4b63d1736689b7008980394c" foreign key ("user_id") references "user"("id")',
    );
  }
  public async down(queryRunner: QueryRunner): Promise<any> {
      await queryRunner.query(
            'alter table "product" drop constraint "FK_b4f4b63d1736689b7008980394c" ',
          );
          await queryRunner.query(
            'drop table "product"',
          );
      await queryRunner.query(
        'drop table "user"',
      );
    
      
  }
}
