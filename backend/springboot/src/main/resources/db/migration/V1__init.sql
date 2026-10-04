CREATE TABLE app_metadata (
    meta_key   VARCHAR(100) PRIMARY KEY,
    meta_value VARCHAR(255) NOT NULL
);

INSERT INTO app_metadata (meta_key, meta_value) VALUES ('schema_version', '1');
