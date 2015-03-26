# Cabins schema

# --- !Ups

create table CABIN (
    id bigint(20) NOT NULL AUTO_INCREMENT,
    name_ varchar(255) NOT NULL,
    description_ varchar(255) NULL,
    capacity numeric(18,0) NOT NULL,
    price numeric(18,2) NOT NULL,
    PRIMARY KEY (id)
);

INSERT INTO CABIN(name_, description_, capacity, price) values ('A4', 'Kiva hytti', 4, 105.00);
INSERT INTO CABIN(name_, description_, capacity, price) values ('B3', 'Paska hytti', 3, 78.00);


