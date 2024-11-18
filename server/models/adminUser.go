package models

import "go.mongodb.org/mongo-driver/bson/primitive"
import "time"

type AdminUser struct {
    ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
    Username  string             `bson:"username" json:"username"`
    Password  string             `bson:"password" json:"password"`
    CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
    UpdatedAt time.Time          `bson:"updatedAt" json:"updatedAt"`
}