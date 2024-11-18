// models/product.go
package models

import (
    "go.mongodb.org/mongo-driver/bson/primitive"
    "time"
)

type Product struct {
    ID          primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
    Name        string             `bson:"name" json:"name" binding:"required"`
    Description string             `bson:"description" json:"description" binding:"required"`
    Category    string             `bson:"category" json:"category" binding:"required"`
    Price       float64            `bson:"price" json:"price" binding:"required"`
    Images      []string           `bson:"images" json:"images" binding:"required"`
    LocationID  primitive.ObjectID `bson:"locationId" json:"locationId" binding:"required"`
    UserID      primitive.ObjectID `bson:"userId" json:"userId" binding:"required"`
    Status      string             `bson:"status" json:"status" binding:"required"`
    CreatedAt   time.Time          `bson:"createdAt" json:"createdAt"`
    UpdatedAt   time.Time          `bson:"updatedAt" json:"updatedAt"`
}