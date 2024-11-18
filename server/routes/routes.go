package routes

import (
    "cho2hand/controllers"
    "cho2hand/middleware"
    "cho2hand/utils" // Ensure this import is correct
    "github.com/gin-gonic/gin"
)

// UploadHandler handles file uploads using Gin
func uploadHandler(c *gin.Context) {
    file, err := c.FormFile("image")
    if err != nil {
        c.JSON(400, gin.H{
            "error": "No file uploaded",
        })
        return
    }

    // Upload to Cloudinary
    imageURL, err := utils.UploadImage(file)
    if err != nil {
        c.JSON(500, gin.H{
            "error": err.Error(),
        })
        return
    }

    c.JSON(200, gin.H{
        "url": imageURL,
    })
}

func SetupRoutes(router *gin.Engine, authController *controllers.AuthController, 
    productController *controllers.ProductController,
    categoryController *controllers.CategoryController,
    adminController *controllers.AdminAuthController) {

    // Apply CORS middleware to all routes
    router.Use(middleware.CORSMiddleware())
    
    // Admin API group
    adminGroup := router.Group("/api/admin")
    {
        // Public admin routes
        adminGroup.POST("/register", adminController.Register)
        adminGroup.POST("/login", adminController.Login)
        
        // Protected admin routes
        protected := adminGroup.Group("")
        protected.Use(middleware.AdminAuthMiddleware())
        {
            protected.GET("/username", adminController.GetUsername)
            protected.POST("/logout", adminController.Logout)
        }
    }

    // API routes group
    api := router.Group("/api")
    {
        // Auth routes
        auth := api.Group("/auth")
        {
            auth.POST("/register", authController.Register)
            auth.POST("/login", authController.Login)
        }

        // Products routes
        products := api.Group("/products")
        {
            products.GET("", productController.GetProducts)
            products.GET("/:id", productController.GetProduct)
            products.POST("", productController.CreateProduct)
            products.POST("/batch", productController.CreateManyProducts)
            products.PUT("/:id", productController.UpdateProduct)
            // products.DELETE("/:id", productController.DeleteProduct)
        }

        // Categories routes
        categories := api.Group("/categories")
        {
            categories.GET("", categoryController.GetCategories)
        }

        // Upload routes
        upload := api.Group("/upload")
        {
            upload.POST("", uploadHandler)
        }
    }

    // Replace DELETE endpoint with PUT for status update
    router.PUT("/api/products/:id/status", productController.UpdateProductStatus)
}