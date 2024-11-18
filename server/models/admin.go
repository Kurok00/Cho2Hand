package models

import (
    "time"
    "go.mongodb.org/mongo-driver/bson/primitive"
)

type Admin struct {
    ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
    Username  string             `bson:"username" json:"username" binding:"required"`
    Password  string             `bson:"password" json:"password" binding:"required"`
    Name      string             `bson:"name" json:"name" binding:"required"`
    CreatedAt time.Time          `bson:"created_at" json:"created_at"`
}

type AdminLogin struct {
    Username string `json:"username" binding:"required"`
    Password string `json:"password" binding:"required"`
}