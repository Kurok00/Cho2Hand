package routes

import (
    "cho2hand/controllers"
    "cho2hand/middleware"
    "cho2hand/utils" // Ensure this import is correct
    "github.com/gin-gonic/gin"
    "net/http"
    
    "fmt"
    "log"
)

// Simple upload handler with better error handling
func uploadHandler(c *gin.Context) {
    // Initialize Cloudinary
    if err := utils.InitCloudinary(); err != nil {
        log.Printf("Failed to initialize Cloudinary: %v\n", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": fmt.Sprintf("Cloudinary initialization failed: %v", err),
        })
        return
    }

    file, err := c.FormFile("image")
    if err != nil {
        log.Printf("File upload error: %v\n", err)
        c.JSON(http.StatusBadRequest, gin.H{
            "error": fmt.Sprintf("File upload error: %v", err),
        })
        return
    }

    log.Printf("Processing file: %s, size: %d\n", file.Filename, file.Size)

    // Upload to Cloudinary with duplicate detection
    url, err := utils.UploadImage(file)
    if err != nil {
        log.Printf("Upload failed: %v\n", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": fmt.Sprintf("Failed to upload: %v", err),
        })
        return
    }

    log.Printf("Upload successful, URL: %s\n", url)
    c.JSON(http.StatusOK, gin.H{"url": url})
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

        // Categories routes with complete CRUD operations
        api.Group("/categories").
            GET("", categoryController.GetCategories).
            POST("", categoryController.CreateCategory).
            PUT("/:id", categoryController.UpdateCategory).    // Make sure this line exists
            DELETE("/:id", categoryController.DeleteCategory)

        // Update upload route with better duplicate detection
        api.POST("/upload", func(c *gin.Context) {
            file, err := c.FormFile("image")
            if err != nil {
                log.Printf("Error getting form file: %v", err)
                c.JSON(http.StatusBadRequest, gin.H{
                    "error": fmt.Sprintf("Failed to get file: %v", err),
                })
                return
            }

            // Validate file size (max 10MB)
            if file.Size > 10<<20 {
                c.JSON(http.StatusBadRequest, gin.H{
                    "error": "File too large (max 10MB)",
                })
                return
            }

            // Initialize Redis for caching
            if err := utils.InitRedis(); err != nil {
                log.Printf("Warning: Redis initialization failed: %v", err)
                // Continue without Redis - not critical
            }

            // Kiểm tra Redis trước khi upload
            if !utils.CheckRedisConnection() {
                log.Println("Warning: Redis không hoạt động, tiếp tục mà không có cache")
            } else {
                log.Println("Redis đang hoạt động, sẽ sử dụng cache")
            }

            // Upload with duplicate detection
            imageURL, err := utils.UploadImage(file)
            if err != nil {
                log.Printf("Upload error: %v", err)
                c.JSON(http.StatusInternalServerError, gin.H{
                    "error": fmt.Sprintf("Upload failed: %v", err),
                })
                return
            }

            c.JSON(http.StatusOK, gin.H{"url": imageURL})
        })
    }

    // Replace DELETE endpoint with PUT for status update
    router.PUT("/api/products/:id/status", productController.UpdateProductStatus)
}