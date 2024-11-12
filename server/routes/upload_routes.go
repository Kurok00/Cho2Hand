package routes

import (
    "cho2hand/utils"
    "encoding/json"
    "net/http"
    "github.com/gorilla/mux"
)

func UploadRoute(router *mux.Router) {
    router.HandleFunc("/upload", func(w http.ResponseWriter, r *http.Request) {
        // Parse the multipart form
        if err := r.ParseMultipartForm(10 << 20); err != nil {
            http.Error(w, "Unable to parse form", http.StatusBadRequest)
            return
        }

        // Get the file from form
        file, handler, err := r.FormFile("image")
        if err != nil {
            json.NewEncoder(w).Encode(map[string]string{"error": "No file uploaded"})
            return
        }
        defer file.Close()

        // Upload to Cloudinary
        imageURL, err := utils.UploadImage(handler)
        if err != nil {
            w.WriteHeader(http.StatusInternalServerError)
            json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
            return
        }

        w.WriteHeader(http.StatusOK)
        json.NewEncoder(w).Encode(map[string]string{"url": imageURL})
    }).Methods("POST")
}