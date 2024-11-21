// models/product.go
package models

import (
    "go.mongodb.org/mongo-driver/bson/primitive"
    "time"
)

type Product struct {
    ID                primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
    Name              string             `bson:"name" json:"name" binding:"required"`
    Description       string             `bson:"description" json:"description"`
    Category          string             `bson:"category" json:"category"`
    Price             int                `bson:"price" json:"price"`
    Images            []string           `bson:"images" json:"images"`
    Status            string             `bson:"status" json:"status" binding:"required,oneof=available sold"`
    CreatedAt         time.Time          `bson:"created_at" json:"created_at"`
    UpdatedAt         time.Time          `bson:"updated_at" json:"updated_at"`
    Location          string             `bson:"location" json:"location"`
    UserID            primitive.ObjectID `bson:"user_id" json:"user_id"` // Add UserID field
    PhoneDetailIDs    []primitive.ObjectID `bson:"phoneDetailIds" json:"phoneDetailIds"`
    ImagesMini1       []string           `bson:"imagesmini1" json:"imagesmini1"`
    ImagesMini2       [][]string         `bson:"imagesmini2" json:"imagesmini2"`
    ImagesMini3       []string           `bson:"imagesmini3" json:"imagesmini3"`
    ProductDetailIDs  []primitive.ObjectID `bson:"productDetailIds" json:"productDetailIds"`
    BikeDetailIDs     []primitive.ObjectID `bson:"bikeDetailIds" json:"bikeDetailIds"`
    LaptopDetailIDs   []primitive.ObjectID `bson:"laptopDetailIds" json:"laptopDetailIds"`
    TabletDetailIDs   []primitive.ObjectID `bson:"tabletDetailIds" json:"tabletDetailIds"`
    AudioDetailIDs    []primitive.ObjectID `bson:"audioDetailIds" json:"audioDetailIds"`
    WatchDetailIDs    []primitive.ObjectID `bson:"watchDetailIds" json:"watchDetailIds"`
    CameraDetailIDs   []primitive.ObjectID `bson:"cameraDetailIds" json:"cameraDetailIds"`
    AccessoryDetailIDs []primitive.ObjectID `bson:"accessoryDetailIds" json:"accessoryDetailIds"`
    PCDetailIDs       []primitive.ObjectID `bson:"pcDetailIds" json:"pcDetailIds"`
    MonitorDetailIDs  []primitive.ObjectID `bson:"monitorDetailIds" json:"monitorDetailIds"`
    TVDetailIDs       []primitive.ObjectID `bson:"tvDetailIds" json:"tvDetailIds"`
}