package controllers

import (
	"context"
	"net/http"
	"cho2hand/models"
	"cho2hand/utils"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"time"
	
	
)

type AdminAuthController struct {
	adminService    *models.AdminService
	adminCollection *mongo.Collection // Add this line
}

func NewAdminAuthController(db *mongo.Database) *AdminAuthController {
	return &AdminAuthController{
		adminService:    models.NewAdminService(db),
		adminCollection: db.Collection("admins"), // Add this line
	}
}

func (ac *AdminAuthController) Register(c *gin.Context) {
    var admin models.Admin
    if err := c.ShouldBindJSON(&admin); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Check if username already exists
    existingAdmin := models.Admin{}
    err := ac.adminCollection.FindOne(context.Background(), bson.M{
        "username": admin.Username,
    }).Decode(&existingAdmin)
    if err == nil {
        c.JSON(http.StatusConflict, gin.H{"error": "Username đã tồn tại"})
        return
    }

    // Hash password
    hashedPassword, err := utils.HashPassword(admin.Password)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi mã hóa mật khẩu"})
        return
    }
    admin.Password = hashedPassword
    admin.CreatedAt = time.Now()

    // Save new admin
    result, err := ac.adminCollection.InsertOne(context.Background(), admin)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi tạo tài khoản"})
        return
    }

    c.JSON(http.StatusCreated, gin.H{
        "id": result.InsertedID,
    })
}

func (ac *AdminAuthController) Login(c *gin.Context) {
    var loginData models.AdminLogin
    if err := c.ShouldBindJSON(&loginData); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    var admin models.Admin
    err := ac.adminCollection.FindOne(ctx, bson.M{
        "username": loginData.Username,
    }).Decode(&admin)

    if err != nil || !utils.CheckPasswordHash(loginData.Password, admin.Password) {
        c.JSON(http.StatusUnauthorized, gin.H{
            "error": "Username hoặc mật khẩu không đúng",
            "status": http.StatusUnauthorized,
        })
        return
    }

    // Return admin data directly
    c.JSON(http.StatusOK, gin.H{
        "status": http.StatusOK,
        "message": "Đăng nhập thành công",
        "admin": gin.H{
            "id": admin.ID.Hex(), // Convert ObjectID to string
            "username": admin.Username,
            "name": admin.Name,
        },
    })
}

func (ac *AdminAuthController) Logout(c *gin.Context) {
    err := utils.ClearSession(c)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi xóa session"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Đăng xuất thành công"})
}

func (ac *AdminAuthController) GetUsername(c *gin.Context) {
    // Get username from header
    username := c.GetHeader("X-Admin-Username")
    if username == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Not logged in"})
        return
    }

    // Find admin by username
    var admin models.Admin
    err := ac.adminCollection.FindOne(context.Background(), bson.M{
        "username": username,
    }).Decode(&admin)
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Admin not found"})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "name": admin.Name, // Return the name field instead of username
    })
}