# --- Created by Slick DDL
# To stop Slick DDL generation, remove this comment and start using Evolutions

# --- !Ups

create table "CABIN" ("ID" BIGSERIAL PRIMARY KEY,"NAME_" VARCHAR(254) NOT NULL,"DESCRIPTION_" VARCHAR(254) NOT NULL,"CAPACITY" INTEGER NOT NULL,"PRICE" DECIMAL(21,2) NOT NULL);
create table "EVENT" ("ID" BIGSERIAL PRIMARY KEY,"NAME_" VARCHAR(254) NOT NULL,"DESCRIPTION" VARCHAR(254) NOT NULL,"DATE_OF_EVENT" DATE NOT NULL,"REGISTRATION_START_DATE" DATE NOT NULL,"REGISTRATION_END_DATE" DATE NOT NULL);
create table "EVENT_CABIN" ("ID" BIGSERIAL PRIMARY KEY,"EVENT_ID" BIGINT,"CABIN_ID" BIGINT NOT NULL,"AMOUNT_" INTEGER NOT NULL);
create table "REGISTERED_PERSONS" ("ID" BIGSERIAL PRIMARY KEY,"REGISTRATION_ID" BIGINT NOT NULL,"FIRST_NAME" VARCHAR(254) NOT NULL,"LAST_NAME" VARCHAR(254) NOT NULL,"EMAIL" VARCHAR(254) NOT NULL,"DATE_OF_BIRTH" VARCHAR(254) NOT NULL,"CLUB_NUMBER" VARCHAR(254) NOT NULL,"SELECTED_DINING" INTEGER NOT NULL,"CONTACT_PERSON" INTEGER NOT NULL);
create table "REGISTRATION" ("ID" BIGSERIAL PRIMARY KEY,"CABIN_ID" BIGINT NOT NULL,"EVENT_ID" BIGINT NOT NULL,"TIMESTAMP_" TIMESTAMP);
alter table "EVENT_CABIN" add constraint "CABIN_FK" foreign key("CABIN_ID") references "CABIN"("ID") on update NO ACTION on delete NO ACTION;
alter table "EVENT_CABIN" add constraint "EVENT_FK" foreign key("EVENT_ID") references "EVENT"("ID") on update NO ACTION on delete NO ACTION;
alter table "REGISTRATION" add constraint "CABIN_FK" foreign key("CABIN_ID") references "CABIN"("ID") on update NO ACTION on delete NO ACTION;
alter table "REGISTRATION" add constraint "EVENT_FK" foreign key("EVENT_ID") references "EVENT"("ID") on update NO ACTION on delete NO ACTION;

# --- !Downs

alter table "REGISTRATION" drop constraint "CABIN_FK";
alter table "REGISTRATION" drop constraint "EVENT_FK";
alter table "EVENT_CABIN" drop constraint "CABIN_FK";
alter table "EVENT_CABIN" drop constraint "EVENT_FK";
drop table "REGISTRATION";
drop table "REGISTERED_PERSONS";
drop table "EVENT_CABIN";
drop table "EVENT";
drop table "CABIN";

