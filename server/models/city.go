package models

import (
	"context"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type City struct {
	ID         primitive.ObjectID   `bson:"_id,omitempty" json:"_id"`  // Change json tag to _id
	Name       string              `bson:"name" json:"name"`
	Districts  []primitive.ObjectID `bson:"districts,omitempty" json:"-"` // Hide districts from JSON
}

type CityResponse struct {
	ID        string             `json:"id"`
	Name      string            `json:"name"`
}

func (c *City) ToResponse() CityResponse {
	return CityResponse{
		ID:   c.ID.Hex(),
		Name: c.Name,
	}
}

type CityService struct {
	db *mongo.Database
}

func NewCityService(db *mongo.Database) *CityService {
	return &CityService{db: db}
}

func (cs *CityService) CreateCity(city *City) (*City, error) {
	collection := cs.db.Collection("cities")
	result, err := collection.InsertOne(context.Background(), city)
	if err != nil {
		return nil, err
	}
	city.ID = result.InsertedID.(primitive.ObjectID)
	return city, nil
}

// Update GetCities function to properly handle district IDs
func (cs *CityService) GetCities() ([]CityResponse, error) {
    var cities []City
    collection := cs.db.Collection("cities")
    
    cursor, err := collection.Find(context.Background(), bson.M{})
    if err != nil {
        return nil, err
    }
    defer cursor.Close(context.Background())
    
    if err = cursor.All(context.Background(), &cities); err != nil {
        return nil, err
    }

    // Convert to response format
    response := make([]CityResponse, len(cities))
    for i, city := range cities {
        response[i] = city.ToResponse()
    }
    
    return response, nil
}

func (cs *CityService) GetCityWithDistricts(id primitive.ObjectID) (*City, error) {
	var city City
	pipeline := []bson.M{
		{
			"$match": bson.M{"_id": id},
		},
		{
			"$lookup": bson.M{
				"from":         "districts",
				"localField":   "districts",
				"foreignField": "_id",
				"as":          "districts",
			},
		},
	}
	
	cursor, err := cs.db.Collection("cities").Aggregate(context.Background(), pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	if cursor.Next(context.Background()) {
		err = cursor.Decode(&city)
		if err != nil {
			return nil, err
		}
		return &city, nil
	}
	return nil, mongo.ErrNoDocuments
}