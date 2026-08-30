using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;

namespace Emberroot.Editor {
    public class PlaytestSceneGenerator : EditorWindow {
        [MenuItem("Emberroot/Generate Playtest Scene")]
        public static void ShowWindow() => GetWindow<PlaytestSceneGenerator>("Playtest Scene Generator");

        private RegionID selectedRegion = RegionID.Hub;
        private int enemyCount = 5;
        private int npcCount = 3;
        private bool includeCheckpoints = true;
        private bool includeRegionTransition = true;

        private void OnGUI() {
            GUILayout.Label("Auto-generate a test room", EditorStyles.boldLabel);
            GUILayout.Space(10);
            selectedRegion = (RegionID)EditorGUILayout.EnumPopup("Region", selectedRegion);
            enemyCount = EditorGUILayout.IntSlider("Enemies", enemyCount, 0, 20);
            npcCount = EditorGUILayout.IntSlider("NPCs", npcCount, 0, 10);
            includeCheckpoints = EditorGUILayout.Toggle("Include Checkpoints", includeCheckpoints);
            includeRegionTransition = EditorGUILayout.Toggle("Include Region Transition", includeRegionTransition);
            GUILayout.Space(10);
            if (GUILayout.Button("Generate Playtest Scene", GUILayout.Height(40))) Generate();
        }

        private void Generate() {
            var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
            scene.name = "Playtest_" + selectedRegion;

            // Ground
            var ground = GameObject.CreatePrimitive(PrimitiveType.Cube);
            ground.name = "Ground";
            ground.transform.position = new Vector3(0, -3, 0);
            ground.transform.localScale = new Vector3(40, 1, 1);

            // Walls
            CreateWall("LeftWall", new Vector3(-20, 2, 0), new Vector3(1, 10, 1));
            CreateWall("RightWall", new Vector3(20, 2, 0), new Vector3(1, 10, 1));

            // Player spawn
            var player = new GameObject("Player");
            player.transform.position = new Vector3(-15, -1.5f, 0);
            player.AddComponent<SpriteRenderer>();
            player.AddComponent<Rigidbody2D>();
            player.AddComponent<BoxCollider2D>();

            // Enemies
            for (int i = 0; i < enemyCount; i++) {
                var enemy = GameObject.CreatePrimitive(PrimitiveType.Cube);
                enemy.name = "Enemy_" + i;
                enemy.transform.position = new Vector3(Random.Range(-10, 10), -1.5f, 0);
                enemy.transform.localScale = new Vector3(0.8f, 0.8f, 1);
                enemy.GetComponent<Renderer>().material.color = Color.red;
            }

            // NPCs
            for (int i = 0; i < npcCount; i++) {
                var npc = GameObject.CreatePrimitive(PrimitiveType.Cube);
                npc.name = "NPC_" + i;
                npc.transform.position = new Vector3(-12 + i * 3, -1.5f, 0);
                npc.transform.localScale = new Vector3(0.6f, 0.8f, 1);
                npc.GetComponent<Renderer>().material.color = Color.green;
            }

            // Checkpoints
            if (includeCheckpoints) {
                var cp = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
                cp.name = "Checkpoint";
                cp.transform.position = new Vector3(0, -1.5f, 0);
                cp.transform.localScale = new Vector3(0.5f, 0.3f, 0.5f);
                cp.GetComponent<Renderer>().material.color = Color.yellow;
            }

            // Region Transition
            if (includeRegionTransition) {
                var trans = GameObject.CreatePrimitive(PrimitiveType.Cube);
                trans.name = "RegionTransition";
                trans.transform.position = new Vector3(18, -1.5f, 0);
                trans.transform.localScale = new Vector3(1, 2, 1);
                trans.GetComponent<Renderer>().material.color = Color.cyan;
            }

            // Camera follow target
            if (Camera.main != null) Camera.main.transform.position = new Vector3(0, 2, -10);

            EditorSceneManager.SaveScene(scene);
            Debug.Log($"Playtest scene generated for {selectedRegion} with {enemyCount} enemies, {npcCount} NPCs");
        }

        private void CreateWall(string name, Vector3 pos, Vector3 scale) {
            var wall = GameObject.CreatePrimitive(PrimitiveType.Cube);
            wall.name = name;
            wall.transform.position = pos;
            wall.transform.localScale = scale;
        }
    }
}
