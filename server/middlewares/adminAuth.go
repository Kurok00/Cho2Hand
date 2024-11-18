package middlewares

import (
    "github.com/gin-gonic/gin"
    "net/http"
    "cho2hand/utils"
)

func AdminAuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        username, err := utils.GetSession(c, "admin")
        if err != nil || username == "" {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
            c.Abort()
            return
        }

        // Set username in context for later use
        c.Set("admin", username)
        c.Next()
    }
}