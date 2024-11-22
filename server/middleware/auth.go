package middleware

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "go.mongodb.org/mongo-driver/bson/primitive"
    "log"
)

func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        userIDStr := c.GetHeader("X-User-ID")
        log.Printf("Received X-User-ID header: %s", userIDStr) // Add logging

        if userIDStr == "" {
            c.JSON(http.StatusUnauthorized, gin.H{
                "error": "User ID not found in request header",
                "details": "X-User-ID header is required",
            })
            c.Abort()
            return
        }

        userID, err := primitive.ObjectIDFromHex(userIDStr)
        if err != nil {
            log.Printf("Error parsing user ID: %v", err) // Add logging
            c.JSON(http.StatusUnauthorized, gin.H{
                "error": "Invalid user ID format",
                "details": err.Error(),
            })
            c.Abort()
            return
        }

        c.Set("userID", userID)
        c.Next()
    }
}