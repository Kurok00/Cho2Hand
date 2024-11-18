
package utils

import (
	"github.com/gin-gonic/gin"
	"github.com/gorilla/sessions"
)

var store = sessions.NewCookieStore([]byte("your_secret_key"))

func SetSession(c *gin.Context, key string, value interface{}) error {
	session, err := store.Get(c.Request, "session")
	if err != nil {
		return err
	}
	session.Values[key] = value
	return session.Save(c.Request, c.Writer)
}

func GetSession(c *gin.Context, key string) (interface{}, error) {
	session, err := store.Get(c.Request, "session")
	if err != nil {
		return nil, err
	}
	return session.Values[key], nil
}

func ClearSession(c *gin.Context) error {
	session, err := store.Get(c.Request, "session")
	if err != nil {
		return err
	}
	session.Options.MaxAge = -1
	return session.Save(c.Request, c.Writer)
}