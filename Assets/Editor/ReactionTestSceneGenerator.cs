using UnityEngine;
#if UNITY_EDITOR
using UnityEditor;
#endif

namespace Emberroot
{
    /// <summary>
    /// Editor script to generate a test arena for testing elemental reactions.
    /// Menu: Emberroot > Create Reaction Test Scene
    /// Spawns enemies with different status effects so you can test combo reactions.
    /// </summary>
    public static class ReactionTestSceneGenerator
    {
#if UNITY_EDITOR
        [MenuItem("Emberroot/Create Reaction Test Scene")]
        public static void CreateTestScene()
        {
            // Create ground
            var ground = GameObject.CreatePrimitive(PrimitiveType.Cube);
            ground.name = "TestGround";
            ground.transform.position = Vector3.zero;
            ground.transform.localScale = new Vector3(20, 0.1f, 20);
            ground.layer = LayerMask.NameToLayer("Ground");

            // Create arena walls
            CreateWall("NorthWall", new Vector3(0, 1, 10), new Vector3(20, 2, 0.5f));
            CreateWall("SouthWall", new Vector3(0, 1, -10), new Vector3(20, 2, 0.5f));
            CreateWall("EastWall", new Vector3(10, 1, 0), new Vector3(0.5f, 2, 20));
            CreateWall("WestWall", new Vector3(-10, 1, 0), new Vector3(0.5f, 2, 20));

            // Create player spawn
            var playerSpawn = new GameObject("PlayerSpawn");
            playerSpawn.transform.position = new Vector3(0, 0.5f, -7);

            // Create enemies with different status effects for testing
            CreateTestEnemy("Burn Enemy", new Vector3(-4, 0.5f, 2), "Burn", new Color(1f, 0.3f, 0f));
            CreateTestEnemy("Freeze Enemy", new Vector3(-1, 0.5f, 2), "Freeze", new Color(0.3f, 0.7f, 1f));
            CreateTestEnemy("Shock Enemy", new Vector3(2, 0.5f, 2), "Shock", new Color(1f, 1f, 0.3f));
            CreateTestEnemy("Poison Enemy", new Vector3(5, 0.5f, 2), "Poison", new Color(0.3f, 0.8f, 0.2f));
            CreateTestEnemy("Slow Enemy", new Vector3(-4, 0.5f, 5), "Slow", new Color(0.5f, 0.5f, 1f));
            CreateTestEnemy("Bleed Enemy", new Vector3(-1, 0.5f, 5), "Bleed", new Color(0.8f, 0f, 0f));
            CreateTestEnemy("Curse Enemy", new Vector3(2, 0.5f, 5), "Curse", new Color(0.5f, 0f, 0.5f));

            // Create dual-effect enemies for reaction testing
            CreateTestEnemy("Burn+Freeze (MELT)", new Vector3(-3, 0.5f, 8), "Burn+Freeze", new Color(1f, 0.5f, 0f));
            CreateTestEnemy("Burn+Shock (OVERLOAD)", new Vector3(0, 0.5f, 8), "Burn+Shock", new Color(1f, 0.2f, 0.2f));
            CreateTestEnemy("Shock+Slow (ELECTRO)", new Vector3(3, 0.5f, 8), "Shock+Slow", new Color(0f, 1f, 1f));

            // Create test UI canvas
            var canvasGO = new GameObject("TestCanvas");
            var canvas = canvasGO.AddComponent<UnityEngine.Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvasGO.AddComponent<UnityEngine.UI.CanvasScaler>();
            canvasGO.AddComponent<UnityEngine.UI.GraphicRaycaster>();

            // Add instructions text
            var textGO = new GameObject("Instructions");
            textGO.transform.SetParent(canvasGO.transform, false);
            var rectTransform = textGO.AddComponent<RectTransform>();
            rectTransform.anchorMin = new Vector2(0, 1);
            rectTransform.anchorMax = new Vector2(1, 1);
            rectTransform.pivot = new Vector2(0.5f, 1);
            rectTransform.sizeDelta = new Vector2(0, 120);
            rectTransform.anchoredPosition = new Vector2(0, -10);

            var text = textGO.AddComponent<TMPro.TextMeshProUGUI>();
            text.text = "REACTION TEST ARENA
Apply Burn then Freeze = MELT
Apply Burn then Shock = OVERLOAD
Apply Shock then Slow = ELECTRO-CHARGED
Walk into enemies to trigger reactions!";
            text.fontSize = 18;
            text.alignment = TMPro.TextAlignmentOptions.Center;
            text.color = Color.white;

            UnityEditor.SceneManagement.EditorSceneManager.MarkSceneDirty(UnityEditor.SceneManagement.EditorSceneManager.GetActiveScene());
            Debug.Log("[ReactionTestScene] Test arena created! Place status effect ScriptableObjects on enemies.");
        }

        private static void CreateWall(string name, Vector3 position, Vector3 scale)
        {
            var wall = GameObject.CreatePrimitive(PrimitiveType.Cube);
            wall.name = name;
            wall.transform.position = position;
            wall.transform.localScale = scale;
            wall.layer = LayerMask.NameToLayer("Ground");
        }

        private static void CreateTestEnemy(string name, Vector3 position, string effectType, Color color)
        {
            var enemy = GameObject.CreatePrimitive(PrimitiveType.Cube);
            enemy.name = name;
            enemy.transform.position = position;
            enemy.transform.localScale = new Vector3(0.8f, 0.8f, 0.8f);
            enemy.layer = LayerMask.NameToLayer("Enemy");

            // Add color via renderer
            var renderer = enemy.GetComponent<Renderer>();
            if (renderer != null)
            {
                var mat = new Material(Shader.Find("Standard"));
                mat.color = color;
                renderer.material = mat;
            }

            // Add rigidbody
            var rb = enemy.AddComponent<Rigidbody2D>();
            rb.gravityScale = 0;
            rb.freezeRotation = true;

            // Add collider
            var col = enemy.GetComponent<BoxCollider2D>();
            if (col == null) col = enemy.AddComponent<BoxCollider2D>();

            // Add enemy health
            enemy.AddComponent<EnemyHealth>();

            // Add status effect receiver
            enemy.AddComponent<StatusEffectReceiver>();

            // Add enemy AI
            enemy.AddComponent<EnemyAI>();

            // Store effect type in name for reference
            enemy.name = $"{name} [{effectType}]";
        }
#endif
    }
}