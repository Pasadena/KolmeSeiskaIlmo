# Events schema

# --- !Ups

create table EVENT (
    id bigint(20) NOT NULL AUTO_INCREMENT,
    name_ varchar(255) NOT NULL,
    description varchar(255) NULL,
    date_of_event datetime NOT NULL,
    registration_start_date datetime NOT NULL,
    registration_end_date datetime NOT NULL,
    PRIMARY KEY (id)
);