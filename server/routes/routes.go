package routes

import (
    "cho2hand/controllers"
    "cho2hand/utils"
    "github.com/gin-gonic/gin"
    "net/http"
    "fmt"
    "log"
    "go.mongodb.org/mongo-driver/bson/primitive"
    "go.mongodb.org/mongo-driver/mongo"
    "cho2hand/models"
    "io"
    "bytes"
    "cho2hand/middleware"
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

func SetupRoutes(router *gin.Engine, db *mongo.Database, authController *controllers.AuthController, 
    productController *controllers.ProductController,
    categoryController *controllers.CategoryController,
    adminAuthController *controllers.AdminAuthController,
    userController *controllers.UserController,
    cityController *controllers.CityController) {

    // Use the proper CORS middleware
    router.Use(middleware.CORSMiddleware())

    // Apply AuthMiddleware to routes that require user authentication
    authRoutes := router.Group("/")
    authRoutes.Use(middleware.AuthMiddleware())
    {
        authRoutes.POST("/api/products/with-phone-details", productController.CreateProductWithPhoneDetails)
        authRoutes.GET("/api/users/location", userController.GetUserLocation)
        // ...other routes that require authentication...
    }

    // City routes
    router.GET("/api/cities", cityController.GetCities)

    // District routes - use models.NewDistrictService directly
    districtService := models.NewDistrictService(db)
    router.GET("/api/districts/city/:cityId", func(c *gin.Context) {
        cityId := c.Param("cityId")
        objID, err := primitive.ObjectIDFromHex(cityId)
        if err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid city ID"})
            return
        }

        districts, err := districtService.GetDistrictsByCity(objID)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching districts"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"data": districts})
    })

    // Add debug log
    log.Println("Setting up routes - including /api/cities")

    // Auth routes
    router.POST("/api/auth/register", func(c *gin.Context) {
        body, err := c.GetRawData()
        if err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
            return
        }

        // Log raw body
        log.Printf("Raw request body: %s", string(body))
        
        // Restore request body
        c.Request.Body = io.NopCloser(bytes.NewBuffer(body))

        // Forward to controller
        authController.Register(c)
    })
    router.POST("/api/auth/login", authController.Login)

    // Admin auth routes
    router.POST("/api/admin/auth/register", adminAuthController.Register)
    router.POST("/api/admin/auth/login", adminAuthController.Login)
    router.POST("/api/admin/auth/logout", adminAuthController.Logout)
    router.GET("/api/admin/auth/username", adminAuthController.GetUsername)

    // Product routes - Specific routes first!
    router.PUT("/api/products/:id/status", productController.UpdateProductStatus)  // Must be before generic /:id routes
    router.GET("/api/products/category/:category", productController.GetProductsByCategory)
    router.GET("/api/products/search", productController.SearchProducts)

    // Generic product routes after specific ones
    router.GET("/api/products", productController.GetProducts)
    router.POST("/api/products", productController.CreateProduct)
    router.GET("/api/products/:id", productController.GetProductByID)  // Ensure this route is included
    router.PUT("/api/products/:id", productController.UpdateProduct)
    router.POST("/api/products/batch", productController.CreateManyProducts)

    // User product routes 
    router.GET("/api/users/:userId/products", productController.GetUserProducts)

    // Update upload route
    router.POST("/api/upload", func(c *gin.Context) {
        // Get file from form
        file, err := c.FormFile("image")
        if (err != nil) {
            c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
            return
        }

        // Upload to Cloudinary with Redis cache
        imageURL, err := utils.UploadImage(file)
        if (err != nil) {
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
            return
        }

        c.JSON(http.StatusOK, gin.H{"url": imageURL})
    })

    // Add route for hashing passwords
    router.POST("/api/hash-password", func(c *gin.Context) {
        var request struct {
            Password string `json:"password"`
        }
        if err := c.ShouldBindJSON(&request); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
            return
        }
        hashedPassword, err := utils.HashPassword(request.Password)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Error hashing password"})
            return
        }
        c.JSON(http.StatusOK, gin.H{"hashedPassword": hashedPassword})
    })

    // Category routes
    router.GET("/api/categories", categoryController.GetCategories)
    router.POST("/api/categories", categoryController.CreateCategory)
    router.PUT("/api/categories/:id", categoryController.UpdateCategory)
    router.DELETE("/api/categories/:id", categoryController.DeleteCategory)

    router.GET("/api/users/:userId", userController.GetUserByID)
    router.GET("/api/users/:userId/password", userController.GetUserPassword)
    router.GET("/api/users/:userId/phone", userController.GetUserPhone) // Ensure this route is included

    // User management routes
    router.GET("/api/users", userController.GetUsers)
    router.POST("/api/users", userController.CreateUser)
    router.PUT("/api/users/:id", userController.UpdateUser)
    router.DELETE("/api/users/:id", userController.DeleteUser)

    // Admin management routes
    router.POST("/api/admins", adminAuthController.Register)
    router.GET("/api/admins", userController.GetAdmins)
    router.GET("/api/admins/:id", userController.GetAdminByID) // Ensure this route is included
    router.PUT("/api/admins/:id", userController.UpdateAdmin)
    router.DELETE("/api/admins/:id", userController.DeleteAdmin) // Add this route

    // Static file serving
    router.Static("/uploads", "./uploads")

    // Handle undefined routes
    router.NoRoute(func(c *gin.Context) {
        c.JSON(http.StatusNotFound, gin.H{"error": "Route not found"})
    })

    // Add new route for product phone details
    router.GET("/api/products/:id/phone-details", productController.GetProductWithPhoneDetails)

    // Add debug logging
    log.Println("Registering route: POST /api/products/with-phone-details")
    // Add new route for creating product with phone details
    // This route is already defined in the authRoutes group, so remove this duplicate
    // router.POST("/api/products/with-phone-details", productController.CreateProductWithPhoneDetails)

    // Add new route for getting user location
    // This route is already defined in the authRoutes group, so remove this duplicate
    // router.GET("/api/users/location", middleware.AuthMiddleware(), userController.GetUserLocation)
}