import type { DialogueTree } from "./types";

export const DIALOGUES: DialogueTree[] = [
  {
    id: "quill_hub",
    npc: "quill",
    states: {
      default: [
        {
          speaker: "Quill",
          text: "The roots have been whispering your name since dawn. Don't look so surprised — the world is a gossip.",
          choices: [
            { text: "What do they want from me?", next: "duty" },
            { text: "I don't owe the world anything.", next: "hard", karma: -5 },
            { text: "Then I should listen.", next: "kind", karma: 5 },
          ],
        },
      ],
      duty: [
        {
          speaker: "Quill",
          text: "Nine regions. Nine sicknesses. One tree that remembers every kindness and every knife. Start with the Woods — they are dying politely, which is worse.",
          choices: [{ text: "I'll go.", next: null, flag: "quest_awaken" }],
        },
      ],
      hard: [
        {
          speaker: "Quill",
          text: "No? How refreshing. The last hero said the same, and the grove still has their bones. Try not to match the set.",
          choices: [{ text: "We'll see.", next: null, flag: "quest_awaken" }],
        },
      ],
      kind: [
        {
          speaker: "Quill",
          text: "Careful. Listening is how the world gets inside you. Still — the Woods will be gentler if you arrive gentle.",
          choices: [{ text: "I'll be careful.", next: null, flag: "quest_awaken" }],
        },
      ],
      mid: [
        {
          speaker: "Quill",
          text: "You come back smelling of ash and decisions. The village notices. I notice.",
        },
      ],
    },
  },
  {
    id: "bramble_hub",
    npc: "bramble",
    states: {
      default: [
        {
          speaker: "Bramble",
          text: "Coin first, philosophy later. I stock steel, tonic, and the occasional miracle that fell off a cart.",
          choices: [
            { text: "Show me your wares.", next: null, flag: "open_shop" },
            { text: "Any work?", next: "work" },
          ],
        },
      ],
      work: [
        {
          speaker: "Bramble",
          text: "Goblins have been nipping my supply line. Cull twenty and I'll pretend I like you.",
          choices: [
            { text: "Deal.", next: null, flag: "quest_cull" },
            { text: "Not my problem.", next: null, karma: -3 },
          ],
        },
      ],
    },
  },
  {
    id: "sora_hub",
    npc: "sora",
    states: {
      default: [
        {
          speaker: "Sora",
          text: "Sit, if the world has been unkind. I cannot unwrite a wound, but I can argue with it.",
          choices: [
            { text: "Please, heal me.", next: null, flag: "heal" },
            { text: "I'm fine.", next: "pride" },
          ],
        },
      ],
      pride: [
        {
          speaker: "Sora",
          text: "Of course you are. They always are, right until they aren't. Come back before that.",
        },
      ],
    },
  },
  {
    id: "kett_hub",
    npc: "kett",
    states: {
      default: [
        {
          speaker: "Kett",
          text: "Metal remembers hammers the way the world remembers you. Bring me crystal from the mines and I'll make it sing.",
          choices: [
            { text: "I'll fetch crystal.", next: null, flag: "quest_mines" },
            { text: "Can you upgrade my gear?", next: null, flag: "open_craft" },
          ],
        },
      ],
    },
  },
  {
    id: "ash_hub",
    npc: "ash",
    states: {
      default: [
        {
          speaker: "Ash",
          text: "I used to have another name. The Peak took it. If you climb, climb as someone you can still come back as.",
          choices: [
            { text: "I'll bring it back.", next: "soft", karma: 8 },
            { text: "Names are just ash.", next: "hard", karma: -8 },
          ],
        },
      ],
      soft: [
        {
          speaker: "Ash",
          text: "Then the Titan will hate you less. Or more. Hate is not a science.",
          choices: [{ text: "I'll go anyway.", next: null, flag: "quest_peak" }],
        },
      ],
      hard: [
        {
          speaker: "Ash",
          text: "Keep telling yourself that. The Emberroot is listening, and it has a petty streak.",
          choices: [{ text: "Good.", next: null, flag: "quest_peak" }],
        },
      ],
    },
  },
  {
    id: "luma_hub",
    npc: "luma",
    states: {
      default: [
        {
          speaker: "Luma",
          text: "I am a fox that remembers being fire. Take me with you and I will bite whatever looks at you wrong.",
          choices: [
            { text: "Come along.", next: null, flag: "recruit_pet", karma: 3 },
            { text: "Stay. It's safer.", next: null, karma: 1 },
          ],
        },
      ],
    },
  },
  {
    id: "niall_hub",
    npc: "niall",
    states: {
      default: [
        {
          speaker: "Niall",
          text: "Fish don't remember much, which is why I like them. Cast at the pond. Timing is everything, like kindness.",
          choices: [{ text: "I'll try.", next: null, flag: "quest_fish" }],
        },
      ],
    },
  },
  {
    id: "mira_hub",
    npc: "mira",
    states: {
      default: [
        {
          speaker: "Mira",
          text: "Every run you make is a sentence in a book the tree is writing. Try to be a paragraph worth keeping.",
        },
      ],
      late: [
        {
          speaker: "Mira",
          text: "The Nightmare Depths have opened. The Emberroot is not a boss. It is a verdict.",
          choices: [{ text: "I'm ready.", next: null, flag: "quest_depths" }],
        },
      ],
    },
  },
];

export const ENDING_TEXT: Record<string, { title: string; body: string }> = {
  merciful: {
    title: "The Merciful Root",
    body: "You laid your blade down more often than you raised it. The Emberroot remembers the names you spared, and the village grows green in their shade. The world does not become kind. It becomes possible.",
  },
  balanced: {
    title: "The Remembering",
    body: "You were neither saint nor storm. The tree accepts this as the oldest truth: survival is a mixed ledger. The roots hold both your mercy and your necessary cruelties, and the world continues, complicated and alive.",
  },
  ruthless: {
    title: "The Ash Crown",
    body: "You cut a straight road through every living thing that stood on it. The Emberroot remembers, and it learns your appetite. The village stands, smaller, quieter, afraid — and the world will not forget the shape of your hands.",
  },
};
