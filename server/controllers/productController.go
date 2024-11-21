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
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Set timestamps
    location, _ := time.LoadLocation("Asia/Bangkok")
    now := time.Now().In(location)
    product.CreatedAt = now
    product.UpdatedAt = now

    result, err := pc.productCollection.InsertOne(context.Background(), product)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi tạo sản phẩm"})
        return
    }
    c.JSON(http.StatusCreated, gin.H{"id": result.InsertedID})
}

func (pc *ProductController) GetProducts(c *gin.Context) {
    status := c.Query("status") // Get status from query parameter
    filter := bson.M{}
    if (status != "") {
        filter["status"] = status
    }

    cursor, err := pc.productCollection.Find(context.Background(), filter)
    if (err != nil) {
        log.Printf("Error fetching products: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi lấy danh sách sản phẩm"})
        return
    }
    defer cursor.Close(context.Background())

    var products []models.Product // Initialize products slice
    location, _ := time.LoadLocation("Asia/Bangkok")

    for cursor.Next(context.Background()) {
        var product models.Product
        if err := cursor.Decode(&product); err != nil { // Add error handling for Decode
            log.Printf("Error decoding product: %v", err)
            continue
        }
        // Convert times to GMT+7
        product.CreatedAt = product.CreatedAt.In(location)
        product.UpdatedAt = product.UpdatedAt.In(location)
        products = append(products, product)
    }

    if err := cursor.Err(); err != nil { // Add cursor error checking
        log.Printf("Cursor error: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi đọc dữ liệu sản phẩm"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"status": 200, "data": products})
}

func (pc *ProductController) GetProduct(c *gin.Context) {
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    idParam := c.Param("id")
    fmt.Printf("Fetching product with ID: %s\n", idParam)

    id, err := primitive.ObjectIDFromHex(idParam)
    if err != nil {
        fmt.Printf("Invalid product ID: %s, error: %v\n", idParam, err)
        c.JSON(http.StatusBadRequest, gin.H{"status": 400, "message": "Invalid product ID"})
        return
    }

    var product models.Product
    err = pc.productCollection.FindOne(ctx, bson.M{"_id": id}).Decode(&product)
    if err != nil {
        if err == mongo.ErrNoDocuments {
            fmt.Printf("Product not found with ID: %s\n", idParam)
            c.JSON(http.StatusNotFound, gin.H{"status": 404, "message": "Product not found"})
            return
        }
        fmt.Printf("Error fetching product with ID: %s, error: %v\n", idParam, err)
        c.JSON(http.StatusInternalServerError, gin.H{"status": 500, "message": "Error fetching product"})
        return
    }

    // Log the fetched product fields
    log.Println("Fetched product:", product)
    log.Println("userId:", product.UserID) // Log userId
    log.Println("imagesmini1:", product.ImagesMini1)
    log.Println("imagesmini2:", product.ImagesMini2)
    log.Println("imagesmini3:", product.ImagesMini3)

    // Convert times to GMT+7
    location, _ := time.LoadLocation("Asia/Bangkok")
    product.CreatedAt = product.CreatedAt.In(location)
    product.UpdatedAt = product.UpdatedAt.In(location)

    c.JSON(http.StatusOK, gin.H{"status": 200, "message": "Product fetched successfully", "data": product})
}

func (pc *ProductController) CreateManyProducts(c *gin.Context) {
    log.Println("CreateManyProducts endpoint called") // Add this line
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    var products []models.Product
    if err := c.ShouldBindJSON(&products); err != nil {
        log.Printf("Error binding JSON: %v", err) // Add this line
        c.JSON(http.StatusBadRequest, gin.H{"status": 400, "message": "Invalid request payload", "error": err.Error()})
        return
    }

    // Set CreatedAt and UpdatedAt to GMT+7
    location, _ := time.LoadLocation("Asia/Bangkok")
    now := time.Now().In(location)
    var documents []interface{}
    for i := range products {
        products[i].CreatedAt = now
        products[i].UpdatedAt = now
        documents = append(documents, products[i])
    }

    result, err := pc.productCollection.InsertMany(ctx, documents)
    if err != nil {
        log.Printf("Error inserting documents: %v", err) // Add this line
        c.JSON(http.StatusInternalServerError, gin.H{"status": 500, "message": "Error creating products", "error": err.Error()})
        return
    }

    log.Println("Products created successfully") // Add this line
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

    // Set UpdatedAt to GMT+7
    location, _ := time.LoadLocation("Asia/Bangkok")
    product.UpdatedAt = time.Now().In(location)

    _, err = pc.productCollection.UpdateOne(context.Background(), bson.M{"_id": objID}, bson.M{"$set": product})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi cập nhật sản phẩm"})
        return
    }
    c.JSON(http.StatusOK, gin.H{"message": "Cập nhật sản phẩm thành công"})
}

