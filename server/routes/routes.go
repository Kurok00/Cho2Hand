package routes

import (
    "cho2hand/controllers"
    "cho2hand/middleware"
    
    "github.com/gorilla/mux"
)

func SetupRoutes(router *mux.Router, productController *controllers.ProductController) {
    // Apply CORS middleware to all routes
    router.Use(middleware.CORSMiddleware)

    // API routes
    api := router.PathPrefix("/api").Subrouter()
    
    // Products routes
    api.HandleFunc("/products", productController.GetProducts).Methods("GET", "OPTIONS")
    api.HandleFunc("/products/{id}", productController.GetProduct).Methods("GET", "OPTIONS")
    api.HandleFunc("/products", productController.CreateProduct).Methods("POST", "OPTIONS")
    api.HandleFunc("/products/batch", productController.CreateManyProducts).Methods("POST", "OPTIONS")
    api.HandleFunc("/products/{id}", productController.UpdateProduct).Methods("PUT", "OPTIONS")
    api.HandleFunc("/products/{id}", productController.DeleteProduct).Methods("DELETE", "OPTIONS")
    
    // Add upload routes
    UploadRoute(router)
}