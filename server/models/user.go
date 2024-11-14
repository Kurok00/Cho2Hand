package models

import (
    "time"
    "go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
    ID        primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
    Name      string            `bson:"name" json:"name"`
    Email     string            `bson:"email" json:"email"`
    Phone     string            `bson:"phone" json:"phone"`
    Password  string            `bson:"password" json:"-"`
    CreatedAt time.Time         `bson:"created_at" json:"created_at"`
}

type LoginRequest struct {
    Email    string `json:"email"`
    Password string `json:"password"`
}

type RegisterRequest struct {
    Name     string `json:"name"`
    Email    string `json:"email" binding:"required,email"`
    Phone    string `json:"phone" binding:"required"`
    Password string `json:"password" binding:"required,min=6"`
}

type AuthResponse struct {
    Token string      `json:"token"`
    User  interface{} `json:"user"`
}