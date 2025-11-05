import { NextRequest } from 'next/server';

const COPYPASTA_VARIANTS: Record<string, string> = {
  original: `What the fuck did you just fucking say about me, you little bitch? I'll have you know I graduated top of my class in the Navy Seals, and I've been involved in numerous secret raids on Al-Quaeda, and I have over 300 confirmed kills. I am trained in gorilla warfare and I'm the top sniper in the entire US armed forces. You are nothing to me but just another target. I will wipe you the fuck out with precision the likes of which has never been seen before on this Earth, mark my fucking words.`,

  marine: `What the fuck did you just fucking say about me, you little bitch? I'll have you know I graduated top of my class in Marine Biology, and I've been involved in numerous secret studies on dolphins, and I have over 300 confirmed publications. I am trained in gorilla (and chimpanzee) research and I'm the top marine biologist in the entire US scientific community.`,

  hacker: `What the fuck did you just fucking type about me, you little script kiddie? I'll have you know I graduated top of my class at MIT, and I've been involved in numerous secret raids on government databases, and I have over 300 confirmed DDoS attacks. I am trained in SQL injection and I'm the top hacker in the entire anonymous collective.`,

  uwu: `What's this? OwO *notices ur comment* What the fwick did you just fwucking say about me, you wittwe bitch? I'll have you knyow I gwaduated top of my cwass in the Nyavy Seaws, and I've been invowved in nyumewous secwet waids on Aw-Quaeda, and I have over 300 confiwmed kiwws. I am twained in gowilla wawfawe and I'm the top snyiper in the entiwe US awmed fowces. You awe nyothing to me but just anyothew tawget. I wiww wipe you the fwick out with pwecision the wikes of which has nyevew been seen befowe on this Eawth, mawk my fwucking wowds. UwU`,

  emoji: `What 😤 the fuck 🖕 did you 👈 just 👏 fucking 🍆 say 🗣️ about 💭 me 😎, you 👉 little 👌 bitch 🐕? I'll 💪 have you 👈 know 🧠 I 👁️ graduated 🎓 top 🔝 of my 💯 class 📚 in the Navy ⚓ Seals 🦭, and I've 🙋 been involved 🤝 in numerous 🔢 secret 🤫 raids 💥 on Al-Quaeda 💣, and I 👊 have over 💯 300 ✔️ confirmed ☠️ kills 💀.`,

  british: `What the bloody hell did you just say about me, you little tosser? I'll have you know I graduated top of my class in Tea Tasting School, and I've been involved in numerous secret raids on the biscuit tin, and I have over 300 confirmed cups of tea. I am trained in proper queue etiquette and I'm the top gentleman in the entire British Empire.`,

  pirate: `What the fuck did ye just fucking say about me, ye scurvy bilge rat? I'll have ye know I be the meanest cutthroat on the seven seas, and I've led numerous raids on fishing villages, and raped over 300 wenches. I be trained in hit-and-run pillaging and be the deadliest with a pistol of all the captains on the high seas.`,

  vegan: `What did you just say about my kale smoothie, you little carnist? I'll have you know I graduated top of my class in Holistic Nutrition, and I've been involved in numerous protests at factory farms, and I have over 300 rescued animals. I am trained in peaceful demonstration and I'm the top activist in the entire vegan community.`
};

// Stream generator that repeats copypasta infinitely (or until client disconnects)
async function* generateCopypasta(variant: string, targetBytes: number = Infinity) {
  const text = COPYPASTA_VARIANTS[variant] || COPYPASTA_VARIANTS.original;
  const textBytes = new TextEncoder().encode(text + '\n\n');

  let bytesGenerated = 0;
  let iteration = 0;

  while (bytesGenerated < targetBytes) {
    yield textBytes;
    bytesGenerated += textBytes.length;
    iteration++;

    // Add periodic status updates
    if (iteration % 10000 === 0) {
      const statusLine = `\n[Generated ${(bytesGenerated / (1024**3)).toFixed(2)} GB, iteration ${iteration}]\n\n`;
      yield new TextEncoder().encode(statusLine);
    }

    // Add deliberate slowdown to prevent server resource exhaustion
    if (iteration % 1000 === 0) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const variant = searchParams.get('variant') || 'original';
  const sizeGB = parseFloat(searchParams.get('size') || '1');

  const targetBytes = sizeGB * 1024 * 1024 * 1024;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send header comment
        const header = `# Generated Copypasta File
# Variant: ${variant}
# Target Size: ${sizeGB} GB
# WARNING: This file will continue generating until you stop the download
# Each iteration adds ~${(COPYPASTA_VARIANTS[variant] || COPYPASTA_VARIANTS.original).length} bytes
# Estimated repetitions needed: ${Math.ceil(targetBytes / (COPYPASTA_VARIANTS[variant] || COPYPASTA_VARIANTS.original).length).toLocaleString()}
#
# DO NOT ACTUALLY DOWNLOAD THIS FILE
# THIS IS A JOKE EASTER EGG
#
# "What did you expect?" - The 300 Confirmed Kills Guy
# ============================================

`;
        controller.enqueue(new TextEncoder().encode(header));

        for await (const chunk of generateCopypasta(variant, targetBytes)) {
          controller.enqueue(chunk);
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
    cancel() {
      // Client disconnected - stop generating
      console.log('Copypasta generation cancelled by client (they came to their senses)');
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${variant}_copypasta_${sizeGB}GB.txt"`,
      'X-Gorilla-Warfare': 'trained',
      'X-Confirmed-Kills': '300',
      'X-Warning': 'What did you expect?',
    },
  });
}
