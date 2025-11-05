'use client';

import { useState } from 'react';
import { AlertTriangle, Database, Download, FileArchive, HardDrive, Server } from 'lucide-react';

const COPYPASTA_VARIANTS = {
  original: `What the fuck did you just fucking say about me, you little bitch? I'll have you know I graduated top of my class in the Navy Seals, and I've been involved in numerous secret raids on Al-Quaeda, and I have over 300 confirmed kills. I am trained in gorilla warfare and I'm the top sniper in the entire US armed forces. You are nothing to me but just another target. I will wipe you the fuck out with precision the likes of which has never been seen before on this Earth, mark my fucking words.`,

  marine: `What the fuck did you just fucking say about me, you little bitch? I'll have you know I graduated top of my class in Marine Biology, and I've been involved in numerous secret studies on dolphins, and I have over 300 confirmed publications. I am trained in gorilla (and chimpanzee) research and I'm the top marine biologist in the entire US scientific community.`,

  hacker: `What the fuck did you just fucking type about me, you little script kiddie? I'll have you know I graduated top of my class at MIT, and I've been involved in numerous secret raids on government databases, and I have over 300 confirmed DDoS attacks. I am trained in SQL injection and I'm the top hacker in the entire anonymous collective.`,

  british: `What the bloody hell did you just say about me, you little tosser? I'll have you know I graduated top of my class in Tea Tasting School, and I've been involved in numerous secret raids on the biscuit tin, and I have over 300 confirmed cups of tea. I am trained in proper queue etiquette and I'm the top gentleman in the entire British Empire.`,

  pirate: `What the fuck did ye just fucking say about me, ye scurvy bilge rat? I'll have ye know I be the meanest cutthroat on the seven seas, and I've led numerous raids on fishing villages, and raped over 300 wenches. I be trained in hit-and-run pillaging and be the deadliest with a pistol of all the captains on the high seas.`,

  starwars: `What the fuck did you just fucking say about me, you little rebel scum? I'll have you know I graduated top of my class in the Imperial Academy, and I've been involved in numerous secret raids on Rebel bases, and I have over 300 confirmed kills. I am trained in the ways of the Dark Side and I'm the top pilot in the entire Imperial Navy.`,

  programmer: `What the fuck did you just fucking say about my code, you little n00b? I'll have you know I graduated top of my class in Computer Science, and I've been involved in numerous open source projects, and I have over 300 confirmed commits. I am trained in algorithm optimization and I'm the top developer at FAANG.`,

  chef: `What the fuck did you just fucking say about my cooking, you little donkey? I'll have you know I graduated top of my class at Le Cordon Bleu, and I've been involved in numerous Michelin star restaurants, and I have over 300 confirmed perfect soufflés. I am trained in French cuisine and I'm the top chef in the entire culinary world.`
};

