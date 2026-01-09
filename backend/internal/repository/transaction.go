package repository

// TxFunc defines a function type that operates on a transactional Repository
type TxFunc func(*Repository) error

// WithTransaction executes a function within a database transaction
// If the function returns an error, the transaction is rolled back
// Otherwise, the transaction is committed
func (r *Repository) WithTransaction(fn TxFunc) error {
    // Begin transaction
    tx := r.db.Begin()
    if tx.Error != nil {
        return tx.Error
    }

    // Create transactional repository with the same structure
    txRepo := &Repository{
        db:       tx,
        User:     NewUserRepository(tx),
        Admin:    NewAdminRepository(tx),
        Token:    NewTokenRepository(tx),
        Activity: NewActivityRepository(tx),
    }

    // Execute the function with transactional repository
    if err := fn(txRepo); err != nil {
        tx.Rollback()
        return err
    }

    // Commit transaction if no errors occurred
    return tx.Commit().Error
}
