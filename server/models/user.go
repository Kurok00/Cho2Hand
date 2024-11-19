package models

import (
	"context"
	"time"
	"go.mongodb.org/mongo-driver/bson" // Add this import
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type User struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Username  string             `bson:"username" json:"username"` // Add Username field
	Name      string             `bson:"name" json:"name"`
	Email     string             `bson:"email" json:"email"`
	Phone     string             `bson:"phone" json:"phone"`
	Password  string             `bson:"password" json:"password,omitempty"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at" json:"updated_at"`
}

type Login struct {
	EmailOrPhone string `json:"emailOrPhone"`
	Password     string `json:"password"`
}

type UserService struct {
	db *mongo.Database
}

func NewUserService(db *mongo.Database) *UserService {
	return &UserService{db: db}
}

func (us *UserService) GetUserPassword(id primitive.ObjectID) (string, error) {
	var user User
	collection := us.db.Collection("users")
	err := collection.FindOne(context.Background(), bson.M{"_id": id}).Decode(&user)
	if err != nil {
		return "", err
	}
	return user.Password, nil
}

func (us *UserService) GetByID(id primitive.ObjectID) (*User, error) {
	var user User
	collection := us.db.Collection("users")
	err := collection.FindOne(context.Background(), bson.M{"_id": id}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}
