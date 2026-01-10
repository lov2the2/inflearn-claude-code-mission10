-- Drop indexes
DROP INDEX IF EXISTS idx_dataset_columns_dataset_id;
DROP INDEX IF EXISTS idx_datasets_deleted_at;
DROP INDEX IF EXISTS idx_datasets_table_name;
DROP INDEX IF EXISTS idx_datasets_user_id;

-- Drop tables
DROP TABLE IF EXISTS dataset_columns;
DROP TABLE IF EXISTS datasets;
