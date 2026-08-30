using UnityEngine;
using UnityEditor;
using System.IO;
using System.Collections.Generic;

namespace Emberroot
{
    public static class AssetImporter
    {
        private static readonly string SpritesPath = "Assets/Sprites";

        [MenuItem("Emberroot/Import Assets/Setup Folders")]
        public static void SetupFolders()
        {
            EnsureFolder(SpritesPath);
            EnsureFolder(SpritesPath + "/Tilesets");
            EnsureFolder(SpritesPath + "/Characters/Player");
            EnsureFolder(SpritesPath + "/Characters/NPCs");
            EnsureFolder(SpritesPath + "/Enemies/Forest");
            EnsureFolder(SpritesPath + "/Enemies/Mines");
            EnsureFolder(SpritesPath + "/Enemies/Peak");
            EnsureFolder(SpritesPath + "/Enemies/Bosses");
            EnsureFolder(SpritesPath + "/UI/HUD");
            EnsureFolder(SpritesPath + "/UI/Menus");
            EnsureFolder(SpritesPath + "/Icons");
            Debug.Log("[AssetImporter] Folder structure created!");
        }

        [MenuItem("Emberroot/Import Assets/Configure All Textures")]
        public static void ConfigureAllTextures()
        {
            string[] guids = AssetDatabase.FindAssets("t:Texture2D", new[] { SpritesPath });
            int configured = 0;
            foreach (string guid in guids)
            {
                string path = AssetDatabase.GUIDToAssetPath(guid);
                var importer = AssetImporter.GetAtPath(path) as TextureImporter;
                if (importer == null) continue;
                importer.textureType = TextureImporterType.Sprite;
                importer.spriteImportMode = SpriteImportMode.Multiple;
                importer.filterMode = FilterMode.Point;
                importer.textureCompression = TextureImporterCompression.Uncompressed;
                importer.maxTextureSize = 512;
                importer.spritePixelsPerUnit = 16;
                importer.SaveAndReimport();
                configured++;
            }
            Debug.Log($"[AssetImporter] Configured {configured} textures!");
        }

        [MenuItem("Emberroot/Import Assets/Slice All Sprite Sheets")]
        public static void SliceAllSpriteSheets()
        {
            string[] guids = AssetDatabase.FindAssets("t:Texture2D", new[] { SpritesPath });
            int sliced = 0;
            foreach (string guid in guids)
            {
                string path = AssetDatabase.GUIDToAssetPath(guid);
                var importer = AssetImporter.GetAtPath(path) as TextureImporter;
                if (importer == null || importer.spriteImportMode != SpriteImportMode.Multiple) continue;
                var texture = AssetDatabase.LoadAssetAtPath<Texture2D>(path);
                if (texture == null) continue;
                int fw = path.Contains("Tile") ? 32 : path.Contains("Boss") ? 128 : 64;
                int fh = fw;
                int cols = texture.width / fw;
                int rows = texture.height / fh;
                if (cols == 0 || rows == 0) continue;
                var sprites = new List<SpriteMetaData>();
                int idx = 0;
                for (int y = rows - 1; y >= 0; y--) for (int x = 0; x < cols; x++)
                    sprites.Add(new SpriteMetaData { name = Path.GetFileNameWithoutExtension(path) + "_" + idx++, rect = new Rect(x * fw, y * fh, fw, fh), pivot = new Vector2(0.5f, 0.5f), alignment = 9 });
                importer.spritesheet = sprites.ToArray();
                importer.SaveAndReimport();
                sliced++;
            }
            Debug.Log($"[AssetImporter] Sliced {sliced} sprite sheets!");
        }

        [MenuItem("Emberroot/Import Assets/Import From Downloads")]
        public static void ImportFromDownloads()
        {
            string dir = "C:/Users/Righi Leila/Downloads/game assets google flow";
            if (!Directory.Exists(dir)) { Debug.LogError("Downloads not found"); return; }
            string[] files = Directory.GetFiles(dir, "*.jpeg");
            int imported = 0;
            foreach (string f in files)
            {
                string name = Path.GetFileNameWithoutExtension(f);
                string target = $"{SpritesPath}/{name}.png";
                File.Copy(f, target, true);
                AssetDatabase.ImportAsset(target);
                imported++;
            }
            AssetDatabase.Refresh();
            Debug.Log($"[AssetImporter] Imported {imported} assets!");
        }

        private static void EnsureFolder(string path)
        {
            if (!AssetDatabase.IsValidFolder(path))
            {
                string parent = Path.GetDirectoryName(path).Replace("\\", "/");
                string folder = Path.GetFileName(path);
                if (!AssetDatabase.IsValidFolder(parent)) EnsureFolder(parent);
                AssetDatabase.CreateFolder(parent, folder);
            }
        }
    }
}