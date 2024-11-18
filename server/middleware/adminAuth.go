package middleware

import (
    "github.com/gin-gonic/gin"
    "net/http"
)

func AdminAuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        adminID := c.GetHeader("X-Admin-ID")
        username := c.GetHeader("X-Admin-Username")

        if adminID == "" || username == "" {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
                "error": "Unauthorized access",
                "status": http.StatusUnauthorized,
            })
            return
        }

        c.Set("admin", username)
        c.Set("adminId", adminID)
        c.Next()
    }
}