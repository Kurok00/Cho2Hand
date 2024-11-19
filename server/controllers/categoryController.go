package controllers

import (
	"context"
	"net/http"
	"strings"
	"time"
	"log"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"cho2hand/models"
	"cho2hand/utils"
	
)

type CategoryController struct {
	collection *mongo.Collection
}

func NewCategoryController(db *mongo.Database) *CategoryController {
	return &CategoryController{
		collection: db.Collection("categories"),
	}
}

func (cc *CategoryController) GetCategories(c *gin.Context) {
	var categories []models.Category
	cursor, err := cc.collection.Find(context.Background(), bson.M{})
	if (err != nil) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi lấy danh sách danh mục"})
		return
	}
	defer cursor.Close(context.Background())

	location, _ := time.LoadLocation("Asia/Bangkok")
	for cursor.Next(context.Background()) {
		var category models.Category
		if err := cursor.Decode(&category); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi giải mã danh mục"})
			return
		}
		category.CreatedAt = category.CreatedAt.In(location)
		category.UpdatedAt = category.UpdatedAt.In(location)
		categories = append(categories, category)
	}

	if len(categories) == 0 {
		c.JSON(http.StatusOK, gin.H{"status": 200, "data": []models.Category{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": 200, "data": categories})
}

func (cc *CategoryController) CreateCategory(c *gin.Context) {
    var category models.Category
    if err := c.ShouldBindJSON(&category); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ"})
        return
    }

    // Check if image is a URL and not already a Cloudinary URL
    if category.Image != "" && !strings.HasPrefix(category.Image, "https://res.cloudinary.com/") {
        // Upload to Cloudinary
        imageURL, err := utils.UploadImageFromURL(category.Image)
        if (err != nil) {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi tải lên hình ảnh"})
            return
        }
        category.Image = imageURL
    }

    category.ID = primitive.NewObjectID()
    category.CreatedAt = time.Now()
    category.UpdatedAt = time.Now()

    _, err := cc.collection.InsertOne(context.Background(), category)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi tạo danh mục"})
        return
    }

    c.JSON(http.StatusCreated, gin.H{"status": 201, "data": category})
}

func (cc *CategoryController) UpdateCategory(c *gin.Context) {
    id := c.Param("id")
    log.Printf("Updating category with ID: %s", id) // Add logging

    objID, err := primitive.ObjectIDFromHex(id)
    if err != nil {
        log.Printf("Invalid ID format: %v", err)
        c.JSON(http.StatusBadRequest, gin.H{"error": "ID không hợp lệ"})
        return
    }

    var category models.Category
    if err := c.ShouldBindJSON(&category); err != nil {
        log.Printf("Invalid request body: %v", err)
        c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ"})
        return
    }

    log.Printf("Received category data: %+v", category) // Add logging

    // Check if the category exists
    var existingCategory models.Category
    err = cc.collection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&existingCategory)
    if err != nil {
        if err == mongo.ErrNoDocuments {
            log.Printf("Category not found: %s", id)
            c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy danh mục"})
            return
        }
        log.Printf("Database error: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi tìm danh mục"})
        return
    }

    // Update fields
    update := bson.M{
        "$set": bson.M{
            "name":      category.Name,
            "image":     category.Image,
            "updatedAt": time.Now(),
        },
    }

    opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
    result := cc.collection.FindOneAndUpdate(
        context.Background(),
        bson.M{"_id": objID},
        update,
        opts,
    )

    var updatedCategory models.Category
    if err := result.Decode(&updatedCategory); err != nil {
        log.Printf("Error updating category: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi cập nhật danh mục"})
        return
    }

    log.Printf("Successfully updated category: %+v", updatedCategory)
    c.JSON(http.StatusOK, gin.H{
        "status": 200,
        "data": updatedCategory,
    })
}

func (cc *CategoryController) DeleteCategory(c *gin.Context) {
    id := c.Param("id")
    objID, err := primitive.ObjectIDFromHex(id)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "ID không hợp lệ"})
        return
    }

    result, err := cc.collection.DeleteOne(context.Background(), bson.M{"_id": objID})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi xóa danh mục"})
        return
    }

    if result.DeletedCount == 0 {
        c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy danh mục"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"status": 200, "message": "Đã xóa danh mục thành công"})
}