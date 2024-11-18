
package models

import (
    "go.mongodb.org/mongo-driver/bson/primitive"
)

type Counter struct {
    ID    primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
    Name  string             `bson:"name" json:"name"`
    Value int                `bson:"value" json:"value"`
}