func (pc *ProductController) UpdateProductStatus(c *gin.Context) {
    id := c.Param("id")
    log.Printf("Attempting to update status for product ID: %s", id)
    
    objID, err := primitive.ObjectIDFromHex(id)
    if err != nil {
        log.Printf("Invalid ID format: %v", err)
        c.JSON(http.StatusBadRequest, gin.H{"error": "ID không hợp lệ"})
        return
    }

    var statusUpdate struct {
        Status string `json:"status" binding:"required"`
    }
    if err := c.ShouldBindJSON(&statusUpdate); err != nil {
        log.Printf("Invalid request body: %v", err)
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Validate status
    if statusUpdate.Status != "available" && statusUpdate.Status != "sold" {
        log.Printf("Invalid status value: %s", statusUpdate.Status)
        c.JSON(http.StatusBadRequest, gin.H{"error": "Trạng thái không hợp lệ"})
        return
    }

    // Update product status
    location, _ := time.LoadLocation("Asia/Bangkok")
    update := bson.M{
        "$set": bson.M{
            "status":     statusUpdate.Status,
            "updated_at": time.Now().In(location),
        },
    }

    result, err := pc.productCollection.UpdateOne(context.Background(), bson.M{"_id": objID}, update)
    if err != nil {
        log.Printf("Database error: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi cập nhật trạng thái sản phẩm"})
        return
    }

    if result.ModifiedCount == 0 {
        log.Printf("No document found with ID: %s", id)
        c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy sản phẩm"})
        return
    }

    log.Printf("Successfully updated status for product ID: %s", id)
    c.JSON(http.StatusOK, gin.H{
        "message": "Cập nhật trạng thái thành công",
        "status": statusUpdate.Status,
    })
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

    location, _ := time.LoadLocation("Asia/Bangkok")
    for cursor.Next(context.Background()) {
        var product models.Product
        cursor.Decode(&product)
        // Convert times to GMT+7
        product.CreatedAt = product.CreatedAt.In(location)
        product.UpdatedAt = product.UpdatedAt.In(location)
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

    location, _ := time.LoadLocation("Asia/Bangkok")
    for cursor.Next(context.Background()) {
        var product models.Product
        cursor.Decode(&product)
        // Convert times to GMT+7
        product.CreatedAt = product.CreatedAt.In(location)
        product.UpdatedAt = product.UpdatedAt.In(location)
        products = append(products, product)
    }

    c.JSON(http.StatusOK, gin.H{"status": 200, "data": products})
}

func (pc *ProductController) GetUserProducts(c *gin.Context) {
    // Since we removed UserID, this method should be updated or removed
    c.JSON(http.StatusOK, gin.H{"status": 200, "data": []models.Product{}})
}

func (pc *ProductController) GetProductByID(c *gin.Context) {
    id := c.Param("id")
    var product models.Product

    objID, err := primitive.ObjectIDFromHex(id)
    if err != nil {
        log.Printf("Invalid product ID: %v\n", err)
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
        return
    }

    if err := pc.productCollection.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&product); err != nil {
        log.Printf("Product not found: %v\n", err)
        c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
        return
    }

    log.Printf("Product found: %v\n", product)
    c.JSON(http.StatusOK, gin.H{"data": product})
}

