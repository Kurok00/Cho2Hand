package controllers

import (
	"cho2hand/models"
	"context"
	"net/http"
	"time"
	"log"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

type UserController struct {
    userCollection  *mongo.Collection
    adminCollection *mongo.Collection
    userService     *models.UserService // Add userService field
}

func NewUserController(db *mongo.Database) *UserController {
    return &UserController{
        userCollection:  db.Collection("users"),
        adminCollection: db.Collection("admins"),
        userService:     models.NewUserService(db), // Initialize userService
    }
}

func (uc *UserController) GetUsers(c *gin.Context) {
    log.Println("Fetching all users")
    var users []models.User
    cursor, err := uc.userCollection.Find(context.Background(), bson.M{})
    if err != nil {
        log.Println("Error fetching users:", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Error fetching users",
            "details": err.Error(),
        })
        return
    }
    defer cursor.Close(context.Background())

    if err = cursor.All(context.Background(), &users); err != nil {
        log.Println("Error decoding users:", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Error decoding users",
            "details": err.Error(),
        })
        return
    }

    // Nếu không có dữ liệu
    if len(users) == 0 {
        c.JSON(http.StatusOK, []models.User{}) // Trả về mảng rỗng thay vì null
        return
    }

    log.Println("Users fetched successfully")
    c.JSON(http.StatusOK, users)
}

func (uc *UserController) GetAdmins(c *gin.Context) {
    log.Println("Fetching all admins")
    var admins []models.Admin
    cursor, err := uc.adminCollection.Find(context.Background(), bson.M{})
    if (err != nil) {
        log.Println("Error fetching admins:", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Error fetching admins",
            "details": err.Error(),
        })
        return
    }
    defer cursor.Close(context.Background())

    if err = cursor.All(context.Background(), &admins); err != nil {
        log.Println("Error decoding admins:", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Error decoding admins",
            "details": err.Error(),
        })
        return
    }

    // Nếu không có dữ liệu
    if len(admins) == 0 {
        c.JSON(http.StatusOK, []models.Admin{}) // Trả về mảng rỗng thay vì null
        return
    }

    log.Println("Admins fetched successfully")
    c.JSON(http.StatusOK, admins)
}

