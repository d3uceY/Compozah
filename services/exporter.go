package services

import (
	"archive/zip"
	"fmt"
	"io"
	"os"
	"path/filepath"
)

// ProjectExporter handles zipping generated projects for download.
type ProjectExporter struct{}

// ExportToZip creates a zip archive of the generated project directory.
// Returns the path to the created zip file.
func (p *ProjectExporter) ExportToZip(projectDir string) (string, error) {
	zipPath := projectDir + ".zip"

	zipFile, err := os.Create(zipPath)
	if err != nil {
		return "", fmt.Errorf("failed to create zip: %w", err)
	}
	defer zipFile.Close()

	writer := zip.NewWriter(zipFile)
	defer writer.Close()

	baseDir := filepath.Base(projectDir)

	err = filepath.Walk(projectDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Skip the root directory itself.
		if path == projectDir {
			return nil
		}

		relPath, err := filepath.Rel(projectDir, path)
		if err != nil {
			return err
		}

		zipEntryPath := filepath.Join(baseDir, relPath)

		if info.IsDir() {
			_, err := writer.Create(zipEntryPath + "/")
			return err
		}

		file, err := os.Open(path)
		if err != nil {
			return err
		}
		defer file.Close()

		entry, err := writer.Create(zipEntryPath)
		if err != nil {
			return err
		}

		_, err = io.Copy(entry, file)
		return err
	})

	if err != nil {
		return "", fmt.Errorf("failed to walk project dir: %w", err)
	}

	return zipPath, nil
}

// GetProjectSize returns the total size of files in the project directory.
func (p *ProjectExporter) GetProjectSize(projectDir string) (int64, error) {
	var total int64
	err := filepath.Walk(projectDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() {
			total += info.Size()
		}
		return nil
	})
	return total, err
}
