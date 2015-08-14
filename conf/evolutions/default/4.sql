# Events schema

# --- !Ups

create table REGISTRATION (
    id bigint(20) NOT NULL AUTO_INCREMENT,
    cabin_id bigint(20) NOT NULL,
    event_id bigint(20) NOT NULL,
    timestamp_ timestamp NOT NULL,
    PRIMARY KEY (id)
);

create table REGISTERED_PERSONS (
    id bigint(20) NOT NULL AUTO_INCREMENT,
    registration_id bigint(20) NOT NULL,
    first_name varchar(255) NOT NULL,
    last_name varchar(255) NOT NULL,
    email varchar(255) NOT NULL,
    date_of_birth varchar(255) NOT NULL,
    club_number varchar(255) NULL,
    selected_dining int NOT NULL,
    contact_person int NOT NULL default 0,
    PRIMARY KEY (id)
);