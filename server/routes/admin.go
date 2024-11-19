package routes

import (
    "cho2hand/controllers"
    "github.com/gin-gonic/gin"
)

func AdminRoutes(router *gin.Engine, adminAuth *controllers.AdminAuthController) {
    admin := router.Group("/api/admin")
    {
        admin.POST("/register", adminAuth.Register)
        admin.POST("/login", adminAuth.Login)
        
        // Protected routes would go here
        admin.Group("") // Remove the variable assignment
        {
            // Add protected admin routes here later
        }
    }
}