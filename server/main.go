package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"cho2hand/configs"
	"cho2hand/controllers"
	"cho2hand/middleware"
	"cho2hand/routes"
	"github.com/gin-gonic/gin"
)

func main() {
	// Debug: Print environment variables
	log.Println("MONGO_URI:", os.Getenv("MONGO_URI"))
	log.Println("REDIS_URI:", os.Getenv("REDIS_URI"))
	log.Println("PORT:", os.Getenv("PORT"))
	log.Println("CLOUDINARY_CLOUD_NAME:", os.Getenv("CLOUDINARY_CLOUD_NAME"))
	log.Println("CLOUDINARY_API_KEY:", os.Getenv("CLOUDINARY_API_KEY"))
	log.Println("CLOUDINARY_API_SECRET:", os.Getenv("CLOUDINARY_API_SECRET"))

	// Set up MongoDB connection
	client, err := configs.ConnectMongoDB()
	if err != nil {
		log.Fatal("MongoDB connection error:", err)
	}
	defer client.Disconnect(context.Background())
	
	configs.Client = client
	db := client.Database("Cho2Hand")

	// Initialize Gin and controllers
	router := gin.Default()
	router.Use(middleware.CORSMiddleware())

	// Handle root URL
	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Welcome to Cho2Hand API",
		})
	})

	// Initialize controllers with database
	authController := controllers.NewAuthController(db)
	productController := controllers.NewProductController(db)
	categoryController := controllers.NewCategoryController(db)
	adminAuthController := controllers.NewAdminAuthController(db)
	userController := controllers.NewUserController(db)
	cityController := controllers.NewCityController(db)

	// Set up routes
	routes.SetupRoutes(
		router,
		db,
		authController,
		productController,
		categoryController,
		adminAuthController,
		userController,
		cityController,
	)

	// Start server with simple error handling
	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}
	log.Println("Server starting on port", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Server error:", err)
	}
}
