package controllers

import (
    "context"
    "encoding/json"
    "net/http"
    "time"
    "cho2hand/models"
    "github.com/gorilla/mux"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/bson/primitive"
    "go.mongodb.org/mongo-driver/mongo"
    "fmt"
    "log"
)

type ProductController struct {
    collection *mongo.Collection
}

type Response struct {
    Status  int         `json:"status"`
    Message string      `json:"message"`
    Data    interface{} `json:"data,omitempty"`
}

func NewProductController(collection *mongo.Collection) *ProductController {
    return &ProductController{collection: collection}
}

func (c *ProductController) GetProducts(w http.ResponseWriter, r *http.Request) {
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    category := r.URL.Query().Get("category")
    filter := bson.M{}
    if category != "" {
        filter["category"] = category
    }

    cursor, err := c.collection.Find(ctx, filter)
    if err != nil {
        sendResponse(w, http.StatusInternalServerError, Response{
            Status:  http.StatusInternalServerError,
            Message: "Error fetching products",
        })
        return
    }
    defer cursor.Close(ctx)

    var products []models.Product
    if err = cursor.All(ctx, &products); err != nil {
        sendResponse(w, http.StatusInternalServerError, Response{
            Status:  http.StatusInternalServerError,
            Message: "Error decoding products",
        })
        return
    }

    sendResponse(w, http.StatusOK, Response{
        Status:  http.StatusOK,
        Message: "Products fetched successfully",
        Data:    products,
    })
}

func (c *ProductController) GetProduct(w http.ResponseWriter, r *http.Request) {
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    params := mux.Vars(r)
    id, err := primitive.ObjectIDFromHex(params["id"])
    if err != nil {
        sendResponse(w, http.StatusBadRequest, Response{
            Status:  http.StatusBadRequest,
            Message: "Invalid product ID",
        })
        return
    }

    var product models.Product
    err = c.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&product)
    if err != nil {
        if err == mongo.ErrNoDocuments {
            sendResponse(w, http.StatusNotFound, Response{
                Status:  http.StatusNotFound,
                Message: "Product not found",
            })
            return
        }
        sendResponse(w, http.StatusInternalServerError, Response{
            Status:  http.StatusInternalServerError,
            Message: "Error fetching product",
        })
        return
    }

    sendResponse(w, http.StatusOK, Response{
        Status:  http.StatusOK,
        Message: "Product fetched successfully",
        Data:    product,
    })
}

func (c *ProductController) CreateProduct(w http.ResponseWriter, r *http.Request) {
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    var product models.Product
    if err := json.NewDecoder(r.Body).Decode(&product); err != nil {
        sendResponse(w, http.StatusBadRequest, Response{
            Status:  http.StatusBadRequest,
            Message: "Invalid request payload",
        })
        return
    }

    product.CreatedAt = time.Now()
    product.UpdatedAt = time.Now()

    result, err := c.collection.InsertOne(ctx, product)
    if err != nil {
        sendResponse(w, http.StatusInternalServerError, Response{
            Status:  http.StatusInternalServerError,
            Message: "Error creating product",
        })
        return
    }

    product.ID = result.InsertedID.(primitive.ObjectID)
    sendResponse(w, http.StatusCreated, Response{
        Status:  http.StatusCreated,
        Message: "Product created successfully",
        Data:    product,
    })
}

func (c *ProductController) CreateManyProducts(w http.ResponseWriter, r *http.Request) {
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    var products []models.Product
    if err := json.NewDecoder(r.Body).Decode(&products); err != nil {
        log.Printf("Error decoding request body: %v", err)
        sendResponse(w, http.StatusBadRequest, Response{
            Status:  http.StatusBadRequest,
            Message: "Invalid request payload",
        })
        return
    }

    // Log received products
    log.Printf("Received %d products", len(products))

    now := time.Now()
    var documents []interface{}
    for i := range products {
        products[i].CreatedAt = now
        products[i].UpdatedAt = now
        documents = append(documents, products[i])
    }

    result, err := c.collection.InsertMany(ctx, documents)
    if err != nil {
        log.Printf("Error inserting products: %v", err)
        sendResponse(w, http.StatusInternalServerError, Response{
            Status:  http.StatusInternalServerError,
            Message: "Error creating products",
        })
        return
    }

    log.Printf("Successfully inserted %d products", len(result.InsertedIDs))
    sendResponse(w, http.StatusCreated, Response{
        Status:  http.StatusCreated,
        Message: fmt.Sprintf("Successfully created %d products", len(result.InsertedIDs)),
        Data:    result.InsertedIDs,
    })
}

func (c *ProductController) UpdateProduct(w http.ResponseWriter, r *http.Request) {
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    params := mux.Vars(r)
    id, err := primitive.ObjectIDFromHex(params["id"])
    if err != nil {
        sendResponse(w, http.StatusBadRequest, Response{
            Status:  http.StatusBadRequest,
            Message: "Invalid product ID",
        })
        return
    }

    var product models.Product
    if err := json.NewDecoder(r.Body).Decode(&product); err != nil {
        sendResponse(w, http.StatusBadRequest, Response{
            Status:  http.StatusBadRequest,
            Message: "Invalid request payload",
        })
        return
    }

    product.UpdatedAt = time.Now()

    filter := bson.M{"_id": id}
    update := bson.M{"$set": product}

    result, err := c.collection.UpdateOne(ctx, filter, update)
    if err != nil {
        sendResponse(w, http.StatusInternalServerError, Response{
            Status:  http.StatusInternalServerError,
            Message: "Error updating product",
        })
        return
    }

    if result.MatchedCount == 0 {
        sendResponse(w, http.StatusNotFound, Response{
            Status:  http.StatusNotFound,
            Message: "Product not found",
        })
        return
    }

    sendResponse(w, http.StatusOK, Response{
        Status:  http.StatusOK,
        Message: "Product updated successfully",
    })
}

func (c *ProductController) DeleteProduct(w http.ResponseWriter, r *http.Request) {
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    params := mux.Vars(r)
    id, err := primitive.ObjectIDFromHex(params["id"])
    if err != nil {
        sendResponse(w, http.StatusBadRequest, Response{
            Status:  http.StatusBadRequest,
            Message: "Invalid product ID",
        })
        return
    }

    result, err := c.collection.DeleteOne(ctx, bson.M{"_id": id})
    if err != nil {
        sendResponse(w, http.StatusInternalServerError, Response{
            Status:  http.StatusInternalServerError,
            Message: "Error deleting product",
        })
        return
    }

    if result.DeletedCount == 0 {
        sendResponse(w, http.StatusNotFound, Response{
            Status:  http.StatusNotFound,
            Message: "Product not found",
        })
        return
    }

    sendResponse(w, http.StatusOK, Response{
        Status:  http.StatusOK,
        Message: "Product deleted successfully",
    })
}


func sendResponse(w http.ResponseWriter, statusCode int, response Response) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(statusCode)
    json.NewEncoder(w).Encode(response)
}
