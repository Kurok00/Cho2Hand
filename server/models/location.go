package models

import (
    "context"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/bson/primitive"
    "go.mongodb.org/mongo-driver/mongo"
)

type Location struct {
    ID          primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
    CityID      primitive.ObjectID `bson:"city_id" json:"city_id"`
    DistrictID  primitive.ObjectID `bson:"district_id" json:"district_id"`
    City        *City             `bson:"city,omitempty" json:"city,omitempty"`
    District    *District         `bson:"district,omitempty" json:"district,omitempty"`
}

type LocationService struct {
    db *mongo.Database
}

func NewLocationService(db *mongo.Database) *LocationService {
    return &LocationService{db: db}
}

func (ls *LocationService) CreateLocation(location *Location) (*Location, error) {
    collection := ls.db.Collection("locations")
    result, err := collection.InsertOne(context.Background(), location)
    if err != nil {
        return nil, err
    }
    location.ID = result.InsertedID.(primitive.ObjectID)
    return location, nil
}

func (ls *LocationService) GetLocationByID(id primitive.ObjectID) (*Location, error) {
    var location Location
    collection := ls.db.Collection("locations")
    err := collection.FindOne(context.Background(), bson.M{"_id": id}).Decode(&location)
    if err != nil {
        return nil, err
    }
    return &location, nil
}

func (ls *LocationService) GetLocations() ([]Location, error) {
    var locations []Location
    collection := ls.db.Collection("locations")
    cursor, err := collection.Find(context.Background(), bson.M{})
    if err != nil {
        return nil, err
    }
    defer cursor.Close(context.Background())
    
    err = cursor.All(context.Background(), &locations)
    if err != nil {
        return nil, err
    }
    return locations, nil
}

func (ls *LocationService) GetLocationWithDetails(id primitive.ObjectID) (*Location, error) {
    var location Location
    collection := ls.db.Collection("locations")
    
    pipeline := []bson.M{
        {"$match": bson.M{"_id": id}},
        {"$lookup": bson.M{
            "from": "cities",
            "localField": "city_id",
            "foreignField": "_id",
            "as": "city",
        }},
        {"$lookup": bson.M{
            "from": "districts",
            "localField": "district_id",
            "foreignField": "_id",
            "as": "district",
        }},
        {"$unwind": "$city"},
        {"$unwind": "$district"},
    }
    
    cursor, err := collection.Aggregate(context.Background(), pipeline)
    if err != nil {
        return nil, err
    }
    defer cursor.Close(context.Background())

    if cursor.Next(context.Background()) {
        err = cursor.Decode(&location)
        if err != nil {
            return nil, err
        }
        return &location, nil
    }
    return nil, mongo.ErrNoDocuments
}

// CreateLocationForUser creates a new location for a user during registration
func (ls *LocationService) CreateLocationForUser(cityID, districtID string) (*Location, error) {
    cityObjID, err := primitive.ObjectIDFromHex(cityID)
    if err != nil {
        return nil, err
    }

    districtObjID, err := primitive.ObjectIDFromHex(districtID)
    if err != nil {
        return nil, err
    }

    location := &Location{
        ID:         primitive.NewObjectID(),
        CityID:     cityObjID,
        DistrictID: districtObjID,
    }

    result, err := ls.db.Collection("locations").InsertOne(context.Background(), location)
    if err != nil {
        return nil, err
    }
    location.ID = result.InsertedID.(primitive.ObjectID)
    return location, nil
}

// Thêm phương thức mới để lấy location với thông tin city và district đầy đủ
func (ls *LocationService) GetLocationWithFullDetails(id primitive.ObjectID) (*Location, error) {
    pipeline := []bson.M{
        {
            "$match": bson.M{"_id": id},
        },
        {
            "$lookup": bson.M{
                "from": "cities",
                "let": bson.M{"cityId": "$city_id"},
                "pipeline": []bson.M{
                    {
                        "$match": bson.M{
                            "$expr": bson.M{"$eq": []string{"$_id", "$$cityId"}},
                        },
                    },
                    {
                        "$lookup": bson.M{
                            "from": "districts",
                            "localField": "districts",
                            "foreignField": "_id",
                            "as": "district_details",
                        },
                    },
                },
                "as": "city_details",
            },
        },
        {
            "$unwind": bson.M{
                "path": "$city_details",
                "preserveNullAndEmptyArrays": true,
            },
        },
    }

    var location Location
    cursor, err := ls.db.Collection("locations").Aggregate(context.Background(), pipeline)
    if err != nil {
        return nil, err
    }
    defer cursor.Close(context.Background())

    if cursor.Next(context.Background()) {
        err = cursor.Decode(&location)
        if err != nil {
            return nil, err
        }
        return &location, nil
    }
    return nil, mongo.ErrNoDocuments
}

// GetLocationDetailsByUserID lấy thông tin location của user bao gồm city và district
func (ls *LocationService) GetLocationDetailsByUserID(userID primitive.ObjectID) (*Location, error) {
    var user User
    err := ls.db.Collection("users").FindOne(context.Background(), bson.M{"_id": userID}).Decode(&user)
    if (err != nil) {
        return nil, err
    }

    pipeline := []bson.M{
        {
            "$match": bson.M{"_id": user.LocationID},
        },
        {
            "$lookup": bson.M{
                "from":         "cities",
                "localField":   "city_id", 
                "foreignField": "_id",
                "as":          "city",
            },
        },
        {
            "$lookup": bson.M{
                "from":         "districts", 
                "localField":   "district_id",
                "foreignField": "_id",
                "as":          "district",
            },
        },
        {
            "$unwind": "$city",
        },
        {
            "$unwind": "$district", 
        },
    }

    var location Location
    cursor, err := ls.db.Collection("locations").Aggregate(context.Background(), pipeline)
    if err != nil {
        return nil, err
    }
    defer cursor.Close(context.Background())

    if cursor.Next(context.Background()) {
        err = cursor.Decode(&location)
        if err != nil {
            return nil, err
        }
        return &location, nil
    }
    return nil, mongo.ErrNoDocuments
}

// Thêm response struct để xử lý JSON
type LocationResponse struct {
    ID          string `json:"id"`
    CityID      string `json:"city_id"`
    DistrictID  string `json:"district_id"`
    CityName    string `json:"city_name,omitempty"`
    DistrictName string `json:"district_name,omitempty"`
}

// Thêm method chuyển đổi Location sang LocationResponse
func (l *Location) ToResponse() LocationResponse {
    return LocationResponse{
        ID:          l.ID.Hex(),
        CityID:      l.CityID.Hex(),
        DistrictID:  l.DistrictID.Hex(),
        CityName:    l.City.Name,
        DistrictName: l.District.Name,
    }
}