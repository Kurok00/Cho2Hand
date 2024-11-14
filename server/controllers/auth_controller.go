package controllers

import (
    "context"
    "encoding/json"
    "net/http"
    "time"
    "os"
    "cho2hand/models"
    "github.com/golang-jwt/jwt"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/bson/primitive"
    "golang.org/x/crypto/bcrypt"
)

type AuthController struct {
    collection *mongo.Collection
}

func NewAuthController(collection *mongo.Collection) *AuthController {
    return &AuthController{collection: collection}
}

func generateToken(userID string) (string, error) {
    claims := jwt.MapClaims{
        "user_id": userID,
        "exp":     time.Now().Add(time.Hour * 72).Unix(),
    }
    
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    
    // Get JWT secret from environment variable
    secret := os.Getenv("JWT_SECRET")
    if secret == "" {
        secret = "your-default-secret-key" // Fallback secret key
    }
    
    return token.SignedString([]byte(secret))
}

func (ac *AuthController) Register(w http.ResponseWriter, r *http.Request) {
    // Add validation
    if r.Method != http.MethodPost {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    var request models.RegisterRequest
    if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    // Validate request data
    if request.Email == "" || request.Password == "" || request.Name == "" {
        http.Error(w, "Missing required fields", http.StatusBadRequest)
        return
    }

    // Check if email exists
    var existingUser models.User
    err := ac.collection.FindOne(context.Background(), bson.M{"email": request.Email}).Decode(&existingUser)
    if err == nil {
        http.Error(w, "Email already exists", http.StatusConflict)
        return
    }

    // Hash password
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(request.Password), bcrypt.DefaultCost)
    if err != nil {
        http.Error(w, "Error hashing password", http.StatusInternalServerError)
        return
    }

    user := models.User{
        Name:      request.Name,
        Email:     request.Email,
        Phone:     request.Phone,
        Password:  string(hashedPassword),
        CreatedAt: time.Now(),
    }

    result, err := ac.collection.InsertOne(context.Background(), user)
    if err != nil {
        http.Error(w, "Error creating user", http.StatusInternalServerError)
        return
    }

    user.ID = result.InsertedID.(primitive.ObjectID)
    token, err := generateToken(user.ID.Hex())
    if err != nil {
        http.Error(w, "Error generating token", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(models.AuthResponse{
        Token: token,
        User:  user,
    })
}

func (ac *AuthController) Login(w http.ResponseWriter, r *http.Request) {
    // Add validation
    if r.Method != http.MethodPost {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    var request models.LoginRequest
    if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    var user models.User
    err := ac.collection.FindOne(context.Background(), bson.M{"email": request.Email}).Decode(&user)
    if err != nil {
        http.Error(w, "Invalid credentials", http.StatusUnauthorized)
        return
    }

    if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(request.Password)); err != nil {
        http.Error(w, "Invalid credentials", http.StatusUnauthorized)
        return
    }

    token, err := generateToken(user.ID.Hex())
    if err != nil {
        http.Error(w, "Error generating token", http.StatusInternalServerError)
        return
    }

    // Set CORS headers
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Control-Allow-Methods", "POST")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(models.AuthResponse{
        Token: token,
        User:  user,
    })
}