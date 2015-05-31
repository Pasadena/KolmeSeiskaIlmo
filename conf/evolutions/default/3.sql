# EventsCabins schema

# --- !Ups

create table EVENT_CABIN (
    id bigint(20) NOT NULL AUTO_INCREMENT,
    event_id bigint(20) NOT NULL,
    cabin_id bigint(20) NOT NULL,
    amount_ int NOT NULL,
    FOREIGN KEY(event_id) references EVENT(id),
    FOREIGN KEY(cabin_id) references CABIN(id),
    PRIMARY KEY (id)
);