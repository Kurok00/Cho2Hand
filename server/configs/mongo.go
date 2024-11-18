package configs

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Client *mongo.Client

func ConnectMongoDB() (*mongo.Client, error) {
	clientOptions := options.Client().ApplyURI("mongodb+srv://anvnt96:asdqwe123@cluster0.bs2jhhq.mongodb.net/Cho2Hand")

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
