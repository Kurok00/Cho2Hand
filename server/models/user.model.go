
package models

import (
    "time"
    "go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
    ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
    Name      string            `bson:"name" json:"name" validate:"required"`
    Email     string            `bson:"email" json:"email" validate:"required,email"`
    Phone     string            `bson:"phone" json:"phone" validate:"required"`
    Password  string            `bson:"password" json:"-" validate:"required,min=6"`
    CreatedAt time.Time         `bson:"created_at" json:"created_at"`
}