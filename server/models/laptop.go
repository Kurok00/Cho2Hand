
package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// LaptopDetail represents the details of a laptop
type LaptopDetail struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Memory          string             `bson:"memory" json:"memory"`
	Brand           string             `bson:"brand" json:"brand"`
	Color           string             `bson:"color" json:"color"`
	RAM             string             `bson:"ram" json:"ram"`
	Processor       string             `bson:"processor" json:"processor"`
	ProductID       primitive.ObjectID `bson:"productId" json:"productId"`
}