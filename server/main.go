package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

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
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// Debug: Print the MONGO_URI environment variable
	log.Println("MONGO_URI:", os.Getenv("MONGO_URI"))

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

	// Apply CORS middleware
	router.Use(middleware.CORSMiddleware())

	// Set up controllers
	authController := controllers.NewAuthController()
	productController := controllers.NewProductController(db)
	categoryController := controllers.NewCategoryController(db)
	adminController := controllers.NewAdminAuthController(db)
	userController := controllers.NewUserController(db) // Initialize userController

	// Set up routes
	routes.SetupRoutes(router, authController, productController, categoryController, adminController, userController) // Pass userController

	// Remove Socket.IO server setup and handlers

	// Graceful shutdown
	go func() {
		quit := make(chan os.Signal, 1)
		signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
		<-quit
		log.Println("Shutting down server...")

		if err := client.Disconnect(context.TODO()); err != nil {
			log.Fatal("MongoDB disconnect:", err)
		}
	}()

	// Start the server
	log.Println("Server starting on port 5000...")
	if err := http.ListenAndServe(":5000", router); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}