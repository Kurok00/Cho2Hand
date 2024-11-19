package configs

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Client *mongo.Client

func ConnectMongoDB() (*mongo.Client, error) {
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		log.Fatal("MONGO_URI environment variable is not set")
	}

	clientOptions := options.Client().ApplyURI(mongoURI)

	clientOptions.SetServerAPIOptions(options.ServerAPI(options.ServerAPIVersion1))
	clientOptions.SetTimeout(10 * time.Second)
	clientOptions.SetConnectTimeout(10 * time.Second)

	client, err := mongo.NewClient(clientOptions)
	if err != nil {
		log.Printf("Error creating MongoDB client: %v", err)
		return nil, err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err = client.Connect(ctx)
	if err != nil {
		log.Printf("Error connecting to MongoDB: %v", err)
		return nil, err
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Printf("Error pinging MongoDB: %v", err)
		return nil, err
	}

	log.Println("Connected to MongoDB!")
	Client = client
	return client, nil
}

func GetCollection(collectionName string) *mongo.Collection {
	return Client.Database("Cho2Hand").Collection(collectionName)
}