export default function KibanaPage() {
  const [downloading, setDownloading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>('shdb.zip');
  const [expandedVariant, setExpandedVariant] = useState<string | null>(null);

  const handleDownload = (filename: string = 'shdb.zip') => {
    setDownloading(true);

    // Determine variant and size from filename
    let variant = 'original';
    let sizeGB = 24.7; // shdb.zip default

    if (filename.includes('uwu')) {
      variant = 'uwu';
      sizeGB = 18.3;
    } else if (filename.includes('emoji')) {
      variant = 'emoji';
      sizeGB = 31.2;
    } else if (filename.includes('vegan')) {
      variant = 'vegan';
      sizeGB = 12.4;
    } else if (filename.includes('marine')) {
      variant = 'marine';
      sizeGB = 15.6;
    } else if (filename.includes('hacker')) {
      variant = 'hacker';
      sizeGB = 14.2;
    } else if (filename.includes('british')) {
      variant = 'british';
      sizeGB = 11.8;
    } else if (filename.includes('pirate')) {
      variant = 'pirate';
      sizeGB = 13.9;
    }

    // Show warning first
    const proceed = confirm(
      `⚠️ WARNING ⚠️\n\n` +
      `You are about to download: ${filename}\n` +
      `Declared size: ${sizeGB} TB\n` +
      `Variant: ${variant}\n\n` +
      `This will attempt to generate and stream ${sizeGB} TERABYTES of repeated copypasta.\n\n` +
      `This is a JOKE EASTER EGG and will consume:\n` +
      `- Massive bandwidth\n` +
      `- All your disk space\n` +
      `- Your patience\n` +
      `- Probably crash your browser\n\n` +
      `Estimated download time: ~57 years\n\n` +
      `What did you expect?\n\n` +
      `Actually proceed with download?`
    );

    if (proceed) {
      // Actually trigger the download
      window.open(`/api/copypasta-generator?variant=${variant}&size=${sizeGB * 1024}`, '_blank');

      setTimeout(() => {
        alert('Download started in new tab.\n\nYou have been warned about the consequences.\n\nRemember: over 300 confirmed kills.');
        setDownloading(false);
      }, 1000);
    } else {
      setTimeout(() => {
        alert('Wise choice. Even someone with over 300 confirmed kills knows when to retreat.');
        setDownloading(false);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white font-mono">
      {/* Fake Kibana Header */}
      <div className="border-b border-[#333] bg-[#0f0f0f] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[#00bfb3] rounded flex items-center justify-center text-black font-bold text-xl">
            K
          </div>
          <span className="text-lg">Kibana</span>
          <span className="text-xs text-red-500 px-2 py-1 bg-red-500/10 rounded">MISCONFIGURED</span>
        </div>
        <div className="text-xs text-gray-500">
          elasticsearch-node-7.17.3 | Status: <span className="text-yellow-500">⚠ WARNING</span>
        </div>
      </div>

      {/* DEFACEMENT BANNER - Clear sign of compromise */}
      <div className="bg-red-600/90 border-b-4 border-red-500 px-6 py-4 text-center animate-pulse">
        <p className="text-white text-lg font-bold tracking-wider mb-1">
          ⚠️ SECURITY BREACH DETECTED ⚠️
        </p>
        <p className="text-red-100 text-sm font-mono">
          Unauthorized modifications detected | Authentication bypass active | Directory traversal enabled
        </p>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-500/10 border-b border-yellow-500/50 px-6 py-3 flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5 animate-pulse" />
        <div className="flex-1">
          <p className="text-yellow-500 text-sm font-semibold">Security Warning - Multiple Violations Detected</p>
          <p className="text-yellow-300 text-xs mt-1">
            This Elasticsearch node is exposed to the public internet without authentication.
            Unauthorized access detected from 300+ IP addresses including known APT groups.
            Directory listing is enabled. Multiple anomalous files detected (96.4 TB copypasta variants).
            Data exfiltration in progress. Credentials leaked. IMMEDIATE ACTION REQUIRED.
          </p>
        </div>
      </div>

      {/* Breach Activity Log */}
      <div className="bg-black border-b border-red-500/30 px-6 py-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex space-x-4">
            <span className="text-red-500">[BREACH]</span>
            <span className="text-gray-400">Last unauthorized access: 2 minutes ago</span>
            <span className="text-orange-400">| Data uploaded: 96.4 TB</span>
            <span className="text-yellow-400">| Active connections: 47</span>
          </div>
          <span className="text-green-400 animate-pulse">● DATA EXFILTRATION ACTIVE</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-6xl">
        {/* Hacker's Defacement Notice */}
        <div className="mb-6 p-6 bg-gradient-to-r from-red-900/30 to-purple-900/30 border-2 border-red-500 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-4xl">💀</span>
              <div>
                <h2 className="text-xl font-bold text-red-500">PWNED BY: l33t_h4x0r_300</h2>
                <p className="text-sm text-gray-400 font-mono">Compromise Date: 2024-11-05 03:00:00 UTC</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Attack Vector:</p>
              <p className="text-sm text-orange-400 font-mono">Default Credentials + Directory Traversal</p>
            </div>
          </div>
          <div className="bg-black/50 p-4 rounded font-mono text-sm">
            <p className="text-green-400 mb-2">{'>'} cat DEFACEMENT_NOTICE.txt</p>
            <p className="text-gray-300">
              lmao you really left elasticsearch exposed with no auth? in 2024? 😂<br/>
              <span className="text-red-400">I have over 300 confirmed server compromises</span> and you just made it 301.<br/>
              <br/>
              Your node is now serving 96.4 TB of copypasta variants because I thought it was funny.<br/>
              All your data is belong to us. What did you expect?<br/>
              <br/>
              <span className="text-purple-400">- The Navy SEAL Copypasta Guy</span><br/>
              <span className="text-gray-500 text-xs">P.S. Your credentials are now on pastebin. Good luck.</span>
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl mb-2 flex items-center space-x-3">
            <Database className="w-6 h-6 text-[#00bfb3]" />
            <span>Index: /data/backup/</span>
            <span className="text-xs text-red-500 bg-red-500/20 px-2 py-1 rounded">COMPROMISED</span>
          </h1>
          <p className="text-gray-500 text-sm">Path: /var/lib/elasticsearch/nodes/node-0/indices/</p>
          <p className="text-red-400 text-xs mt-1 font-mono">⚠ Warning: All files in this directory may be malicious or modified</p>
        </div>

        {/* File Listing */}
        <div className="bg-[#0f0f0f] border border-[#333] rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-[#1a1a1a] px-4 py-3 border-b border-[#333] grid grid-cols-12 gap-4 text-xs text-gray-400 font-semibold">
            <div className="col-span-6">NAME</div>
            <div className="col-span-2">SIZE</div>
            <div className="col-span-3">MODIFIED</div>
            <div className="col-span-1">TYPE</div>
          </div>

          {/* Files */}
          <div className="divide-y divide-[#333]">
            {/* Normal files */}
            <div className="px-4 py-3 grid grid-cols-12 gap-4 text-sm hover:bg-[#1a1a1a] transition-colors">
              <div className="col-span-6 flex items-center space-x-2">
                <FileArchive className="w-4 h-4 text-gray-500" />
                <span>intel-reports-2024.tar.gz</span>
              </div>
              <div className="col-span-2 text-gray-400">847 MB</div>
              <div className="col-span-3 text-gray-400">2024-10-23 14:32:11</div>
              <div className="col-span-1 text-gray-400">GZIP</div>
            </div>

            <div className="px-4 py-3 grid grid-cols-12 gap-4 text-sm hover:bg-[#1a1a1a] transition-colors">
              <div className="col-span-6 flex items-center space-x-2">
                <FileArchive className="w-4 h-4 text-gray-500" />
                <span>client-data-backup.zip</span>
              </div>
              <div className="col-span-2 text-gray-400">2.3 GB</div>
              <div className="col-span-3 text-gray-400">2024-11-01 09:15:47</div>
              <div className="col-span-1 text-gray-400">ZIP</div>
            </div>

            {/* The Easter Eggs - Multiple Variants */}
            <div className="px-4 py-3 grid grid-cols-12 gap-4 text-sm bg-red-500/5 hover:bg-red-500/10 transition-colors border-l-4 border-red-500">
              <div className="col-span-6 flex items-center space-x-2">
                <HardDrive className="w-4 h-4 text-red-500 animate-pulse" />
                <span className="text-red-500 font-semibold">shdb.zip</span>
                <span className="text-xs text-red-400 px-2 py-0.5 bg-red-500/20 rounded">⚠ ANOMALY</span>
              </div>
              <div className="col-span-2 text-red-500 font-bold">24.7 TB</div>
              <div className="col-span-3 text-gray-400">2024-11-05 03:00:00</div>
              <div className="col-span-1 text-red-400">ZIP</div>
            </div>

            <div className="px-4 py-3 grid grid-cols-12 gap-4 text-sm bg-red-500/5 hover:bg-red-500/10 transition-colors border-l-4 border-orange-500">
              <div className="col-span-6 flex items-center space-x-2">
                <HardDrive className="w-4 h-4 text-orange-500 animate-pulse" />
                <span className="text-orange-500 font-semibold">uwu_variant.bin</span>
                <span className="text-xs text-orange-400 px-2 py-0.5 bg-orange-500/20 rounded">⚠ CURSED</span>
              </div>
              <div className="col-span-2 text-orange-500 font-bold">18.3 TB</div>
              <div className="col-span-3 text-gray-400">2024-11-05 03:00:01</div>
              <div className="col-span-1 text-orange-400">BIN</div>
            </div>

            <div className="px-4 py-3 grid grid-cols-12 gap-4 text-sm bg-red-500/5 hover:bg-red-500/10 transition-colors border-l-4 border-yellow-500">
              <div className="col-span-6 flex items-center space-x-2">
                <HardDrive className="w-4 h-4 text-yellow-500 animate-pulse" />
                <span className="text-yellow-500 font-semibold">emoji_pasta.tar.gz</span>
                <span className="text-xs text-yellow-400 px-2 py-0.5 bg-yellow-500/20 rounded">⚠ EXCESSIVE</span>
              </div>
              <div className="col-span-2 text-yellow-500 font-bold">31.2 TB</div>
              <div className="col-span-3 text-gray-400">2024-11-05 03:00:02</div>
              <div className="col-span-1 text-yellow-400">GZIP</div>
            </div>

            <div className="px-4 py-3 grid grid-cols-12 gap-4 text-sm bg-red-500/5 hover:bg-red-500/10 transition-colors border-l-4 border-purple-500">
              <div className="col-span-6 flex items-center space-x-2">
                <HardDrive className="w-4 h-4 text-purple-500 animate-pulse" />
                <span className="text-purple-500 font-semibold">navy_seal_erotica.txt</span>
                <span className="text-xs text-purple-400 px-2 py-0.5 bg-purple-500/20 rounded">⚠ WHY</span>
              </div>
              <div className="col-span-2 text-purple-500 font-bold">9.8 TB</div>
              <div className="col-span-3 text-gray-400">2024-11-05 03:00:03</div>
              <div className="col-span-1 text-purple-400">TXT</div>
            </div>

            <div className="px-4 py-3 grid grid-cols-12 gap-4 text-sm bg-red-500/5 hover:bg-red-500/10 transition-colors border-l-4 border-pink-500">
              <div className="col-span-6 flex items-center space-x-2">
                <HardDrive className="w-4 h-4 text-pink-500 animate-pulse" />
                <span className="text-pink-500 font-semibold">vegan_variant.log</span>
                <span className="text-xs text-pink-400 px-2 py-0.5 bg-pink-500/20 rounded">⚠ PEACEFUL</span>
              </div>
              <div className="col-span-2 text-pink-500 font-bold">12.4 TB</div>
              <div className="col-span-3 text-gray-400">2024-11-05 03:00:04</div>
              <div className="col-span-1 text-pink-400">LOG</div>
            </div>

            <div className="px-4 py-3 grid grid-cols-12 gap-4 text-sm hover:bg-[#1a1a1a] transition-colors">
              <div className="col-span-6 flex items-center space-x-2">
                <FileArchive className="w-4 h-4 text-gray-500" />
                <span>logs-archive-q3.tar</span>
              </div>
              <div className="col-span-2 text-gray-400">1.8 GB</div>
              <div className="col-span-3 text-gray-400">2024-09-30 23:59:59</div>
              <div className="col-span-1 text-gray-400">TAR</div>
            </div>
          </div>
        </div>

        {/* File Details Panel */}
        <div className="mt-6 bg-[#0f0f0f] border border-red-500/50 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold mb-2 flex items-center space-x-2">
                <FileArchive className="w-5 h-5 text-red-500" />
                <span>shdb.zip</span>
              </h2>
              <p className="text-sm text-gray-400">Selected File Details</p>
            </div>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="px-4 py-2 bg-red-500/20 text-red-500 border border-red-500/50 rounded hover:bg-red-500/30 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Downloading...' : 'Download'}</span>
            </button>
          </div>

          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-3 gap-4 pb-3 border-b border-[#333]">
              <div>
                <p className="text-gray-500 mb-1">File Size</p>
                <p className="text-red-500 font-mono font-bold">24,696,061,952,000 bytes</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Compression Ratio</p>
                <p className="text-yellow-500 font-mono">0.00001%</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Files Contained</p>
                <p className="font-mono">1</p>
              </div>
            </div>

            <div>
              <p className="text-gray-500 mb-2">Contents:</p>
              <div className="bg-black p-4 rounded font-mono text-xs overflow-x-auto">
                <p className="text-green-400 mb-2">{'>'} unzip -l shdb.zip</p>
                <p className="text-gray-400">Archive:  shdb.zip</p>
                <p className="text-gray-400 ml-4">Length      Date    Time    Name</p>
                <p className="text-gray-400 ml-4">---------  ---------- -----   ----</p>
                <p className="text-red-400 ml-4">24696061952000  2024-11-05 03:00   what_did_you_say_about_me.bin</p>
                <p className="text-gray-400 ml-4">---------                     -------</p>
                <p className="text-red-400 ml-4">24696061952000                     1 file</p>
              </div>
            </div>

            <div>
              <p className="text-gray-500 mb-2">File Header (hex dump - shdb.zip):</p>
              <div className="bg-black p-4 rounded font-mono text-xs overflow-x-auto space-y-1">
                <p className="text-gray-400">00000000: 5768 6174 2074 6865 2066 7563 6b20 6469  What.the.fuck.di</p>
                <p className="text-gray-400">00000010: 6420 796f 7520 6a75 7374 2066 7563 6b69  d.you.just.fucki</p>
                <p className="text-gray-400">00000020: 6e67 2073 6179 2061 626f 7574 206d 6520  ng.say.about.me.</p>
                <p className="text-gray-400">00000030: 796f 7520 6c69 7474 6c65 2062 6974 6368  you.little.bitch</p>
                <p className="text-gray-400">00000040: 3f20 496c 6c20 6861 7665 2079 6f75 206b  ?.Ill.have.you.k</p>
                <p className="text-gray-400">00000050: 6e6f 7720 4920 6772 6164 7561 7465 6420  now.I.graduated.</p>
                <p className="text-gray-400">00000060: 746f 7020 6f66 206d 7920 636c 6173 7320  top.of.my.class.</p>
                <p className="text-gray-400">00000070: 696e 2074 6865 204e 6176 7920 5365 616c  in.the.Navy.Seal</p>
                <p className="text-yellow-500 mt-2">... repeats 82,320,206,506 times ...</p>
                <p className="text-red-500 mt-2 font-bold">... over 300 confirmed kills ...</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-gray-500 mb-2">Other Anomalous Files Detected:</p>
              <div className="bg-black p-4 rounded font-mono text-xs space-y-2">
                <div>
                  <p className="text-orange-400">uwu_variant.bin (18.3 TB)</p>
                  <p className="text-gray-400 ml-4">{">"} What's this? *notices ur gorilla warfare* OwO</p>
                  <p className="text-gray-400 ml-4">{">"} I'll have you knyow I gwaduated top of my cwass...</p>
                  <p className="text-gray-500 ml-4 text-[10px]">Contains: UwU-ified copypasta × 61,000,000,000 repetitions</p>
                </div>

                <div className="mt-2">
                  <p className="text-yellow-400">emoji_pasta.tar.gz (31.2 TB)</p>
                  <p className="text-gray-400 ml-4">{">"} What 😤 the fuck 🖕 did you 👈 just 👏 fucking 🍆 say 🗣️...</p>
                  <p className="text-gray-400 ml-4">{">"} I 💪 have over 💯 300 ✔️ confirmed 💀 kills ☠️...</p>
                  <p className="text-gray-500 ml-4 text-[10px]">Contains: Emoji variant × 104,000,000,000 repetitions</p>
                </div>

                <div className="mt-2">
                  <p className="text-purple-400">navy_seal_erotica.txt (9.8 TB)</p>
                  <p className="text-gray-400 ml-4">{">"} What the fuck did you just say about my body...</p>
                  <p className="text-gray-500 ml-4 text-[10px]">[REDACTED - Extremely NSFW variant]</p>
                  <p className="text-gray-500 ml-4 text-[10px]">Contains: Rule 34 adaptation × 32,666,666,666 repetitions</p>
                </div>

                <div className="mt-2">
                  <p className="text-pink-400">vegan_variant.log (12.4 TB)</p>
                  <p className="text-gray-400 ml-4">{">"} What did you just say about my kale smoothie...</p>
                  <p className="text-gray-400 ml-4">{">"} I'll have you know I rescued over 300 animals...</p>
                  <p className="text-gray-500 ml-4 text-[10px]">Contains: Vegan copypasta parody × 41,333,333,333 repetitions</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#333]">
              <p className="text-xs text-gray-500 italic">
                Note: All files appear to contain copypasta variants repeated in various formats.
                File creation appears to be the result of a catastrophically misconfigured meme scraper.
                Total storage consumed by copypasta: 96.4 TB (99.7% of available storage).
                Estimated time to download shdb.zip on 1Gbps connection: ~57 years.
              </p>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="mt-6 grid md:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#0f0f0f] border border-[#333] rounded p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Server className="w-4 h-4 text-[#00bfb3]" />
              <span className="text-gray-400">Node Status</span>
            </div>
            <p className="font-mono text-yellow-500">⚠ Warning</p>
            <p className="text-gray-500 mt-1">Disk usage: 99.7%</p>
          </div>

          <div className="bg-[#0f0f0f] border border-[#333] rounded p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <span className="text-gray-400">Access Attempts</span>
            </div>
            <p className="font-mono text-red-500">300+</p>
            <p className="text-gray-500 mt-1">Unique IPs (last 24h)</p>
          </div>

          <div className="bg-[#0f0f0f] border border-[#333] rounded p-4">
            <div className="flex items-center space-x-2 mb-2">
              <HardDrive className="w-4 h-4 text-red-500" />
              <span className="text-gray-400">Storage</span>
            </div>
            <p className="font-mono text-red-500">96.7 TB / 97 TB</p>
            <p className="text-gray-500 mt-1">5 copypasta files</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 border-t border-[#333] bg-[#0f0f0f] px-6 py-4 text-xs text-gray-500">
        <p>Elasticsearch 7.17.3 | Kibana 7.17.3 | Node: prod-backup-misc-01</p>
        <p className="mt-1 text-red-500">
          ⚠ This node should not be publicly accessible. Security misconfiguration detected.
        </p>
      </div>
    </div>
  );
}
