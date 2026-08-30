using UnityEngine;
using UnityEditor;
using System.IO;
using System.Linq;

namespace Emberroot.Editor
{
    public static class ProductionValidator
    {
        [MenuItem("Emberroot/Ship/Validate Production")]
        public static void ValidateAll()
        {
            int pass = 0, fail = 0;
            void Check(string n, bool ok) { if (ok) pass++; else { fail++; Debug.LogError("FAIL: " + n); } }
            Check("Scenes configured", EditorBuildSettings.scenes.Length >= 2);
            Check("GameSettings exists", AssetDatabase.FindAssets("t:GameSettings").Length > 0);
            Debug.Log($"Production validation: {pass} passed, {fail} failed");
        }

        [MenuItem("Emberroot/Ship/Generate Manifest")]
        public static void GenerateManifest()
        {
            var sb = new System.Text.StringBuilder();
            sb.AppendLine("EMBERROOT - Shipping Manifest");
            sb.AppendLine($"Generated: {System.DateTime.Now}");
            sb.AppendLine();
            var scripts = Directory.GetFiles("Scripts", "*.cs", SearchOption.AllDirectories);
            sb.AppendLine($"Total C# scripts: {scripts.Length}");
            File.WriteAllText("Docs/SHIPPING_MANIFEST.txt", sb.ToString());
            Debug.Log("Manifest generated");
        }
    }
}
