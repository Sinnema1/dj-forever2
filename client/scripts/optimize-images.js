import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function optimizeImage(inputPath, outputDir) {
  const fileName = path.basename(inputPath, path.extname(inputPath));
  const outputBase = path.join(outputDir, fileName);

  console.log(`Optimizing ${inputPath}...`);

  try {
    // Create optimized directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Get original file size
    const originalStats = fs.statSync(inputPath);
    console.log(
      `Original size: ${(originalStats.size / 1024 / 1024).toFixed(2)}MB`
    );

    // Generate multiple sizes and formats
    const sizes = [
      { width: 400, suffix: "-small" },
      { width: 800, suffix: "-medium" },
      { width: 1200, suffix: "-large" },
      { width: 1920, suffix: "-xl" },
    ];

    for (const size of sizes) {
      // JPEG version (80% quality)
      const jpegPath = `${outputBase}${size.suffix}.jpeg`;
      await sharp(inputPath)
        .resize(size.width, null, {
          withoutEnlargement: true,
          fit: "inside",
        })
        .jpeg({ quality: 80, progressive: true })
        .toFile(jpegPath);

      const jpegStats = fs.statSync(jpegPath);
      console.log(
        `  ${size.suffix} JPEG: ${(jpegStats.size / 1024).toFixed(0)}KB`
      );

      // WebP version (80% quality)
      const webpPath = `${outputBase}${size.suffix}.webp`;
      await sharp(inputPath)
        .resize(size.width, null, {
          withoutEnlargement: true,
          fit: "inside",
        })
        .webp({ quality: 80 })
        .toFile(webpPath);

      const webpStats = fs.statSync(webpPath);
      console.log(
        `  ${size.suffix} WebP: ${(webpStats.size / 1024).toFixed(0)}KB`
      );
    }

    console.log(`✅ Optimized ${fileName} successfully!\n`);
  } catch (error) {
    console.error(`❌ Failed to optimize ${inputPath}:`, error.message);
  }
}

async function main() {
  const imagesDir = path.join(__dirname, "../src/assets/images");
  const outputDir = path.join(imagesDir, "optimized");

  // Find all large images (> 500KB)
  const findLargeImages = (dir) => {
    const files = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);

      if (item.isDirectory() && item.name !== "optimized") {
        files.push(...findLargeImages(fullPath));
      } else if (item.isFile() && /\.(jpeg|jpg|png)$/i.test(item.name)) {
        const stats = fs.statSync(fullPath);
        if (stats.size > 400 * 1024) {
          // > 400KB
          files.push(fullPath);
        }
      }
    }

    return files;
  };

  const largeImages = findLargeImages(imagesDir);
  console.log(`Found ${largeImages.length} large images to optimize:`);
  largeImages.forEach((img) => {
    const stats = fs.statSync(img);
    console.log(
      `  ${path.relative(imagesDir, img)}: ${(stats.size / 1024 / 1024).toFixed(2)}MB`
    );
  });
  console.log("");

  // Optimize each large image
  for (const imagePath of largeImages) {
    await optimizeImage(imagePath, outputDir);
  }

  console.log("🎉 All images optimized!");
}

main().catch(console.error);
