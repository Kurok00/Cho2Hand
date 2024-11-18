package middlewares

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"cho2hand/utils"
)

func AdminAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		sessionValue, err := utils.GetSession(c, "admin")
		if err != nil || sessionValue == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		c.Next()
	}
}