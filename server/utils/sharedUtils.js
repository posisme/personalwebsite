// utils/sharedUtils.js
const { dbrun, basepicdir } = require('./db'); // Import dbrun and basepicdir
const path = require('path');
const fs = require('fs');
const exiftool = require('node-exiftool'); // Assuming you have node-exiftool for writeExif
const exiftool_vendored = require('exiftool-vendored'); // For `exiftool_vendored.exiftool`
const ep = new exiftool_vendored.ExifTool(); // Initialize exiftool_vendored

const rebuildPhotoDb = async () => {
    // This function can be more detailed, reading EXIF data, etc.
    // Placeholder implementation
    try {
        // Clear existing pic data
        await dbrun("DELETE FROM pics", [], "delete");
        await dbrun("DELETE FROM picspeople", [], "delete");
        await dbrun("DELETE FROM pics_xtra", [], "delete");

        const files = fs.readdirSync(basepicdir);
        const imageFiles = files.filter(file => /\.(jpe?g|png|gif|webp)$/i.test(file));

        for (const filename of imageFiles) {
            const filePath = path.join(basepicdir, filename);
            const stats = fs.statSync(filePath);
            const date = stats.mtime.toISOString().split('T')[0]; // Modification date

            // Insert into pics table
            await dbrun("INSERT INTO pics (filename, date, size) VALUES (?, ?, ?)",
                [filename, date, stats.size], "insert");

            // Optionally, read EXIF data and populate pics_xtra and picspeople
            try {
                const metadata = await ep.read(filePath);
                if (metadata.data && metadata.data.Keywords) {
                    const keywords = Array.isArray(metadata.data.Keywords) ? metadata.data.Keywords : [metadata.data.Keywords];
                    for (const keyword of keywords) {
                        await dbrun("INSERT INTO picspeople (personid, picid) VALUES (?, ?)", [keyword, filename], "insert");
                    }
                }
            } catch (exifError) {
                console.warn(`Could not read EXIF for ${filename}:`, exifError.message);
            }
        }
        return { message: "Photo database rebuilt successfully." };
    } catch (error) {
        console.error("Error rebuilding photo database:", error);
        return { error: "Failed to rebuild photo database." };
    }
};

const writeExif = async (filename, data, directory = basepicdir) => {
    const filePath = path.join(directory, filename);
    // Placeholder for actual EXIF writing logic using exiftool.
    // This will require `node-exiftool` or `exiftool-vendored` correctly set up.
    try {
        // Example: writing keywords
        // await ep.write(filePath, { Keywords: data.Keywords });
        // The above line is commented out as it requires proper setup and usage of exiftool-vendored
        // It's more complex than a simple function call and might involve temporary files.
        console.log(`Simulating EXIF write for ${filePath} with data:`, data);
        // A full implementation would use ep.write or ep.writeBinary to update metadata.
        // For example:
        if (data.Keywords) {
            await ep.write(filePath, {
                'Keywords': data.Keywords.length > 0 ? data.Keywords : undefined // exiftool expects empty array for deletion
            });
            console.log(`Keywords updated for ${filename}`);
        }
    } catch (error) {
        console.error(`Error writing EXIF for ${filename}:`, error);
        throw error;
    }
};

module.exports = {
    rebuildPhotoDb,
    writeExif
};