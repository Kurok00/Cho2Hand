package routes

import (
    "cho2hand/controllers"
    "github.com/gorilla/mux"
)

func SetupAuthRoutes(router *mux.Router, authController *controllers.AuthController) {
    router.HandleFunc("/api/auth/register", authController.Register).Methods("POST", "OPTIONS")
    router.HandleFunc("/api/auth/login", authController.Login).Methods("POST", "OPTIONS") 
}