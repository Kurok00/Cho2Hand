package routes

import (
    "cho2hand/controllers"
    "cho2hand/middlewares"
    "github.com/gin-gonic/gin"
)

func AdminRoutes(router *gin.Engine, adminAuth *controllers.AdminAuthController) {
    admin := router.Group("/api/admin")
    {
        admin.POST("/register", adminAuth.Register)
        admin.POST("/login", adminAuth.Login)
        
        // Protected routes would go here
        protected := admin.Group("")
        protected.Use(middlewares.AdminAuthMiddleware())
        {
            // Add protected admin routes here later
        }
    }
}