package utils

import (
	"context"
	"mime/multipart"
	"os"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

var cld *cloudinary.Cloudinary

// InitCloudinary initializes the Cloudinary client
func InitCloudinary() error {
	var err error
	cloudName := os.Getenv("CLOUDINARY_CLOUD_NAME")
	apiKey := os.Getenv("CLOUDINARY_API_KEY")
	apiSecret := os.Getenv("CLOUDINARY_API_SECRET")

	cld, err = cloudinary.NewFromParams(cloudName, apiKey, apiSecret)
	if err != nil {
		return err
	}
	return nil
}

// UploadImage uploads an image file to Cloudinary
func UploadImage(file *multipart.FileHeader) (string, error) {
	// Open the uploaded file
	src, err := file.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	// Upload to Cloudinary
	uploadResult, err := cld.Upload.Upload(
		context.Background(),
		src,
		uploader.UploadParams{
			Folder: "cho2hand", // You can change this folder name
		})
	
	if err != nil {
		return "", err
	}

	return uploadResult.SecureURL, nil
}

// DeleteImage deletes an image from Cloudinary by URL
func DeleteImage(imageURL string) error {
	// Extract public ID from URL
	// This is a simple implementation - you might need to adjust based on your URL structure
	publicID := extractPublicID(imageURL)

	_, err := cld.Upload.Destroy(
		context.Background(),
		uploader.DestroyParams{
			PublicID: publicID,
		})

	return err
}

// extractPublicID extracts the public ID from a Cloudinary URL
func extractPublicID(imageURL string) string {
	// This is a basic implementation
	// You might need to adjust this based on your actual URL structure
	// Example URL: https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/cho2hand/image.jpg
	// In this case, the public ID would be: cho2hand/image
	
	// TODO: Implement proper URL parsing based on your needs
	return "cho2hand/image" // Placeholder implementation
}