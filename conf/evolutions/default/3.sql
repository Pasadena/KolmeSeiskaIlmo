# --- !Ups

alter table "EVENT" ADD COLUMN "DINING_OPTIONAL" boolean DEFAULT FALSE;

# --- !Downs