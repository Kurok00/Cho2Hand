package models

import (
	"context"
	"time"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type User struct {
	ID          primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
	Username    string               `bson:"username" json:"username"`
	Name        string               `bson:"name" json:"name"`
	Email       string               `bson:"email" json:"email"`
	Phone       string               `bson:"phone" json:"phone"`
	Password    string               `bson:"password" json:"password,omitempty"`
	LocationID  primitive.ObjectID   `bson:"location_id" json:"location_id"`
	Location    *Location            `bson:"location,omitempty" json:"location,omitempty"`
	CreatedAt   time.Time            `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time            `bson:"updated_at" json:"updated_at"`
	Products    []primitive.ObjectID `bson:"products" json:"products"`
}

type Login struct {
	Username string `json:"username"`
	Phone    string `json:"phone,omitempty"`
	Password string `json:"password"`
}

type UserService struct {
	db              *mongo.Database
	locationService *LocationService
}

func NewUserService(db *mongo.Database) *UserService {
	return &UserService{
		db:              db,
		locationService: NewLocationService(db),
	}
}

// CreateUserWithLocation creates a new user with associated location
func (us *UserService) CreateUserWithLocation(user *User, cityID, districtID string) error {
	// Create location first
	location, err := us.locationService.CreateLocationForUser(cityID, districtID)
	if err != nil {
		return err
	}

	// Set the location ID in user and ensure timestamps are set
	user.LocationID = location.ID
	if user.CreatedAt.IsZero() {
		user.CreatedAt = time.Now()
	}
	if user.UpdatedAt.IsZero() {
		user.UpdatedAt = time.Now()
	}
	if user.Products == nil {
		user.Products = make([]primitive.ObjectID, 0)
	}

	// Insert user with location ID
	collection := us.db.Collection("users")
	result, err := collection.InsertOne(context.Background(), user)
	if err != nil {
		return err
	}
	user.ID = result.InsertedID.(primitive.ObjectID)
	return nil
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

func (us *UserService) GetByIDWithLocation(id primitive.ObjectID) (*User, error) {
	var user User
	pipeline := []bson.M{
		{"$match": bson.M{"_id": id}},
		{"$lookup": bson.M{
			"from": "locations",
			"localField": "location_id",
			"foreignField": "_id",
			"as": "location",
		}},
		{"$unwind": "$location"},
	}

	cursor, err := us.db.Collection("users").Aggregate(context.Background(), pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	if cursor.Next(context.Background()) {
		err = cursor.Decode(&user)
		if err != nil {
			return nil, err
		}
		return &user, nil
	}
	return nil, mongo.ErrNoDocuments
}

func (us *UserService) GetByUsername(username string) (*User, error) {
	var user User
	collection := us.db.Collection("users")
	err := collection.FindOne(context.Background(), bson.M{"username": username}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (us *UserService) GetByPhone(phone string) (*User, error) {
	var user User
	collection := us.db.Collection("users")
	err := collection.FindOne(context.Background(), bson.M{"phone": phone}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}
