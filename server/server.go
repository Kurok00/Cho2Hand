package main

import (
	"context"
	"log"
	"time"

	"cho2hand/controllers"
	"cho2hand/routes"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func startServer() {
	// Initialize Gin router
	router := gin.Default()

	// Connect to MongoDB
	client, err := mongo.NewClient(options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Fatal(err)
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	err = client.Connect(ctx)
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(ctx)

	// Initialize controllers
	db := client.Database("cho2hand")
	authController := controllers.NewAuthController()
	productController := controllers.NewProductController(db)
	categoryController := controllers.NewCategoryController(db) // Pass the database instead of collection

	// Setup routes
	routes.SetupRoutes(router, authController, productController, categoryController)

	// Start the server
	if err := router.Run(":5000"); err != nil {
		log.Fatal(err)
	}
}