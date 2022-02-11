CREATE TABLE "users" (
  "id" int PRIMARY KEY,
  "full_name" varchar,
  "role" varchar,
  "email" varchar UNIQUE,
  "password" varchar,
);


CREATE TABLE "files" (
  "id" int PRIMARY KEY,
  "file_name" varchar,
  "file_path" varchar,
  "flagged" boolean,
  "flagged_by" integer,
  "created_by" integer,

);
