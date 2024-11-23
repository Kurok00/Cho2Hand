package middleware

import (
    "net/http"

    "github.com/gin-gonic/gin"
    "go.mongodb.org/mongo-driver/bson/primitive"
)

func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        userID := c.GetHeader("X-User-ID")
        if userID == "" {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID header is missing"})
            c.Abort()
            return
        }

        objID, err := primitive.ObjectIDFromHex(userID)
        if err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid User ID"})
            c.Abort()
            return
        }

        c.Set("userID", objID)
        c.Next()
    }
}