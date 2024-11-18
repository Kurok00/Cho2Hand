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
    adminCollection *mongo.Collection
}

func NewAdminAuthController(db *mongo.Database) *AdminAuthController {
    return &AdminAuthController{
        adminCollection: db.Collection("admins"),
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
    admin.Name = c.PostForm("name")

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

    var admin models.Admin
    err := ac.adminCollection.FindOne(context.Background(), bson.M{
        "username": loginData.Username,
    }).Decode(&admin)

    if err != nil || !utils.CheckPasswordHash(loginData.Password, admin.Password) {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Username hoặc mật khẩu không đúng"})
        return
    }

    err = utils.SetSession(c, "admin", admin.Username)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi tạo session"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "Đăng nhập thành công",
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