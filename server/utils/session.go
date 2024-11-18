package utils

import (
    "cho2hand/configs"
    "github.com/gin-gonic/gin"
)

func SetSession(c *gin.Context, key string, value interface{}) error {
    session, _ := configs.Store.Get(c.Request, "admin-session")
    session.Values[key] = value
    return session.Save(c.Request, c.Writer)
}

func GetSession(c *gin.Context, key string) (interface{}, error) {
    session, err := configs.Store.Get(c.Request, "admin-session")
    if err != nil {
        return nil, err
    }
    return session.Values[key], nil
}

func ClearSession(c *gin.Context) error {
    session, _ := configs.Store.Get(c.Request, "admin-session")
    session.Options.MaxAge = -1 // This will delete the cookie
    return session.Save(c.Request, c.Writer)
}