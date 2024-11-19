
package models

import (
	"context"
	"time"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type AdminService struct {
	db *mongo.Database
}



func NewAdminService(db *mongo.Database) *AdminService {
	return &AdminService{db: db}
}

func (as *AdminService) Collection() *mongo.Collection {
	return as.db.Collection("admins")
}

func (as *AdminService) Create(admin *Admin) error {
	admin.CreatedAt = time.Now()
	admin.UpdatedAt = time.Now()
	_, err := as.Collection().InsertOne(context.Background(), admin)
	return err
}

func (as *AdminService) GetByID(id primitive.ObjectID) (*Admin, error) {
	var admin Admin
	err := as.Collection().FindOne(context.Background(), bson.M{"_id": id}).Decode(&admin)
	if err != nil {
		return nil, err
	}
	return &admin, nil
}

func (as *AdminService) Update(admin *Admin) error {
	admin.UpdatedAt = time.Now()
	_, err := as.Collection().UpdateOne(
		context.Background(),
		bson.M{"_id": admin.ID},
		bson.M{"$set": admin},
	)
	return err
}

func (as *AdminService) Delete(id primitive.ObjectID) error {
	_, err := as.Collection().DeleteOne(context.Background(), bson.M{"_id": id})
	return err
}