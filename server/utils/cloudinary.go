package utils

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"mime/multipart"
	
	"log"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

var cld *cloudinary.Cloudinary

// InitCloudinary initializes the Cloudinary client
func InitCloudinary() error {
	log.Println("Initializing Cloudinary...")

	// Use explicit URL instead of individual params
	url := "cloudinary://488486422352963:bX3Mg2USbhZqZuUCfU5ZFJhOnVc@duzvy56yx"
	var err error
	cld, err = cloudinary.NewFromURL(url)
	if (err != nil) {
		log.Printf("Cloudinary initialization error: %v\n", err)
		return err
	}

	log.Println("Cloudinary initialized successfully")
	return nil
}

// Calculate file hash
func calculateFileHash(file io.Reader) (string, error) {
    hasher := sha256.New()
    if _, err := io.Copy(hasher, file); err != nil {
        return "", err
    }
    return hex.EncodeToString(hasher.Sum(nil)), nil
}

// Helper function to check if hash exists in Redis
func checkImageHashExists(hash string) bool {
    // Check if hash exists in Redis
    _, err := redisClient.Get(ctx, "img:"+hash).Result()
    return err == nil
}

// UploadImage uploads an image file to Cloudinary with better error logging and duplicate detection
func UploadImage(file *multipart.FileHeader) (string, error) {
    // Initialize Cloudinary if needed
    if cld == nil {
        if err := InitCloudinary(); err != nil {
            return "", fmt.Errorf("cloudinary init failed: %v", err)
        }
    }

    // Calculate hash first
    src, err := file.Open()
    if err != nil {
        return "", fmt.Errorf("error opening file: %v", err)
    }
    
    hash, err := calculateFileHash(src)
    if err != nil {
        src.Close()
        return "", fmt.Errorf("error calculating hash: %v", err)
    }
    src.Close()

    // Check Redis cache only if connection exists
    if CheckRedisConnection() {
        if url, err := GetImageCache(hash); err == nil {
            log.Printf("Found existing image in cache with hash %s: %s", hash, url)
            return url, nil
        }
    } else {
        log.Println("Bỏ qua cache do Redis không hoạt động")
    }

    // If not in cache, reopen file and upload
    src, err = file.Open()
    if err != nil {
        return "", fmt.Errorf("error reopening file: %v", err)
    }
    defer src.Close()

    // Create bool variables for upload parameters
    uniqueFilename := false
    overwrite := true

    // Set upload parameters with proper bool pointers
    uploadParams := uploader.UploadParams{
        PublicID:       fmt.Sprintf("cho2hand/%s", hash),
        Folder:         "cho2hand",
        ResourceType:   "auto",
        UniqueFilename: &uniqueFilename,  // Use pointer to bool
        Overwrite:      &overwrite,       // Use pointer to bool
    }

    log.Printf("Starting upload to Cloudinary with hash: %s", hash)
    uploadResult, err := cld.Upload.Upload(context.Background(), src, uploadParams)
    if err != nil {
        return "", fmt.Errorf("cloudinary upload failed: %v", err)
    }

    if uploadResult == nil || uploadResult.SecureURL == "" {
        return "", fmt.Errorf("no URL returned from upload")
    }

    // Cache result only if Redis is available
    if CheckRedisConnection() {
        if err := SetImageCache(hash, uploadResult.SecureURL); err != nil {
            log.Printf("Warning: Failed to cache image: %v", err)
        }
    }

    return uploadResult.SecureURL, nil
}

// UploadImageFromURL uploads an image from a URL to Cloudinary
func UploadImageFromURL(imageURL string) (string, error) {
	ctx := context.Background()

	// Check if Cloudinary client is initialized
	if cld == nil {
		if err := InitCloudinary(); err != nil {
			return "", err
		}
	}

	// Upload to Cloudinary directly from URL
	uploadResult, err := cld.Upload.Upload(
		ctx,
		imageURL,
		uploader.UploadParams{
			Folder: "cho2hand",
		})

	if err != nil {
		return "", err
	}

	return uploadResult.SecureURL, nil
}

// DeleteImage deletes an image from Cloudinary
func DeleteImage() error {
	// Extract public ID from URL
	// This is a simple implementation - you might need to adjust based on your URL structure
	publicID := extractPublicID()

	_, err := cld.Upload.Destroy(
		context.Background(),
		uploader.DestroyParams{
			PublicID: publicID,
		})

	return err
}

// extractPublicID extracts the public ID from a Cloudinary URL
func extractPublicID() string {
	// This is a basic implementation
	// You might need to adjust this based on your actual URL structure
	// Example URL: https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/cho2hand/image.jpg
	// In this case, the public ID would be: cho2hand/image

	// TODO: Implement proper URL parsing based on your needs
	return "cho2hand/image" // Placeholder implementation
}