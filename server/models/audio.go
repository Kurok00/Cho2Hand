
package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// AudioDetail represents the details of an audio device
type AudioDetail struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Brand           string             `bson:"brand" json:"brand"`
	Model           string             `bson:"model" json:"model"`
	Type            string             `bson:"type" json:"type"`
	Color           string             `bson:"color" json:"color"`
	ProductID       primitive.ObjectID `bson:"productId" json:"productId"`
}