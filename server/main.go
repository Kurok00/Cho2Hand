package main

import (
	"context"
	"log"
	"net/http"
	

	"cho2hand/configs"
	"cho2hand/controllers"
	"cho2hand/middleware"
	"cho2hand/routes"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

var allowOriginFunc = func(r *http.Request) bool {
	return true
}

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

	// Set up controllers
	authController := controllers.NewAuthController()
	productController := controllers.NewProductController(db)
	categoryController := controllers.NewCategoryController(db)
	adminController := controllers.NewAdminAuthController(db)
	userController := controllers.NewUserController(db)

	// Set up routes
	routes.SetupRoutes(router, authController, productController, categoryController, adminController, userController)

	// Start server with simple error handling
	log.Println("Server starting on port 5000...")
	if err := router.Run(":5000"); err != nil {
		log.Fatal("Server error:", err)
	}
}