using UnityEngine;
#if UNITY_EDITOR
using UnityEditor;
#endif

namespace Emberroot
{
    public static class PrefabGenerator
    {
#if UNITY_EDITOR
        [MenuItem("Emberroot/Create Prefabs/Create All Prefabs")]
        public static void CreateAllPrefabs()
        {
            string prefabPath = "Assets/Prefabs";
            if (!AssetDatabase.IsValidFolder(prefabPath))
                AssetDatabase.CreateFolder("Assets", "Prefabs");

            CreatePlayerPrefab(prefabPath);
            CreateNPCPrefabs(prefabPath);
            CreateEnemyPrefabs(prefabPath);
            CreateProjectilePrefab(prefabPath);
            CreateDamageNumberPrefab(prefabPath);

            AssetDatabase.Refresh();
            Debug.Log("[PrefabGenerator] All prefabs created!");
        }

        private static void CreatePlayerPrefab(string path) { }
        private static void CreateNPCPrefabs(string path) { }
        private static void CreateEnemyPrefabs(string path) { }
        private static void CreateProjectilePrefab(string path) { }
        private static void CreateDamageNumberPrefab(string path) { }
#endif
    }
}