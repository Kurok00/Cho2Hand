package controllers

import (
    "net/http"
    "cho2hand/models"
    "cho2hand/utils"
    "github.com/gin-gonic/gin"
    "go.mongodb.org/mongo-driver/mongo"
    "time"
    "log"
)

type AuthController struct {
    userCollection *mongo.Collection
    userService   *models.UserService // Add userService field
}

func NewAuthController(db *mongo.Database) *AuthController {
    return &AuthController{
        userCollection: db.Collection("users"),
        userService:   models.NewUserService(db),
    }
}

// Define register data struct at package level to ensure consistency
type RegisterData struct {
    Name            string `json:"name" binding:"required"`
    Username        string `json:"username" binding:"required"`
    Email          string `json:"email" binding:"required,email"`
    Phone          string `json:"phone" binding:"required"`
    Password       string `json:"password" binding:"required,min=6"`
    CityId         string `json:"cityId" binding:"required"`
    DistrictId     string `json:"districtId" binding:"required"`
    ConfirmPassword string `json:"confirmPassword" binding:"required"`
}

func (ac *AuthController) Register(c *gin.Context) {
    var registerData RegisterData
    if err := c.ShouldBindJSON(&registerData); err != nil {
        log.Printf("Validation error: %v", err)
        c.JSON(http.StatusBadRequest, gin.H{
            "error": "Validation failed",
            "details": err.Error(),
        })
        return
    }

    log.Printf("Register data received: %+v", registerData)

    // Enhanced password validation
    if len(registerData.Password) < 6 {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": "Mật khẩu phải có ít nhất 6 ký tự",
        })
        return
    }

    // Check for existing user
    existingUser, _ := ac.userService.GetByUsername(registerData.Username)
    if existingUser != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": "Tên đăng nhập đã tồn tại",
        })
        return
    }

    // Custom validations
    if registerData.Password == "" {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": "Mật khẩu không được để trống",
        })
        return
    }

    if registerData.Password != registerData.ConfirmPassword {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": "Mật khẩu xác nhận không khớp",
        })
        return
    }

    // Hash password
    hashedPassword, err := utils.HashPassword(registerData.Password)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
        return
    }

    user := &models.User{
        Username:   registerData.Username,
        Name:      registerData.Name,
        Email:     registerData.Email,
        Phone:     registerData.Phone,
        Password:  hashedPassword,
        CreatedAt: time.Now(),
        UpdatedAt: time.Now(),
    }

    // Create user with location
    err = ac.userService.CreateUserWithLocation(user, registerData.CityId, registerData.DistrictId)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
        return
    }

    // Get user with location details
    userWithLocation, err := ac.userService.GetByIDWithLocation(user.ID)
    if err != nil {
        c.JSON(http.StatusOK, user)
        return
    }

    c.JSON(http.StatusCreated, userWithLocation)
}

func (ac *AuthController) Login(c *gin.Context) {
    var input models.Login

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Find user by username or phone
    var user *models.User
    var err error

    if input.Username != "" {
        user, err = ac.userService.GetByUsername(input.Username)
    } else if input.Phone != "" {
        user, err = ac.userService.GetByPhone(input.Phone)
    } else {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Username or phone number required"})
        return
    }

    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
        return
    }

    // Verify password
    if !utils.CheckPasswordHash(input.Password, user.Password) {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
        return
    }

    // Get user with location details
    userWithLocation, err := ac.userService.GetByIDWithLocation(user.ID)
    if err != nil {
        // If we can't get location details, just return the basic user
        c.JSON(http.StatusOK, gin.H{"user": user})
        return
    }

    c.JSON(http.StatusOK, gin.H{"user": userWithLocation})
}
