package controllers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"cho2hand/models"
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
	if err != nil {
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