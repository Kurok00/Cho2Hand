package models

import (
	"time"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Admin struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Username  string             `bson:"username" json:"username"`
	Password  string             `bson:"password" json:"password,omitempty"`
	Name      string             `bson:"name" json:"name"`
	Status    string             `bson:"status" json:"status"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at" json:"updated_at"`
}

type AdminLogin struct {
    Username string `json:"username" binding:"required"`
    Password string `json:"password" binding:"required"`
}