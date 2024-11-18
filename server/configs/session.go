
package configs

import (
    "github.com/gorilla/sessions"
)

var Store *sessions.CookieStore

func InitSessionStore() {
    // In production, use environment variable
    // secretKey := os.Getenv("SESSION_KEY")
    
    // For development, use a constant key
    secretKey := []byte("cho2hand-secret-key-development-only")
    Store = sessions.NewCookieStore(secretKey)
    
    // Configure session options
    Store.Options = &sessions.Options{
        Path:     "/",
        MaxAge:   86400, // 1 day
        HttpOnly: true,
        Secure:   false, // Set to true in production with HTTPS
    }
}