func (pc *ProductController) GetProductWithPhoneDetails(c *gin.Context) {
    productID := c.Param("id")
    objID, err := primitive.ObjectIDFromHex(productID)
    if err != nil {
        log.Printf("Invalid product ID: %v\n", err)
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
        return
    }

    var product models.Product
    err = pc.productCollection.FindOne(context.TODO(), bson.M{"_id": objID}).Decode(&product)
    if err != nil {
        if err == mongo.ErrNoDocuments {
            log.Printf("Product not found: %v\n", err)
            c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
            return
        }
        log.Printf("Error fetching product: %v\n", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching product"})
        return
    }

    log.Printf("Fetched product: %+v\n", product)

    if product.PhoneDetailIDs == nil || len(product.PhoneDetailIDs) == 0 {
        log.Printf("No phone details found for product ID: %s\n", productID)
        c.JSON(http.StatusOK, gin.H{
            "product":      product,
            "phoneDetails": []models.PhoneDetail{},
        })
        return
    }

    var phoneDetails []models.PhoneDetail
    phoneDetailCollection := pc.productCollection.Database().Collection("phone_details")
    filter := bson.M{"_id": bson.M{"$in": product.PhoneDetailIDs}}
    cursor, err := phoneDetailCollection.Find(context.TODO(), filter)
    if err != nil {
        log.Printf("Error fetching phone details: %v\n", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching phone details"})
        return
    }
    if err = cursor.All(context.TODO(), &phoneDetails); err != nil {
        log.Printf("Error decoding phone details: %v\n", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding phone details"})
        return
    }

    log.Printf("Successfully fetched phone details for product ID: %s\n", productID)
    for _, detail := range phoneDetails {
        log.Printf("Phone detail: %+v\n", detail)
    }
    c.JSON(http.StatusOK, gin.H{
        "product":      product,
        "phoneDetails": phoneDetails,
    })
}
// CreateProductWithPhoneDetails

func (pc *ProductController) CreateProductWithPhoneDetails(c *gin.Context) {
    var request struct {
        Product     models.Product     `json:"product" binding:"required"`
        PhoneDetails []models.PhoneDetail `json:"phoneDetails"`
    }

    if err := c.ShouldBindJSON(&request); err != nil {
        log.Printf("Error binding JSON: %v", err)
        c.JSON(http.StatusBadRequest, gin.H{
            "error": "Invalid request payload",
            "details": err.Error(),
        })
        return
    }

    // Validate price
    if request.Product.Price <= 0 {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": "Price must be a positive number",
        })
        return
    }

    // Bắt đầu một phiên giao dịch MongoDB
    session, err := pc.productCollection.Database().Client().StartSession()
    if err != nil {
        log.Printf("Error starting session: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Error starting database session"})
        return
    }
    defer session.EndSession(context.Background())

    // Thực hiện các thao tác trong transaction
    callback := func(sessionContext mongo.SessionContext) error {
        // 1. Tạo product trước
        location, _ := time.LoadLocation("Asia/Bangkok")
        now := time.Now().In(location)
        request.Product.CreatedAt = now
        request.Product.UpdatedAt = now
        request.Product.ID = primitive.NewObjectID()

        // 2. Tạo và liên kết phone details
        var phoneDetailIDs []primitive.ObjectID
        phoneDetailCollection := pc.productCollection.Database().Collection("phone_details")
        
        for i := range request.PhoneDetails {
            detailID := primitive.NewObjectID()
            phoneDetailIDs = append(phoneDetailIDs, detailID)
            
            // Thiết lập ID cho chi tiết điện thoại và liên kết với product
            request.PhoneDetails[i].ID = detailID
            request.PhoneDetails[i].ProductID = request.Product.ID
        }

        // Cập nhật danh sách ID chi tiết điện thoại vào product
        request.Product.PhoneDetailIDs = phoneDetailIDs

        // 3. Lưu product
        if _, err := pc.productCollection.InsertOne(sessionContext, request.Product); err != nil {
            log.Printf("Error inserting product: %v", err)
            return err
        }

        // 4. Lưu tất cả phone details
        var phoneDetailsInterface []interface{}
        for _, detail := range request.PhoneDetails {
            phoneDetailsInterface = append(phoneDetailsInterface, detail)
        }
        
        if len(phoneDetailsInterface) > 0 {
            if _, err := phoneDetailCollection.InsertMany(sessionContext, phoneDetailsInterface); err != nil {
                log.Printf("Error inserting phone details: %v", err)
                return err
            }
        }

        return nil
    }

    // Thực thi transaction
    if err := mongo.WithSession(context.Background(), session, func(sc mongo.SessionContext) error {
        return callback(sc)
    }); err != nil {
        log.Printf("Transaction failed: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating product with phone details"})
        return
    }

    // Trả về kết quả thành công
    c.JSON(http.StatusCreated, gin.H{
        "message": "Product and phone details created successfully",
        "productId": request.Product.ID,
        "phoneDetailIds": request.Product.PhoneDetailIDs,
    })
}