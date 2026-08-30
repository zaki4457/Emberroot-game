using UnityEngine;
using UnityEditor;
using UnityEditor.Build.Reporting;
using System.Linq;

namespace Emberroot.Editor
{
    public static class EmberrootBuildPipeline
    {
        [MenuItem("Emberroot/Build/Windows 64-bit")]
        public static void BuildWindows() => Build(BuildTarget.StandaloneWindows64, "Builds/Emberroot_Win64/Emberroot.exe");

        [MenuItem("Emberroot/Build/macOS")]
        public static void BuildMac() => Build(BuildTarget.StandaloneOSX, "Builds/Emberroot_Mac/Emberroot.app");

        [MenuItem("Emberroot/Build/Linux")]
        public static void BuildLinux() => Build(BuildTarget.StandaloneLinux64, "Builds/Emberroot_Linux/Emberroot");

        [MenuItem("Emberroot/Build/WebGL")]
        public static void BuildWebGL() => Build(BuildTarget.WebGL, "Builds/Emberroot_WebGL");

        static void Build(BuildTarget target, string path)
        {
            var scenes = EditorBuildSettings.scenes.Where(s => s.enabled).Select(s => s.path).ToArray();
            if (scenes.Length == 0) { Debug.LogError("No scenes enabled in Build Settings!"); return; }
            var options = new BuildPlayerOptions
            {
                scenes = scenes,
                locationPathName = path,
                target = target,
                options = BuildOptions.None
            };
            var report = UnityEditor.BuildPipeline.BuildPlayer(options);
            if (report.summary.result == BuildResult.Succeeded)
                Debug.Log("Build succeeded: " + report.summary.outputPath);
            else
                Debug.LogError("Build failed: " + report.summary.result);
        }

        [MenuItem("Emberroot/Build/Validate Project")]
        public static void ValidateProject()
        {
            int errors = 0;
            // Check scenes
            var scenes = EditorBuildSettings.scenes.Where(s => s.enabled).ToArray();
            Debug.Log($"Scenes in build: {scenes.Length}");
            foreach (var s in scenes) Debug.Log($"  - {s.path}");
            // Check for missing references
            var guids = AssetDatabase.FindAssets("t:Prefab");
            Debug.Log($"Prefabs in project: {guids.Length}");
            // Check ScriptableObjects
            var sos = AssetDatabase.FindAssets("t:ScriptableObject");
            Debug.Log($"ScriptableObjects in project: {sos.Length}");
            if (errors == 0) Debug.Log("Validation passed!");
            else Debug.LogError($"Validation failed with {errors} errors");
        }
    }
}
