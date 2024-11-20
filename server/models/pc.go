package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type PC struct {
	Product
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	Brand       string             `json:"brand"`
	Model       string             `json:"model"`
	Processor   string             `json:"processor"`
	RAM         int                `json:"ram"` // in GB
	Storage     int                `json:"storage"` // in GB
	Price       float64            `json:"price"`
}