func (uc *UserController) CreateUser(c *gin.Context) {
    log.Println("Creating a new user")
    var user models.User
    if err := c.ShouldBindJSON(&user); err != nil {
        log.Println("Error binding JSON:", err)
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost) // Hash the password
    if err != nil {
        log.Println("Error hashing password:", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Error hashing password"})
        return
    }
    user.Password = string(hashedPassword) // Set the hashed password

    user.ID = primitive.NewObjectID()
    user.CreatedAt = time.Now() // Fix type mismatch
    user.UpdatedAt = time.Now() // Fix type mismatch

    _, err = uc.userCollection.InsertOne(context.Background(), user)
    if err != nil {
        log.Println("Error creating user:", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating user"})
        return
    }

    log.Println("User created successfully:", user)
    c.JSON(http.StatusCreated, user)
}

func (uc *UserController) UpdateUser(c *gin.Context) {
    id := c.Param("id")
    log.Println("Updating user with ID:", id)
    objID, err := primitive.ObjectIDFromHex(id)
    if err != nil {
        log.Println("Invalid ID:", id)
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
        return
    }

    var user models.User
    if err := c.ShouldBindJSON(&user); err != nil {
        log.Println("Error binding JSON:", err)
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    if user.Password != "" {
        hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost) // Hash the password
        if err != nil {
            log.Println("Error hashing password:", err)
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Error hashing password"})
            return
        }
        user.Password = string(hashedPassword) // Set the hashed password
    }

    user.UpdatedAt = time.Now() // Fix type mismatch

    update := bson.M{
        "$set": bson.M{
            "username":  user.Username, // Ensure username is included in the update
            "name":      user.Name,
            "email":     user.Email,
            "phone":     user.Phone,
            "password":  user.Password,
            "updated_at": user.UpdatedAt,
        },
    }

    _, err = uc.userCollection.UpdateOne(context.Background(), bson.M{"_id": objID}, update)
    if err != nil {
        log.Println("Error updating user:", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Error updating user"})
        return
    }

    log.Println("User updated successfully:", user)
    c.JSON(http.StatusOK, user)
}

func (uc *UserController) DeleteUser(c *gin.Context) {
    id := c.Param("id")
    log.Println("Deleting user with ID:", id) // Add logging
    objID, err := primitive.ObjectIDFromHex(id)
    if err != nil {
        log.Println("Invalid ID:", id) // Add logging
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
        return
    }

    _, err = uc.userCollection.DeleteOne(context.Background(), bson.M{"_id": objID})
    if err != nil {
        log.Println("Error deleting user:", err) // Add logging
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Error deleting user"})
        return
    }

    log.Println("User deleted successfully:", id) // Add logging
    c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}

func (uc *UserController) GetUserPassword(c *gin.Context) {
	id := c.Param("userId") // Change from "id" to "userId"
	log.Println("Received request for user password with ID:", id) // Add logging

	if id == "" {
		log.Println("ID parameter is empty") // Add logging
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID parameter is required"})
		return
	}

	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		log.Println("Error converting ID to ObjectID:", err) // Add logging
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	password, err := uc.userService.GetUserPassword(objID) // Ensure this method exists in models.UserService
	if err != nil {
		log.Println("Error fetching password for ID:", id, "Error:", err) // Add logging
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching password"})
		return
	}

	log.Println("Password found for user ID:", id, "Password:", password) // Add logging
	c.JSON(http.StatusOK, gin.H{"password": password})
}

// controllers/userController.go
func (uc *UserController) GetUserByID(c *gin.Context) {
    id := c.Param("userId") // Change from "id" to "userId"
    
    // Add debug logging
    log.Printf("Received request for user ID: %s", id)
    
    objectID, err := primitive.ObjectIDFromHex(id)
    if err != nil {
        log.Printf("Invalid ID format: %v", err)
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
        return
    }

    user, err := uc.userService.GetByID(objectID)
    if err != nil {
        log.Printf("Error finding user: %v", err)
        c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
        return
    }

    c.JSON(http.StatusOK, user)
}

func (uc *UserController) UpdateAdmin(c *gin.Context) {
    id := c.Param("id")
    log.Println("Updating admin with ID:", id)
    objID, err := primitive.ObjectIDFromHex(id)
    if err != nil {
        log.Println("Invalid ID:", id)
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
        return
    }

    var admin models.Admin
    if err := c.ShouldBindJSON(&admin); err != nil {
        log.Println("Error binding JSON:", err)
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    if admin.Password != "" {
        hashedPassword, err := bcrypt.GenerateFromPassword([]byte(admin.Password), bcrypt.DefaultCost)
        if err != nil {
            log.Println("Error hashing password:", err)
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Error hashing password"})
            return
        }
        admin.Password = string(hashedPassword)
    }

    admin.UpdatedAt = time.Now()

    update := bson.M{
        "$set": bson.M{
            "username":  admin.Username,
            "name":      admin.Name,
            "password":  admin.Password,
            "status":    admin.Status,
            "updated_at": admin.UpdatedAt,
        },
    }

    _, err = uc.adminCollection.UpdateOne(context.Background(), bson.M{"_id": objID}, update)
    if err != nil {
        log.Println("Error updating admin:", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Error updating admin"})
        return
    }

    log.Println("Admin updated successfully:", admin)
    c.JSON(http.StatusOK, admin)
}

func (uc *UserController) DeleteAdmin(c *gin.Context) {
    id := c.Param("id")
    log.Println("Received request to delete admin with ID:", id) // Add logging
    objID, err := primitive.ObjectIDFromHex(id)
    if err != nil {
        log.Println("Invalid ID format:", id, "Error:", err) // Add logging
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
        return
    }

    log.Println("Attempting to delete admin with ObjectID:", objID) // Add logging
    result, err := uc.adminCollection.DeleteOne(context.Background(), bson.M{"_id": objID})
    if err != nil {
        log.Println("Error deleting admin:", err) // Add logging
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Error deleting admin"})
        return
    }

    if result.DeletedCount == 0 {
        log.Println("No admin found with ID:", id) // Add logging
        c.JSON(http.StatusNotFound, gin.H{"error": "Admin not found"})
        return
    }

    log.Println("Admin deleted successfully:", id) // Add logging
    c.JSON(http.StatusOK, gin.H{"message": "Admin deleted successfully"})
}

func (uc *UserController) Register(c *gin.Context) {
  log.Println("Registering a new admin")
  var admin models.Admin
  if err := c.ShouldBindJSON(&admin); err != nil {
    log.Println("Error binding JSON:", err)
    c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
    return
  }

  hashedPassword, err := bcrypt.GenerateFromPassword([]byte(admin.Password), bcrypt.DefaultCost)
  if err != nil {
    log.Println("Error hashing password:", err)
    c.JSON(http.StatusInternalServerError, gin.H{"error": "Error hashing password"})
    return
  }
  admin.Password = string(hashedPassword)

  admin.ID = primitive.NewObjectID()
  admin.CreatedAt = time.Now()
  admin.UpdatedAt = time.Now()
  admin.Status = "active" // Set default status

  _, err = uc.adminCollection.InsertOne(context.Background(), admin)
  if err != nil {
    log.Println("Error creating admin:", err)
    c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating admin"})
    return
  }

  log.Println("Admin created successfully:", admin)
  c.JSON(http.StatusCreated, gin.H{
    "id":       admin.ID.Hex(),
    "username": admin.Username,
    "name":     admin.Name,
    "status":   admin.Status,
  })
}

func (uc *UserController) GetAdminByID(c *gin.Context) {
    id := c.Param("id") // Correctly retrieves the "id" parameter from the request
    log.Println("Fetching admin with ID:", id)
    objID, err := primitive.ObjectIDFromHex(id) // Correctly converts the "id" to an ObjectID
    if err != nil {
        log.Println("Invalid ID:", id)
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
        return
    }

    var admin models.Admin
    err = uc.adminCollection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&admin) // Correctly queries the collection using "_id"
    if err != nil {
        log.Println("Error fetching admin:", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching admin"})
        return
    }

    log.Println("Admin fetched successfully:", admin)
    c.JSON(http.StatusOK, gin.H{
        "_id":      admin.ID.Hex(), // Correctly includes the "_id" field in the response
        "username": admin.Username,
        "name":     admin.Name,
        "status":   admin.Status,
    })
}

func (uc *UserController) GetUserPhone(c *gin.Context) {
    userId := c.Param("userId")
    id, err := primitive.ObjectIDFromHex(userId)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
        return
    }

    user, err := uc.userService.GetByID(id)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "User not found"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"phone": user.Phone})
}