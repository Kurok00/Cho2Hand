package main

import (
	"context"
	"log"
	"cho2hand/configs"
	"cho2hand/controllers"
	"cho2hand/middleware"
	"cho2hand/routes"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)


func main() {
	// Load environment variables from .env file
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}

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
	log.Println("Server starting on port 5000...")
	if err := router.Run(":5000"); err != nil {
		log.Fatal("Server error:", err)
	}
}