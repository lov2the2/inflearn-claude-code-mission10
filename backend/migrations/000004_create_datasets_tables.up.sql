-- Create datasets table
CREATE TABLE IF NOT EXISTS datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    table_name VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    row_count INTEGER NOT NULL DEFAULT 0,
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create dataset_columns table
CREATE TABLE IF NOT EXISTS dataset_columns (
    id SERIAL PRIMARY KEY,
    dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    column_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    column_order INTEGER NOT NULL,
    nullable BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(dataset_id, column_name)
);

-- Create indexes (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_datasets_user_id') THEN
        CREATE INDEX idx_datasets_user_id ON datasets(user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_datasets_table_name') THEN
        CREATE INDEX idx_datasets_table_name ON datasets(table_name);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_datasets_deleted_at') THEN
        CREATE INDEX idx_datasets_deleted_at ON datasets(deleted_at);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_dataset_columns_dataset_id') THEN
        CREATE INDEX idx_dataset_columns_dataset_id ON dataset_columns(dataset_id);
    END IF;
END
$$;

-- Add comments
COMMENT ON TABLE datasets IS 'Metadata for user-uploaded CSV datasets';
COMMENT ON TABLE dataset_columns IS 'Column metadata for each dataset';
COMMENT ON COLUMN datasets.table_name IS 'Generated table name: ds_{name}_{uuid}';
COMMENT ON COLUMN dataset_columns.data_type IS 'PostgreSQL data type: text, integer, numeric, boolean, timestamp';
