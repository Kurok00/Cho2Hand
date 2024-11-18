package main

import (
	"cho2hand/configs"
	"cho2hand/controllers"
	"cho2hand/middleware"
	"cho2hand/routes"
	
	
	"github.com/gin-gonic/gin"
	"log"
)

func main() {
	// Set up MongoDB connection
	client, err := configs.ConnectMongoDB()
	if err != nil {
		log.Fatal(err)
	}

	// Set the global client variable
	configs.Client = client
	db := client.Database("Cho2Hand")

	// Initialize Gin
	router := gin.Default()

	// Apply CORS middleware only
	router.Use(middleware.CORSMiddleware())

	// Set up controllers
	authController := controllers.NewAuthController()
	productController := controllers.NewProductController(db)
	categoryController := controllers.NewCategoryController(db)
	adminController := controllers.NewAdminAuthController(db)

	// Set up routes
	routes.SetupRoutes(router, authController, productController, categoryController, adminController)

	// Start the server
	log.Println("Server starting on port 5000...")
	if err := router.Run(":5000"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}