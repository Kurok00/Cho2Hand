// models/product.go
package models

import (
    "go.mongodb.org/mongo-driver/bson/primitive"
    "time"
)

type Product struct {
    ID          primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
    Name        string             `bson:"name" json:"name" binding:"required"`
    Description string             `bson:"description" json:"description"`
    Category    string             `bson:"category" json:"category"`
    Price       int                `bson:"price" json:"price"`
    Images      []string           `bson:"images" json:"images"`
    Status      string             `bson:"status" json:"status" binding:"required,oneof=available sold"`
    CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
    UpdatedAt   time.Time          `bson:"updated_at" json:"updated_at"`
}