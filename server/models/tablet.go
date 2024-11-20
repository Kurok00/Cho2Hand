
package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// TabletDetail represents the details of a tablet
type TabletDetail struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Brand           string             `bson:"brand" json:"brand"`
	Model           string             `bson:"model" json:"model"`
	Color           string             `bson:"color" json:"color"`
	Storage         string             `bson:"storage" json:"storage"`
	RAM             string             `bson:"ram" json:"ram"`
	ProductID       primitive.ObjectID `bson:"productId" json:"productId"`
}