package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// BikeDetail represents the details of a bike
type BikeDetail struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	EngineCapacity  string             `bson:"engineCapacity" json:"engineCapacity"`
	Brand           string             `bson:"brand" json:"brand"`
	Color           string             `bson:"color" json:"color"`
	ManufactureYear int                `bson:"manufactureYear" json:"manufactureYear"`
	ProductID       primitive.ObjectID `bson:"productId" json:"productId"`
}