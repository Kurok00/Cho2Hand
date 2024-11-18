package controllers

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"cho2hand/models"
)

type ProductController struct {
	productCollection *mongo.Collection
	addressCollection *mongo.Collection
}

func NewProductController(db *mongo.Database) *ProductController {
	return &ProductController{
		productCollection: db.Collection("products"),
		addressCollection: db.Collection("addresses"),
	}
}

func (pc *ProductController) CreateProduct(c *gin.Context) {
	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		log.Printf("Error binding JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Log the product data for debugging
	fmt.Printf("Product data received: %+v\n", product)

	product.CreatedAt = time.Now()
	product.UpdatedAt = time.Now()

	result, err := pc.productCollection.InsertOne(context.Background(), product)
	if err != nil {
		log.Printf("Error inserting product: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi tạo sản phẩm"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"id": result.InsertedID})
}

func (pc *ProductController) GetProducts(c *gin.Context) {
	var products []models.Product
	cursor, err := pc.productCollection.Find(context.Background(), bson.M{})
	if err != nil {
		log.Printf("Error fetching products: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi lấy danh sách sản phẩm"})
		return
	}
	defer cursor.Close(context.Background())

	for cursor.Next(context.Background()) {
		var product models.Product
		cursor.Decode(&product)
		products = append(products, product)
	}

	if len(products) == 0 {
		c.JSON(http.StatusOK, gin.H{"status": 200, "data": []models.Product{}})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": 200, "data": products})
}

func (pc *ProductController) GetProduct(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	idParam := c.Param("id")
	fmt.Printf("Fetching product with ID: %s\n", idParam) // Log the ID being fetched

	id, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		fmt.Printf("Invalid product ID: %s, error: %v\n", idParam, err) // Log the error
		c.JSON(http.StatusBadRequest, gin.H{"status": 400, "message": "Invalid product ID"})
		return
	}

	var product models.Product
	err = pc.productCollection.FindOne(ctx, bson.M{"_id": id}).Decode(&product)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			fmt.Printf("Product not found with ID: %s\n", idParam) // Log the error
			c.JSON(http.StatusNotFound, gin.H{"status": 404, "message": "Product not found"})
			return
		}
		fmt.Printf("Error fetching product with ID: %s, error: %v\n", idParam, err) // Log the error
		c.JSON(http.StatusInternalServerError, gin.H{"status": 500, "message": "Error fetching product"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": 200, "message": "Product fetched successfully", "data": product})
}

func (pc *ProductController) CreateManyProducts(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	var products []models.Product
	if err := c.ShouldBindJSON(&products); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": 400, "message": "Invalid request payload", "error": err.Error()})
		return
	}

	now := time.Now()
	var documents []interface{}
	for i := range products {
		products[i].CreatedAt = now
		products[i].UpdatedAt = now
		documents = append(documents, products[i])
	}

	result, err := pc.productCollection.InsertMany(ctx, documents)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": 500, "message": "Error creating products", "error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"status": 201, "message": "Products created successfully", "data": result.InsertedIDs})
}

func (pc *ProductController) UpdateProduct(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID không hợp lệ"})
		return
	}

	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	product.UpdatedAt = time.Now()
	_, err = pc.productCollection.UpdateOne(context.Background(), bson.M{"_id": objID}, bson.M{"$set": product})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi cập nhật sản phẩm"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cập nhật sản phẩm thành công"})
}

func (pc *ProductController) DeleteProduct(c *gin.Context) {
	id := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID không hợp lệ"})
		return
	}

	_, err = pc.productCollection.DeleteOne(context.Background(), bson.M{"_id": objID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi xóa sản phẩm"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Xóa sản phẩm thành công"})
}

func (pc *ProductController) GetProductsByCategory(c *gin.Context) {
	category := c.Param("category")
	var products []models.Product
	cursor, err := pc.productCollection.Find(context.Background(), bson.M{"category": category})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching products by category"})
		return
	}
	defer cursor.Close(context.Background())

	for cursor.Next(context.Background()) {
		var product models.Product
		cursor.Decode(&product)
		products = append(products, product)
	}

	c.JSON(http.StatusOK, gin.H{"status": 200, "data": products})
}

func (pc *ProductController) SearchProducts(c *gin.Context) {
	query := c.Query("q")
	var products []models.Product
	cursor, err := pc.productCollection.Find(context.Background(), bson.M{"$text": bson.M{"$search": query}})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error searching products"})
		return
	}
	defer cursor.Close(context.Background())

	for cursor.Next(context.Background()) {
		var product models.Product
		cursor.Decode(&product)
		products = append(products, product)
	}

	c.JSON(http.StatusOK, gin.H{"status": 200, "data": products})
}

func (pc *ProductController) GetUserProducts(c *gin.Context) {
	userId := c.Param("userId")
	objID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var products []models.Product
	cursor, err := pc.productCollection.Find(context.Background(), bson.M{"userId": objID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching user products"})
		return
	}
	defer cursor.Close(context.Background())

	for cursor.Next(context.Background()) {
		var product models.Product
		cursor.Decode(&product)
		products = append(products, product)
	}

	c.JSON(http.StatusOK, gin.H{"status": 200, "data": products})
}