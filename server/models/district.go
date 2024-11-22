package models

import (
	"context"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type District struct {
	ID     primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	Name   string            `bson:"name" json:"name"`
	CityID primitive.ObjectID `bson:"city_id" json:"city_id"`
	City   *City             `bson:"city,omitempty" json:"city,omitempty"`
}

// Add response DTO to handle JSON serialization
type DistrictResponse struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	CityID string `json:"city_id"`
}

type DistrictService struct {
	db *mongo.Database
}

func NewDistrictService(db *mongo.Database) *DistrictService {
	return &DistrictService{db: db}
}

// ToResponse converts District to DistrictResponse
func (d *District) ToResponse() DistrictResponse {
	return DistrictResponse{
		ID:     d.ID.Hex(),
		Name:   d.Name,
		CityID: d.CityID.Hex(),
	}
}

func (ds *DistrictService) CreateDistrict(district *District) (*District, error) {
	collection := ds.db.Collection("districts")
	result, err := collection.InsertOne(context.Background(), district)
	if (err != nil) {
		return nil, err
	}
	district.ID = result.InsertedID.(primitive.ObjectID)
	return district, nil
}

// Update GetDistrictsByCity to handle the new structure
func (ds *DistrictService) GetDistrictsByCity(cityID primitive.ObjectID) ([]DistrictResponse, error) {
    var districts []District
    cursor, err := ds.db.Collection("districts").Find(context.Background(), 
        bson.M{"city_id": cityID})
    if err != nil {
        return nil, err
    }
    defer cursor.Close(context.Background())

    if err = cursor.All(context.Background(), &districts); err != nil {
        return nil, err
    }

    response := make([]DistrictResponse, len(districts))
    for i, district := range districts {
        response[i] = district.ToResponse()
    }

    return response, nil
}

// Add a new method to get districts by IDs
func (ds *DistrictService) GetDistrictsByIDs(ids []primitive.ObjectID) ([]District, error) {
    var districts []District
    cursor, err := ds.db.Collection("districts").Find(context.Background(), 
        bson.M{"_id": bson.M{"$in": ids}})
    if err != nil {
        return nil, err
    }
    defer cursor.Close(context.Background())

    if err = cursor.All(context.Background(), &districts); err != nil {
        return nil, err
    }

    return districts, nil
}