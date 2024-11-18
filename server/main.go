package main

import (
	"cho2hand/configs"
	"cho2hand/controllers"
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

	// Set up controllers
	authController := controllers.NewAuthController()
	productController := controllers.NewProductController(db)
	categoryController := controllers.NewCategoryController(db)

	// Set up Gin router
	router := gin.Default()

	// Set up routes
	routes.SetupRoutes(router, authController, productController, categoryController)

	// Start the server
	router.Run(":5000")
}