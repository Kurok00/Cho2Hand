package main

import (
	"cho2hand/configs"
	"cho2hand/controllers"
	"cho2hand/routes"
	"cho2hand/utils"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

func main() {
    // Load environment variables
    if err := godotenv.Load(); err != nil {
        log.Fatal("Error loading .env file")
    }

    // Initialize Cloudinary
    if err := utils.InitCloudinary(); err != nil {
        log.Fatal("Failed to initialize Cloudinary:", err)
    }

    // Initialize router
    router := mux.NewRouter()

    // Connect to database
    client := configs.ConnectDB()
    collection := configs.GetCollection(client, "products")

    // Initialize controllers
    productController := controllers.NewProductController(collection)

    // Setup routes
    routes.SetupRoutes(router, productController)

    // Start server
    log.Printf("Server is running on port 8080")
    log.Fatal(http.ListenAndServe(":8080", router))
}