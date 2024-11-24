package middleware

import (
    "regexp"
    "github.com/gin-gonic/gin"
)

func CORSMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        origin := c.Request.Header.Get("Origin")
        allowedOrigins := []string{
            "https://cho2hand-3.onrender.com",
        }
        vercelRegex := regexp.MustCompile(`^https://cho2hand-[a-z0-9]+-kurok00s-projects\.vercel\.app$`)

        for _, o := range allowedOrigins {
            if origin == o {
                c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
                break
            }
        }

        if vercelRegex.MatchString(origin) {
            c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
        }

        c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
        c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
        c.Writer.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, X-User-ID")
        c.Writer.Header().Set("Access-Control-Expose-Headers", "Content-Length")
        c.Writer.Header().Set("Access-Control-Max-Age", "86400") // 24 hours

        // Handle preflight requests
        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }

        c.Next()
    }
}