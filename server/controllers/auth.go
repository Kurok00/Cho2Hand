package controllers

import (
    "net/http"
    "cho2hand/models"
    "cho2hand/utils"
    "cho2hand/configs"
    "github.com/gin-gonic/gin"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/mongo"
    "context"
    "time"
    "fmt"
)

type AuthController struct {
    userCollection *mongo.Collection
}

func NewAuthController() *AuthController {
    return &AuthController{
        userCollection: configs.GetCollection("users"),
    }
}

func (ac *AuthController) Register(c *gin.Context) {
    var user models.User
    if err := c.ShouldBindJSON(&user); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    hashedPassword, err := utils.HashPassword(user.Password)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
        return
    }
    user.Password = hashedPassword

    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    _, err = ac.userCollection.InsertOne(ctx, user)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
        return
    }

    c.JSON(http.StatusCreated, gin.H{"message": "User registered successfully"})
}

func (ac *AuthController) Login(c *gin.Context) {
    var loginData models.Login
    if err := c.ShouldBindJSON(&loginData); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    var user models.User
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    // Debug output
    fmt.Printf("Login attempt with username: %s, phone: %s\n", loginData.Username, loginData.Phone)

    filter := bson.M{}
    if loginData.Username != "" {
        filter = bson.M{"username": loginData.Username}
    } else if loginData.Phone != "" {
        filter = bson.M{"phone": loginData.Phone}
    }

    err := ac.userCollection.FindOne(ctx, filter).Decode(&user)
    if err != nil {
        if err == mongo.ErrNoDocuments {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Tài khoản hoặc mật khẩu không đúng"})
            return
        }
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi server"})
        return
    }

    // Debug output
    fmt.Printf("Found user: %+v\n", user)

    if !utils.CheckPasswordHash(loginData.Password, user.Password) {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Tài khoản hoặc mật khẩu không đúng"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "Đăng nhập thành công",
        "user": gin.H{
            "id":       user.ID,
            "name":     user.Name,
            "username": user.Username,
            "email":    user.Email,
            "phone":    user.Phone,
        },
    })
}