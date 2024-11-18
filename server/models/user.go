package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type User struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	Username   string             `bson:"username" json:"username"`
	Password   string             `bson:"password" json:"password"`
	Email      string             `bson:"email" json:"email"`
	Phone      string             `bson:"phone" json:"phone"`
	Name       string             `bson:"name" json:"name"` // Add this line
	LocationID primitive.ObjectID `bson:"locationId,omitempty" json:"locationId"`
	CreatedAt  int64              `bson:"createdAt" json:"createdAt"`
	UpdatedAt  int64              `bson:"updatedAt" json:"updatedAt"`
}

type Login struct {
    EmailOrPhone string `json:"emailOrPhone"`
    Password     string `json:"password"`
}
